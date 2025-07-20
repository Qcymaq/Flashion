import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Checkbox,
  IconButton,
  Button,
  styled,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartContainer = styled(Container)({
  paddingTop: '40px',
  paddingBottom: '40px',
});

const CartHeader = styled(Box)({
  backgroundColor: '#000',
  color: '#fff',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
});

const CartItemCard = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const ProductImage = styled('img')({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '8px',
});

const QuantityControl = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  minWidth: 72,
  height: 32,
  padding: '0 2px',
  background: '#fafafa',
  justifyContent: 'center',
});

const CheckoutButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: '30px',
  padding: '12px 32px',
  '&:hover': {
    backgroundColor: '#333',
  },
});

const CartPage = () => {
  const { cart, loading, error, updateQuantity, removeFromCart, selectedItems, setSelectedItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(event.target.checked);
    setSelectedItems(event.target.checked ? cart?.items.map(item => item._id) || [] : []);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev: string[]) => {
      const newSelected = prev.includes(itemId)
        ? prev.filter((id: string) => id !== itemId)
        : [...prev, itemId];
      setSelectAll(newSelected.length === (cart?.items.length || 0));
      return newSelected;
    });
  };

  const handleQuantityChange = async (itemId: string, delta: number) => {
    try {
      const item = cart?.items.find(item => item._id === itemId);
      if (item) {
        const newQuantity = Math.max(1, item.quantity + delta);
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update quantity',
        severity: 'error',
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setSelectedItems((prev: string[]) => prev.filter((id: string) => id !== itemId));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to remove item',
        severity: 'error',
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn ít nhất một sản phẩm',
        severity: 'error'
      });
      return;
    }
    navigate('/checkout');
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items
      .filter(item => selectedItems.includes(item._id))
      .reduce((total, item) => total + (item.product_price * item.quantity), 0);
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          GIỎ HÀNG CỦA BẠN
        </Typography>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CartContainer maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          GIỎ HÀNG CỦA BẠN
        </Typography>

        <CartHeader>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                />
                <Typography>Sản phẩm</Typography>
              </Box>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Typography>Đơn giá</Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Typography>Số lượng</Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Typography>Thành tiền</Typography>
            </Grid>
          </Grid>
        </CartHeader>

        {cart.items.map((item) => (
          <CartItemCard key={item._id}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                  />
                  <ProductImage src={item.product_image} alt={item.product_name} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.product_name}
                    </Typography>
                    {item.color && item.color.trim() !== '' && (
                      <Typography variant="body2" color="text.secondary">
                        Màu: {item.color}
                      </Typography>
                    )}
                    {item.size && item.size.trim() !== '' && (
                      <Typography variant="body2" color="text.secondary">
                        Kích thước: {item.size}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <Typography>{item.product_price.toLocaleString()}đ</Typography>
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                <QuantityControl>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={() => handleQuantityChange(item._id, -1)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center', fontWeight: 500, fontSize: 16 }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={() => handleQuantityChange(item._id, 1)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </QuantityControl>
              </Grid>
              <Grid item xs={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ flexGrow: 1, textAlign: 'center' }}>
                    {(item.product_price * item.quantity).toLocaleString()}đ
                  </Typography>
                  <IconButton onClick={() => handleRemoveItem(item._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </CartItemCard>
        ))}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              Tổng thanh toán ({selectedItems.length} sản phẩm):{' '}
              <span style={{ color: '#000', fontWeight: 'bold' }}>
                {calculateTotal().toLocaleString()}đ
              </span>
            </Typography>
          </Box>
          <CheckoutButton
            type="button"
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCheckout();
            }}
            disabled={selectedItems.length === 0}
          >
            Thanh toán
          </CheckoutButton>
        </Box>
      </CartContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CartPage; 