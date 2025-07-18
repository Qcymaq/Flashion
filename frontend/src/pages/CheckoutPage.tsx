import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  styled,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

const CheckoutContainer = styled(Container)({
  paddingTop: '40px',
  paddingBottom: '40px',
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

const PaymentMethodButton = styled(Button)({
  width: '100%',
  padding: '16px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  marginBottom: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const CheckoutPage = () => {
  const { cart, loading: cartLoading, error, getSelectedItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.shipping_address || '');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const selectedItems = getSelectedItems();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cartLoading) {
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

  if (!cart || selectedItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          THANH TOÁN
        </Typography>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có sản phẩm nào được chọn
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/cart')}
            sx={{ mt: 2 }}
          >
            Quay lại giỏ hàng
          </Button>
        </Box>
      </Container>
    );
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn phương thức thanh toán',
        severity: 'error'
      });
      return;
    }

    if (!shippingAddress.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập địa chỉ giao hàng',
        severity: 'error'
      });
      return;
    }

    try {
      setIsProcessing(true);
      // Create order
      const orderResponse = await fetchWithAuth(endpoints.orders.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?._id,
          items: selectedItems.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.product_price
          })),
          total_price: selectedItems.reduce((total, item) => total + (item.product_price * item.quantity), 0) + 30000,
          shipping_address: shippingAddress,
          status: 'pending'
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      if (selectedPaymentMethod === 'bank_transfer') {
        // For bank transfer, show confirmation page with order details
        navigate(`/payment-confirmation/${orderData._id}`, {
          state: {
            order: orderData,
            bankDetails: {
              bankName: 'Vietcombank',
              accountNumber: '1234567890',
              accountHolder: 'CÔNG TY TNHH FLASHION',
              amount: orderData.total_price,
              orderId: orderData._id
            }
          }
        });
      } else {
        // For other payment methods (currently disabled)
        setSnackbar({
          open: true,
          message: 'Phương thức thanh toán này đang được triển khai',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý thanh toán',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CheckoutContainer maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          THANH TOÁN
        </Typography>

        <Grid container spacing={4}>
          {/* Order Summary */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              {selectedItems.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <Box
                    component="img"
                    src={item.product_image}
                    alt={item.product_name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{item.product_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đơn giá: {item.product_price.toLocaleString()}đ
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {(item.product_price * item.quantity).toLocaleString()}đ
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin giao hàng
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  {user?.name}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Địa chỉ giao hàng"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng của bạn"
                  sx={{ mt: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Payment Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Phương thức thanh toán
              </Typography>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="momo"
                    control={<Radio />}
                    label={
                      <PaymentMethodButton
                        variant="outlined"
                        onClick={() => setSelectedPaymentMethod('momo')}
                        disabled
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                          <img
                            src="/images/momo.png"
                            alt="MoMo"
                            style={{ height: 24, marginRight: 8 }}
                          />
                          <Typography>Ví MoMo (Đang triển khai)</Typography>
                        </Box>
                      </PaymentMethodButton>
                    }
                  />
                  <FormControlLabel
                    value="vnpay"
                    control={<Radio />}
                    label={
                      <PaymentMethodButton
                        variant="outlined"
                        onClick={() => setSelectedPaymentMethod('vnpay')}
                        disabled
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                          <img
                            src="/images/vnpay.png"
                            alt="VNPay"
                            style={{ height: 24, marginRight: 8 }}
                          />
                          <Typography>VNPay (Đang triển khai)</Typography>
                        </Box>
                      </PaymentMethodButton>
                    }
                  />
                  <FormControlLabel
                    value="bank_transfer"
                    control={<Radio />}
                    label={
                      <PaymentMethodButton
                        variant="outlined"
                        onClick={() => setSelectedPaymentMethod('bank_transfer')}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography>Chuyển khoản ngân hàng</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ngân hàng: Vietcombank
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Số tài khoản: 0631000524772
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Chủ tài khoản: PHAM DANG KHOI
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Nội dung chuyển khoản: Email Flashion (Xuất hiện ở thông tin cá nhân) + Số điện thoại
                          </Typography>
                        </Box>
                      </PaymentMethodButton>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>
                    {selectedItems.reduce((total, item) => total + (item.product_price * item.quantity), 0)
                      .toLocaleString()}đ
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography>30.000đ</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">
                    {(selectedItems.reduce((total, item) => total + (item.product_price * item.quantity), 0) + 30000)
                      .toLocaleString()}đ
                  </Typography>
                </Box>
              </Box>

              <CheckoutButton
                fullWidth
                variant="contained"
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || isProcessing}
                sx={{ mt: 3 }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
              </CheckoutButton>
            </Box>
          </Grid>
        </Grid>
      </CheckoutContainer>

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

export default CheckoutPage; 