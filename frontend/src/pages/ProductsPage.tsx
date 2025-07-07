import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  is_active: boolean;
  stock: number;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Kem nền', label: 'Kem nền' },
    { value: 'Kem che khuyết điểm', label: 'Kem che khuyết điểm' },
    { value: 'Phấn phủ', label: 'Phấn phủ' },
    { value: 'Mascara', label: 'Mascara' },
    { value: 'Chì kẻ chân mày', label: 'Chì kẻ chân mày' },
    { value: 'Phấn mắt', label: 'Phấn mắt' },
    { value: 'Kẻ mắt', label: 'Kẻ mắt' },
    { value: 'Son môi', label: 'Son môi' },
    { value: 'Son dưỡng', label: 'Son dưỡng' },
    { value: 'Chì kẻ môi', label: 'Chì kẻ môi' },
    { value: 'Má hồng', label: 'Má hồng' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá tăng dần' },
    { value: 'price-desc', label: 'Giá giảm dần' },
    { value: 'name-asc', label: 'Tên A-Z' },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (category !== 'all') {
        queryParams.append('category', category);
      }
      queryParams.append('sort', sortBy);
      queryParams.append('page', page.toString());
      
      // Use regular fetch for public endpoint
      const response = await fetch(`${endpoints.products.list}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(event.target.value);
    setPage(1); // Reset to first page when changing category
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page when changing sort
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Sản phẩm
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Danh mục"
              value={category}
              onChange={handleCategoryChange}
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Sắp xếp"
              value={sortBy}
              onChange={handleSortChange}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Typography align="center" color="text.secondary">
          Không tìm thấy sản phẩm nào
        </Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {filteredProducts.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/studio/${product._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0] || '/images/placeholder.png'}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {product.price.toLocaleString('vi-VN')}đ
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        bgcolor: '#000',
                        '&:hover': {
                          bgcolor: '#333'
                        }
                      }}
                      disabled={!product.is_active || product.stock <= 0}
                    >
                      {!product.is_active ? 'Hết hàng' : product.stock <= 0 ? 'Hết hàng' : 'Mua Ngay'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProductsPage; 