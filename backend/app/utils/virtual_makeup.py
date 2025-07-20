import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
import re

class VirtualMakeupProcessor:
    def __init__(self):
        # MediaPipe setup
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # FIXED: Corrected lip landmarks using MediaPipe's standard indices
        # These are the actual lip contour landmarks in MediaPipe FaceMesh
        self.LIPS_LANDMARKS = [
            # Outer lip contour (more accurate)
            61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318,
            # Upper lip
            12, 15, 16, 17, 18, 200, 199, 175, 0, 269, 270, 267, 272, 271, 272,
            # Lower lip  
            14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
            # Additional points for better coverage
            39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321
        ]
        
        # Better lip landmarks - using MediaPipe's official lip indices
        self.UPPER_LIP_LANDMARKS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 415, 310, 311, 312, 13, 82, 81, 80, 78]
        self.LOWER_LIP_LANDMARKS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
        
        # Combine both for full lips
        self.FULL_LIPS_LANDMARKS = list(set(self.UPPER_LIP_LANDMARKS + self.LOWER_LIP_LANDMARKS))
        
        # Updated cheek landmarks for more natural placement
        self.LEFT_CHEEK_LANDMARKS = [
            116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147,
            123, 116, 117, 118, 119, 120, 121, 126, 142,
            215, 138, 135, 210, 169, 170, 140, 33, 7, 163, 144, 145
        ]
        
        self.RIGHT_CHEEK_LANDMARKS = [
            345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376,
            352, 345, 346, 347, 348, 349, 350, 355, 371,
            435, 367, 364, 430, 394, 395, 369, 262, 249, 390, 373, 374
        ]

    def parse_color_to_bgr(self, color_value):
        """Convert color from various formats to BGR"""
        try:
            if not isinstance(color_value, str):
                color_value = str(color_value)
            
            # Handle named colors with expanded color map
            color_map = {
                'red': '#FF0000',
                'pink': '#FF69B4',
                'nude': '#E3BC9A',
                'coral': '#FF7F50',
                'burgundy': '#800020',
                'light': '#FFE4E1',
                'medium': '#DEB887',
                'dark': '#4B0082',
                'tan': '#D2B48C',
                'beige': '#F5F5DC',
                'black': '#000000',
                'white': '#FFFFFF',
                'blue': '#0000FF',
                'green': '#008000',
                'yellow': '#FFFF00',
                'purple': '#800080',
                'orange': '#FFA500',
                'brown': '#A52A2A',
                'gray': '#808080',
                'gold': '#FFD700',
                'silver': '#C0C0C0',
                'rose gold': '#B76E79'
            }
            
            # Convert color name to hex if it's a named color (case insensitive)
            color_value_lower = color_value.lower()
            if color_value_lower in color_map:
                print(f"Converting named color '{color_value}' to hex: {color_map[color_value_lower]}")
                color_value = color_map[color_value_lower]
            
            # Handle RGBA format
            if color_value.startswith('rgba(') and color_value.endswith(')'):
                rgba_content = color_value[5:-1]
                values = [float(x.strip()) for x in rgba_content.split(',')]
                
                if len(values) >= 3:
                    r = int(min(255, max(0, values[0])))
                    g = int(min(255, max(0, values[1])))
                    b = int(min(255, max(0, values[2])))
                    print(f"Converted RGBA color {color_value} to BGR: ({b}, {g}, {r})")
                    return (b, g, r)
            
            # Handle RGB format
            elif color_value.startswith('rgb(') and color_value.endswith(')'):
                rgb_content = color_value[4:-1]
                values = [float(x.strip()) for x in rgb_content.split(',')]
                
                if len(values) >= 3:
                    r = int(min(255, max(0, values[0])))
                    g = int(min(255, max(0, values[1])))
                    b = int(min(255, max(0, values[2])))
                    print(f"Converted RGB color {color_value} to BGR: ({b}, {g}, {r})")
                    return (b, g, r)
            
            # Handle Hex format
            else:
                bgr = self.hex_to_bgr(color_value)
                print(f"Converted hex color {color_value} to BGR: {bgr}")
                return bgr
                
        except Exception as e:
            print(f"Error parsing color {color_value}: {str(e)}")
            # Return a more neutral default color (light pink) instead of red
            return (180, 105, 255)  # Light pink in BGR
    
    def hex_to_bgr(self, hex_color):
        """Convert hex color to BGR"""
        try:
            if not isinstance(hex_color, str):
                hex_color = str(hex_color)
            
            # Remove '#' if present
            if hex_color.startswith('#'):
                hex_color = hex_color[1:]
            
            # Handle shorthand hex (e.g., #FFF)
            if len(hex_color) == 3:
                hex_color = ''.join([c*2 for c in hex_color])
            
            # Validate hex format
            if not re.match(r'^[0-9A-Fa-f]{6}$', hex_color):
                print(f"Invalid hex color format: {hex_color}")
                return (180, 105, 255)  # Light pink in BGR
            
            # Convert to BGR
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            
            print(f"Converted hex {hex_color} to BGR: ({b}, {g}, {r})")
            return (b, g, r)
            
        except Exception as e:
            print(f"Error converting hex color {hex_color}: {str(e)}")
            return (180, 105, 255)  # Light pink in BGR
        
    def get_landmarks(self, image):
        """Get facial landmarks from image"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_image)
            
            if results.multi_face_landmarks:
                landmarks = []
                for face_landmarks in results.multi_face_landmarks:
                    h, w = image.shape[:2]
                    for landmark in face_landmarks.landmark:
                        x = int(landmark.x * w)
                        y = int(landmark.y * h)
                        landmarks.append((x, y))
                return landmarks
            return None
        except Exception as e:
            return None
    
    def get_lip_contour(self, landmarks):
        """Get accurate lip contour points"""
        try:
            # More accurate lip landmarks for MediaPipe FaceMesh
            outer_lip_indices = [
                61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318,
                402, 317, 14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415
            ]
            
            inner_lip_indices = [
                78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 320, 307, 375, 321, 
                12, 15, 16, 17, 18, 200, 199, 175, 0, 269, 270, 267, 272, 271
            ]
            
            # Use outer contour for better coverage
            lip_points = []
            for idx in outer_lip_indices:
                if idx < len(landmarks):
                    lip_points.append(landmarks[idx])
            
            return lip_points
        except Exception as e:
            return []
    
    def create_natural_cheek_area(self, landmarks, is_left=True):
        """Create natural oval-shaped cheek area with reduced size"""
        try:
            if is_left:
                key_points = [116, 117, 118, 50, 36, 205, 206, 207, 213, 192, 147]
            else:
                key_points = [345, 346, 347, 280, 266, 425, 426, 427, 436, 416, 376]
            
            points = []
            for idx in key_points:
                if idx < len(landmarks):
                    points.append(landmarks[idx])
            
            if len(points) < 4:
                return []
                
            center_x = sum(p[0] for p in points) / len(points)
            center_y = sum(p[1] for p in points) / len(points)
            
            oval_points = []
            # Reduced size for more natural look
            a = 35  # Horizontal radius
            b = 25  # Vertical radius
            
            for angle in range(0, 360, 20):
                rad = np.radians(angle)
                x = int(center_x + a * np.cos(rad))
                y = int(center_y + b * np.sin(rad))
                oval_points.append((x, y))
            
            return oval_points
        except Exception as e:
            return []
    
    def apply_makeup_with_gradient(self, image, landmarks, area_landmarks, color, intensity, makeup_type):
        """Apply makeup with natural gradient - IMPROVED"""
        try:
            if not landmarks or intensity == 0:
                return image
                
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            
            if area_landmarks == "LEFT_CHEEK":
                points = self.create_natural_cheek_area(landmarks, is_left=True)
            elif area_landmarks == "RIGHT_CHEEK":
                points = self.create_natural_cheek_area(landmarks, is_left=False)
            elif area_landmarks == "LIPS":
                # Use improved lip contour
                points = self.get_lip_contour(landmarks)
            else:
                # Handle list of landmark indices
                points = []
                for idx in area_landmarks:
                    if idx < len(landmarks):
                        points.append(landmarks[idx])
                    
            if len(points) < 3:
                return image
                
            points = np.array(points, dtype=np.int32)
            
            # Create convex hull for better shape
            if makeup_type == "lips":
                # For lips, use the points as-is for more natural shape
                cv2.fillPoly(mask, [points], 255)
            else:
                # For cheeks, use convex hull
                hull = cv2.convexHull(points)
                cv2.fillPoly(mask, [hull], 255)
            
            # Adjust blur based on makeup type and image size
            if makeup_type == "lips":
                # Less blur for lips to maintain shape definition
                kernel_size = max(3, int(min(image.shape[:2]) * 0.008))
            else:
                # More blur for cheeks for natural blending
                kernel_size = max(15, int(min(image.shape[:2]) * 0.025))
                
            if kernel_size % 2 == 0:
                kernel_size += 1
            mask = cv2.GaussianBlur(mask, (kernel_size, kernel_size), 0)
            
            # Apply color with better blending
            color_layer = np.full_like(image, color, dtype=np.uint8)
            mask_3d = np.stack([mask/255.0] * 3, axis=2)
            intensity_factor = intensity / 100.0
            
            if makeup_type == "lips":
                # Better lip color blending - use multiply and overlay blend modes
                alpha = intensity_factor * 0.7
                
                # Convert to float for better blending
                image_float = image.astype(np.float64)
                color_float = color_layer.astype(np.float64)
                
                # Multiply blend for more natural lip color
                multiply_blend = (image_float * color_float) / 255.0
                
                # Combine with original
                result = image_float * (1 - mask_3d * alpha) + multiply_blend * mask_3d * alpha
                result = np.clip(result, 0, 255).astype(np.uint8)
            else:
                # Cheek blending
                alpha = intensity_factor * 0.4
                result = image * (1 - mask_3d * alpha) + color_layer * mask_3d * alpha
                result = result.astype(np.uint8)
            
            return result
        except Exception as e:
            print(f"Error in apply_makeup_with_gradient: {e}")
            return image
        
    def apply_makeup(self, image, lips_color, lips_intensity, cheeks_color, cheeks_intensity):
        """Apply makeup to image - IMPROVED"""
        try:
            if image is None:
                return None
                
            if isinstance(image, Image.Image):
                image = np.array(image)
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            result_image = image.copy()
            
            landmarks = self.get_landmarks(result_image)
            
            if landmarks:
                print(f"Found {len(landmarks)} landmarks")
                
                lips_bgr = self.parse_color_to_bgr(lips_color)
                cheeks_bgr = self.parse_color_to_bgr(cheeks_color)
                
                # Apply cheeks first, then lips
                if cheeks_intensity > 0:
                    result_image = self.apply_makeup_with_gradient(
                        result_image, landmarks, "LEFT_CHEEK", 
                        cheeks_bgr, cheeks_intensity, "cheeks"
                    )
                    result_image = self.apply_makeup_with_gradient(
                        result_image, landmarks, "RIGHT_CHEEK", 
                        cheeks_bgr, cheeks_intensity, "cheeks"
                    )
                
                if lips_intensity > 0:
                    # Use the improved lip application
                    result_image = self.apply_makeup_with_gradient(
                        result_image, landmarks, "LIPS", 
                        lips_bgr, lips_intensity, "lips"
                    )
            else:
                print("No landmarks detected")
            
            result_image = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)
            return Image.fromarray(result_image)
            
        except Exception as e:
            print(f"Error in apply_makeup: {e}")
            return image if isinstance(image, Image.Image) else Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
