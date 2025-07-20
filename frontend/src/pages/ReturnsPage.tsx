import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Info,
} from '@mui/icons-material';

const ReturnsPage: React.FC = () => {
  const returnPolicy = [
    {
      title: 'Thời Gian Đổi Trả',
      content: 'Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng.',
      icon: <Info sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Điều Kiện Đổi Trả',
      content: 'Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng, có đầy đủ phụ kiện và bao bì gốc.',
      icon: <CheckCircle sx={{ color: 'success.main' }} />,
    },
    {
      title: 'Không Được Đổi Trả',
      content: 'Sản phẩm đã qua sử dụng, bị hư hỏng, thiếu phụ kiện hoặc bao bì gốc.',
      icon: <Cancel sx={{ color: 'error.main' }} />,
    },
    {
      title: 'Quy Trình Đổi Trả',
      content: 'Liên hệ với chúng tôi qua hotline hoặc email để được hướng dẫn quy trình đổi trả.',
      icon: <Info sx={{ color: 'primary.main' }} />,
    },
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'Liên Hệ Hỗ Trợ',
              content: 'Gọi đến hotline 0819994722 hoặc gửi email đến support@flashion.com để thông báo về việc đổi trả.',
    },
    {
      step: 2,
      title: 'Đóng Gói Sản Phẩm',
      content: 'Đóng gói sản phẩm cẩn thận với đầy đủ phụ kiện và bao bì gốc.',
    },
    {
      step: 3,
      title: 'Gửi Sản Phẩm',
      content: 'Gửi sản phẩm về địa chỉ của chúng tôi theo hướng dẫn từ bộ phận hỗ trợ.',
    },
    {
      step: 4,
      title: 'Kiểm Tra và Xử Lý',
      content: 'Chúng tôi sẽ kiểm tra sản phẩm và xử lý đổi trả trong vòng 3-5 ngày làm việc.',
    },
  ];

  const refundPolicy = [
    {
      title: 'Hoàn Tiền',
      content: 'Số tiền hoàn lại sẽ được chuyển vào tài khoản của bạn trong vòng 3-5 ngày làm việc sau khi chúng tôi nhận được sản phẩm trả về.',
      icon: <Info sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Phí Vận Chuyển',
      content: 'Phí vận chuyển cho việc đổi trả sẽ được tính dựa trên khoảng cách và phương thức vận chuyển.',
      icon: <Warning sx={{ color: 'warning.main' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Chính Sách Đổi Trả
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Chính Sách Chung
            </Typography>
            <List>
              {returnPolicy.map((policy, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {policy.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {policy.title}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={policy.content}
                    sx={{ mt: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Quy Trình Đổi Trả
            </Typography>
            <List>
              {returnSteps.map((step, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="primary">
                      Bước {step.step}:
                    </Typography>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {step.title}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={step.content}
                    sx={{ mt: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Chính Sách Hoàn Tiền
            </Typography>
            <List>
              {refundPolicy.map((policy, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {policy.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {policy.title}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={policy.content}
                    sx={{ mt: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </Typography>
      </Box>
    </Container>
  );
};

export default ReturnsPage; 