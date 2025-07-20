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
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import { 
  ContentCopy, 
  CheckCircle, 
  ExpandMore as ExpandMoreIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

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
    color?: string;
  }>;
  total_price: number;
  shipping_address: string;
  phone_number?: string;
  created_at: string;
  status: string;
  user_id: string;
}

const PaymentConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [copied, setCopied] = React.useState<string | null>(null);
  const { user } = useAuth();

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

  // Generate transfer content using order's phone number and user's name (bank-friendly format)
  const generateTransferContent = () => {
    const orderPhone = order.phone_number;
    const userName = user?.name;
    
    console.log('Debug transfer content:', {
      orderPhone,
      userName,
      orderId
    });
    
    // Since checkout requires phone number, we should always have both name and phone
    if (userName && orderPhone) {
      // Remove special characters and spaces, use only alphanumeric characters
      const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const cleanPhone = orderPhone.replace(/[^0-9]/g, '');
      return `FLASHION ${cleanName} ${cleanPhone}`;
    } else {
      // Fallback to order ID if something is missing (shouldn't happen in normal flow)
      return `FLASHION ${orderId}`;
    }
  };

  const transferContent = generateTransferContent();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BankIcon sx={{ mr: 1 }} />
                    <Typography fontWeight={600}>Chuyển khoản ngân hàng</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Vietcombank
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>Số tài khoản:</Typography>
                          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                            0631000524772
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy('0631000524772', 'account')}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>Chủ tài khoản:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            PHAM DANG KHOI
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>Nội dung:</Typography>
                          <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                            {transferContent}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy(transferContent, 'content')}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          QR Code thanh toán
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <img 
                            src="/images/vietcombank-qr.png" 
                            alt="QR Code" 
                            style={{ width: 150, height: 150 }}
                          />
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>

                  {copied && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Đã sao chép: {copied === 'account' ? 'Số tài khoản' : 'Nội dung chuyển khoản'}
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                <Typography variant="h6" sx={{ color: '#856404', mb: 1 }}>
                  Số tiền cần chuyển: {bankDetails.amount.toLocaleString()}đ
                </Typography>
                <Typography variant="body2" sx={{ color: '#856404' }}>
                  ⚠️ Lưu ý: Vui lòng chuyển khoản chính xác số tiền và ghi đúng nội dung để đơn hàng được xử lý nhanh chóng.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Card sx={{ bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mã đơn hàng:</strong> {orderId}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Địa chỉ giao hàng:</strong> {order.shipping_address}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Sản phẩm đã đặt:</strong>
                  </Typography>
                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 1, pl: 2 }}>
                      <Typography variant="body2">
                        • {item.product_name} x {item.quantity} - {(item.price * item.quantity).toLocaleString()}đ
                        {item.color && (
                          <span style={{ color: '#666', marginLeft: '8px' }}>
                            (Màu: {item.color})
                          </span>
                        )}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Tổng cộng: {order.total_price.toLocaleString()}đ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sau khi chuyển khoản thành công, chúng tôi sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/orders')}
              >
                Xem đơn hàng của tôi
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default PaymentConfirmationPage; 