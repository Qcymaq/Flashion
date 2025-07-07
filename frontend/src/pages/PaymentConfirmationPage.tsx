import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  orderId: string;
}

interface Order {
  _id: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  shipping_address: string;
  created_at: string;
  status: string;
  user_id: string;
}

const PaymentConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [copied, setCopied] = React.useState(false);

  // Check if location.state exists and has the required properties
  if (!location.state || !('order' in location.state) || !('bankDetails' in location.state)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Không tìm thấy thông tin đơn hàng. Vui lòng quay lại trang thanh toán.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/checkout')}
        >
          Quay lại trang thanh toán
        </Button>
      </Container>
    );
  }

  const { order, bankDetails } = location.state as { order: Order; bankDetails: BankDetails };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTransferContent = () => {
    navigator.clipboard.writeText(`FLASHION ${orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Xác nhận thanh toán
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng của bạn.
          </Alert>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin chuyển khoản
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Ngân hàng:</strong> {bankDetails.bankName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Số tài khoản:</strong> {bankDetails.accountNumber}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                    onClick={handleCopyAccountNumber}
                  >
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Chủ tài khoản:</strong> {bankDetails.accountHolder}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Nội dung chuyển khoản:</strong> FLASHION {orderId}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                    onClick={handleCopyTransferContent}
                  >
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </Box>
                <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                  Số tiền: {bankDetails.amount.toLocaleString()}đ
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Mã đơn hàng:</strong> {orderId}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Địa chỉ giao hàng:</strong> {order.shipping_address}
                </Typography>
                <Divider sx={{ my: 2 }} />
                {order.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {item.product_name} x {item.quantity} - {(item.price * item.quantity).toLocaleString()}đ
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  Tổng cộng: {order.total_price.toLocaleString()}đ
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sau khi chuyển khoản thành công, chúng tôi sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/orders')}
              sx={{ mt: 2 }}
            >
              Xem đơn hàng của tôi
            </Button>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default PaymentConfirmationPage; 