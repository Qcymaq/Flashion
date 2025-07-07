import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import { CameraAlt as CameraAltIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  colors: string[];
  category: string;
}

const TryOnPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    // Check if we have product info from URL parameters
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('productId');
    const color = params.get('color');
    const name = params.get('name');
    const image = params.get('image');
    const price = params.get('price');
    const colorIndex = params.get('colorIndex');

    console.log('Received color from URL:', color); // Debug log

    if (productId && color && name && image && price) {
      // If we have product info from URL, set it as the selected product
      const productData = {
        _id: productId,
        name: name,
        description: '',
        price: parseFloat(price),
        image_url: image,
        colors: [color], // Only include the available color
        category: ''
      };
      console.log('Setting product data:', productData); // Debug log
      setSelectedProduct(productData);
      // Set the selected color immediately
      console.log('Setting selected color to:', color); // Debug log
      setSelectedColor(color);
    } else {
      // Otherwise fetch all products
      fetchProducts();
    }
  }, []);

  // Add a new effect to handle color updates
  useEffect(() => {
    if (selectedProduct && selectedProduct.colors.length > 0) {
      console.log('Product colors updated:', selectedProduct.colors);
      console.log('Current selected color:', selectedColor);
      // If the selected color is not in the product's colors, set it to the first available color
      if (!selectedProduct.colors.includes(selectedColor)) {
        console.log('Selected color not in product colors, setting to:', selectedProduct.colors[0]);
        setSelectedColor(selectedProduct.colors[0]);
      }
    }
  }, [selectedProduct, selectedColor]);

  const fetchProducts = async () => {
    try {
      const response = await fetchWithAuth(endpoints.products.list);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setSnackbar({
        open: true,
        message: 'Không thể truy cập camera',
        severity: 'error',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setSelectedImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('Selected product:', product); // Debug log
    setSelectedProduct(product);
    // When selecting a new product, set the first color as default
    if (product.colors && product.colors.length > 0) {
      console.log('Setting default color to:', product.colors[0]); // Debug log
      setSelectedColor(product.colors[0]);
    }
  };

  const handleColorSelect = (color: string) => {
    console.log('Color selected:', color); // Debug log
    if (selectedProduct && selectedProduct.colors.includes(color)) {
      setSelectedColor(color);
    }
  };

  const handleTryOn = async () => {
    if (!selectedImage || !selectedProduct || !selectedColor) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn ảnh, sản phẩm và màu sắc',
        severity: 'error',
      });
      return;
    }

    try {
      // Here you would implement the actual try-on logic
      // For now, we'll just show a success message
      setSnackbar({
        open: true,
        message: 'Đang xử lý thử đồ ảo...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error during try-on:', error);
      setSnackbar({
        open: true,
        message: 'Không thể thực hiện thử đồ ảo',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Thử đồ ảo
      </Typography>

      <Grid container spacing={4}>
        {/* Image Upload/Capture Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Tải ảnh lên hoặc chụp ảnh
            </Typography>
            {selectedImage ? (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <img
                  src={selectedImage}
                  alt="Selected"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setSelectedImage(null)}
                  sx={{ mt: 2 }}
                >
                  Chọn ảnh khác
                </Button>
              </Box>
            ) : (
              <Box>
                {isCameraActive ? (
                  <Box sx={{ position: 'relative' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ maxWidth: '100%', maxHeight: '400px' }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={captureImage}
                        sx={{ mr: 2 }}
                      >
                        Chụp ảnh
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={stopCamera}
                      >
                        Hủy
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                    />
                    <Button
                      variant="contained"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ mr: 2 }}
                    >
                      Tải ảnh lên
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAltIcon />}
                      onClick={startCamera}
                    >
                      Chụp ảnh
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product Selection Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Chọn sản phẩm
            </Typography>
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} key={product._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedProduct?._id === product._id ? '2px solid #1976d2' : 'none',
                    }}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.image_url}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.price.toLocaleString()}đ
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.name}
                </Typography>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Màu sắc:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedProduct.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'contained' : 'outlined'}
                      onClick={() => handleColorSelect(color)}
                      sx={{
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        padding: 0,
                        margin: '0 4px',
                        backgroundColor: color,
                        border: '2px solid',
                        borderColor: selectedColor === color ? 'primary.main' : 'transparent',
                        '&:hover': {
                          backgroundColor: color,
                          opacity: 0.8
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleTryOn}
              disabled={!selectedImage || !selectedProduct || !selectedColor}
            >
              Thử đồ ảo
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TryOnPage; 