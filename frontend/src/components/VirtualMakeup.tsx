import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Slider,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ColorResult, SketchPicker } from 'react-color';
import { Camera, Upload, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Input = styled('input')({
  display: 'none',
});

const PreviewImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '500px',
  objectFit: 'contain',
});

const VideoPreview = styled('video')({
  width: '100%',
  height: 'auto',
  maxHeight: '500px',
  objectFit: 'contain',
});

const ColorPickerContainer = styled(Box)({
  marginTop: '1rem',
  marginBottom: '1rem',
});

const API_URL = 'http://localhost:8000/api';

interface VirtualMakeupProps {
  productId?: string;
  productColor?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  productCategory?: string;
}

type MakeupType = 'lips' | 'cheeks' | 'both';

const VirtualMakeup: React.FC<VirtualMakeupProps> = ({ 
  productId,
  productColor, 
  productName,
  productImage,
  productPrice,
  productCategory 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [makeupType, setMakeupType] = useState<MakeupType>('lips');
  const [lipsColor, setLipsColor] = useState(productColor || '#DC143C');
  const [cheeksColor, setCheeksColor] = useState('#FF69B4');
  const [lipsIntensity, setLipsIntensity] = useState(65);
  const [cheeksIntensity, setCheeksIntensity] = useState(35);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set makeup type based on product category
  useEffect(() => {
    if (productCategory) {
      if (productCategory.toLowerCase() === 'son môi') {
        setMakeupType('lips');
        setCheeksIntensity(0); // Disable cheeks for lip products
      } else if (productCategory.toLowerCase() === 'má hồng') {
        setMakeupType('cheeks');
        setLipsIntensity(0); // Disable lips for cheek products
      }
    }
  }, [productCategory]);

  // Update lipsColor when productColor changes
  useEffect(() => {
    if (productColor) {
      console.log('Setting product color:', productColor);
      if (productCategory?.toLowerCase() === 'son môi') {
        setLipsColor(productColor);
        setCheeksColor('#FF69B4'); // Reset cheeks color for lip products
      } else if (productCategory?.toLowerCase() === 'má hồng') {
        setCheeksColor(productColor);
        setLipsColor('#DC143C'); // Reset lips color for cheek products
      }
    }
  }, [productColor, productCategory]);

  const handleInputModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'upload' | 'camera' | null
  ) => {
    if (newMode !== null) {
      setInputMode(newMode);
      if (newMode === 'camera') {
        startCamera();
      } else {
        stopCamera();
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // You might want to show an error message to the user here
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageUrl);
        setResultImage(null);
        stopCamera();
        setInputMode('upload');
      }
    }
  };

  const handleImageUpload = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      formData.append('t', Date.now().toString());
      
      const response = await fetch(`${API_URL}/virtual-makeup/try-makeup`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'image/jpeg',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to process image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    if (resultImage) {
      URL.revokeObjectURL(resultImage);
    }
    setResultImage(null);
    setLipsColor('#DC143C');
    setCheeksColor('#FF69B4');
    setLipsIntensity(65);
    setCheeksIntensity(35);
    setMakeupType('both');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLipsColorChange = (color: ColorResult) => {
    const newColor = color.hex;
    console.log('Setting new lip color:', newColor);
    setLipsColor(newColor);
    if (selectedImage) {
      const formData = new FormData();
      const file = dataURLtoFile(selectedImage, 'image.jpg');
      formData.append('image', file);
      formData.append('lips_color', newColor);
      formData.append('lips_intensity', lipsIntensity.toString());
      formData.append('cheeks_color', cheeksColor);
      formData.append('cheeks_intensity', cheeksIntensity.toString());
      formData.append('makeup_type', makeupType);
      handleImageUpload(formData);
    }
  };

  const handleCheeksColorChange = (color: ColorResult) => {
    const newColor = color.hex;
    setCheeksColor(newColor);
    if (selectedImage) {
      const formData = new FormData();
      const file = dataURLtoFile(selectedImage, 'image.jpg');
      formData.append('image', file);
      formData.append('lips_color', lipsColor);
      formData.append('lips_intensity', lipsIntensity.toString());
      formData.append('cheeks_color', newColor);
      formData.append('cheeks_intensity', cheeksIntensity.toString());
      formData.append('makeup_type', makeupType);
      handleImageUpload(formData);
    }
  };

  const handleLipsIntensityChange = (_: Event, value: number | number[]) => {
    const newIntensity = value as number;
    setLipsIntensity(newIntensity);
    if (selectedImage) {
      const formData = new FormData();
      const file = dataURLtoFile(selectedImage, 'image.jpg');
      formData.append('image', file);
      formData.append('lips_color', lipsColor);
      formData.append('lips_intensity', newIntensity.toString());
      formData.append('cheeks_color', cheeksColor);
      formData.append('cheeks_intensity', cheeksIntensity.toString());
      formData.append('makeup_type', makeupType);
      handleImageUpload(formData);
    }
  };

  const handleCheeksIntensityChange = (_: Event, value: number | number[]) => {
    const newIntensity = value as number;
    setCheeksIntensity(newIntensity);
    if (selectedImage) {
      const formData = new FormData();
      const file = dataURLtoFile(selectedImage, 'image.jpg');
      formData.append('image', file);
      formData.append('lips_color', lipsColor);
      formData.append('lips_intensity', lipsIntensity.toString());
      formData.append('cheeks_color', cheeksColor);
      formData.append('cheeks_intensity', newIntensity.toString());
      formData.append('makeup_type', makeupType);
      handleImageUpload(formData);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setResultImage(null);
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('lips_color', lipsColor);
        formData.append('lips_intensity', lipsIntensity.toString());
        formData.append('cheeks_color', cheeksColor);
        formData.append('cheeks_intensity', cheeksIntensity.toString());
        formData.append('makeup_type', makeupType);
        handleImageUpload(formData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMakeupTypeChange = (type: "lips" | "cheeks" | "both") => {
    // Only allow changing makeup type if no product category is specified
    if (!productCategory) {
      setMakeupType(type);
      if (selectedImage) {
        const formData = new FormData();
        const file = dataURLtoFile(selectedImage, 'image.jpg');
        formData.append('image', file);
        formData.append('lips_color', lipsColor);
        formData.append('lips_intensity', lipsIntensity.toString());
        formData.append('cheeks_color', cheeksColor);
        formData.append('cheeks_intensity', cheeksIntensity.toString());
        formData.append('makeup_type', type);
        handleImageUpload(formData);
      }
    }
  };

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      if (resultImage) {
        URL.revokeObjectURL(resultImage);
      }
    };
  }, [resultImage]);

  // Function to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleAddToCart = async () => {
    if (!productId) {
      setCartMessage('Không tìm thấy thông tin sản phẩm');
      return;
    }

    if (!isAuthenticated) {
      setCartMessage('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      await addToCart(productId, 1, productColor);
      setCartMessage('Đã thêm sản phẩm vào giỏ hàng thành công!');
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      setCartMessage('Có lỗi xảy ra khi thêm vào giỏ hàng');
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {productName ? `Thử ${productName}` : 'Thử Trang Điểm Ảo'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cartMessage && (
        <Alert 
          severity={cartMessage.includes('thành công') ? 'success' : 'warning'} 
          sx={{ mb: 2 }}
          onClose={() => setCartMessage(null)}
        >
          {cartMessage}
        </Alert>
      )}

      {productName && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="300"
                image={productImage || '/images/placeholder.png'}
                alt={productName}
                sx={{ objectFit: 'contain', p: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {productName}
                </Typography>
                {productPrice && (
                  <Typography variant="h6" color="primary" gutterBottom>
                    {productPrice.toLocaleString('vi-VN')}đ
                  </Typography>
                )}
                {productColor && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Typography>Màu sản phẩm:</Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: productColor,
                        border: '2px solid #ccc',
                      }}
                    />
                  </Box>
                )}
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleAddToCart}
                  disabled={!productId}
                >
                  Thêm vào giỏ hàng
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Hướng dẫn thử màu
              </Typography>
              <Typography variant="body1" paragraph>
                1. Chọn loại trang điểm bạn muốn thử (son môi hoặc má hồng)
              </Typography>
              <Typography variant="body1" paragraph>
                2. Tải ảnh lên hoặc sử dụng camera để chụp ảnh
              </Typography>
              <Typography variant="body1" paragraph>
                3. Điều chỉnh độ đậm của màu sắc theo ý muốn
              </Typography>
              <Typography variant="body1" paragraph>
                4. Xem kết quả và so sánh với màu sản phẩm thật
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chọn loại trang điểm
            </Typography>
            
            {/* Makeup Type Selection - Only show if no product category */}
            {!productCategory && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Loại trang điểm
                </Typography>
                <ToggleButtonGroup
                  value={makeupType}
                  exclusive
                  onChange={(_, value) => value && handleMakeupTypeChange(value)}
                  fullWidth
                >
                  <ToggleButton value="lips">Son môi</ToggleButton>
                  <ToggleButton value="cheeks">Má hồng</ToggleButton>
                  <ToggleButton value="both">Cả hai</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={inputMode}
                exclusive
                onChange={handleInputModeChange}
                aria-label="input mode"
                fullWidth
              >
                <ToggleButton value="upload" aria-label="upload image">
                  <Upload style={{ marginRight: 8 }} />
                  Tải ảnh lên
                </ToggleButton>
                <ToggleButton value="camera" aria-label="use camera">
                  <Camera style={{ marginRight: 8 }} />
                  Camera
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {inputMode === 'upload' ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <label htmlFor="image-upload">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <Button variant="contained" component="span" fullWidth>
                      Chọn ảnh
                    </Button>
                  </label>
                </Box>

                {selectedImage && (
                  <PreviewImage src={selectedImage} alt="Selected" />
                )}
              </>
            ) : (
              <>
                <VideoPreview
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ display: isCameraActive ? 'block' : 'none' }}
                />
                {isCameraActive && (
                  <Button
                    variant="contained"
                    onClick={captureFromCamera}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Chụp ảnh
                  </Button>
                )}
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Điều chỉnh màu sắc
            </Typography>

            {/* Color Pickers */}
            {(makeupType === 'lips' || makeupType === 'both') && !productCategory?.toLowerCase().includes('má hồng') && (
              <ColorPickerContainer>
                <Typography variant="subtitle1" gutterBottom>
                  Màu son môi
                </Typography>
                {/* Ẩn color picker nếu có sản phẩm */}
                {!productCategory ? (
                  <SketchPicker
                    color={lipsColor}
                    onChange={handleLipsColorChange}
                    disableAlpha
                  />
                ) : null}
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Độ đậm
                </Typography>
                <Slider
                  value={lipsIntensity}
                  onChange={handleLipsIntensityChange}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </ColorPickerContainer>
            )}

            {(makeupType === 'cheeks' || makeupType === 'both') && !productCategory?.toLowerCase().includes('son môi') && (
              <ColorPickerContainer>
                <Typography variant="subtitle1" gutterBottom>
                  Màu má hồng
                </Typography>
                {/* Ẩn color picker nếu có sản phẩm */}
                {!productCategory ? (
                  <SketchPicker
                    color={cheeksColor}
                    onChange={handleCheeksColorChange}
                    disableAlpha
                  />
                ) : null}
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Độ đậm
                </Typography>
                <Slider
                  value={cheeksIntensity}
                  onChange={handleCheeksIntensityChange}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </ColorPickerContainer>
            )}

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedImage) {
                    const formData = new FormData();
                    const file = dataURLtoFile(selectedImage, 'image.jpg');
                    formData.append('image', file);
                    formData.append('makeup_type', makeupType);
                    formData.append('lips_color', lipsColor);
                    formData.append('lips_intensity', lipsIntensity.toString());
                    formData.append('cheeks_color', cheeksColor);
                    formData.append('cheeks_intensity', cheeksIntensity.toString());

                    handleImageUpload(formData);
                  }
                }}
                disabled={!selectedImage || loading}
                fullWidth
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Thử ngay'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={!selectedImage || loading}
                fullWidth
                sx={{ flex: 1 }}
              >
                Đặt lại
              </Button>
            </Box>
          </Paper>
        </Grid>

        {resultImage && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Kết quả
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={resultImage}
                  alt="Processed"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                  onClick={() => setResultImage(null)}
                >
                  <X />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default VirtualMakeup; 