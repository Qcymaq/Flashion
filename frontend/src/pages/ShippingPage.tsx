import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LocalShipping,
  AccessTime,
  LocationOn,
  Payment,
  Warning,
} from '@mui/icons-material';

const ShippingPage: React.FC = () => {
  const shippingMethods = [
    {
      title: 'Giao Hàng Tiêu Chuẩn',
      content: 'Giao hàng trong vòng 2-3 ngày làm việc',
      price: '30.000đ',
      icon: <LocalShipping sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Giao Hàng Nhanh',
      content: 'Giao hàng trong vòng 1-2 ngày làm việc',
      price: '50.000đ',
      icon: <LocalShipping sx={{ color: 'success.main' }} />,
    },
    {
      title: 'Giao Hàng Siêu Tốc',
      content: 'Giao hàng trong vòng 24 giờ',
      price: '80.000đ',
      icon: <LocalShipping sx={{ color: 'error.main' }} />,
    },
  ];

  const shippingAreas = [
    {
      title: 'Khu Vực Nội Thành',
      content: 'Giao hàng trong vòng 1-2 ngày làm việc',
      icon: <LocationOn sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Khu Vực Ngoại Thành',
      content: 'Giao hàng trong vòng 2-3 ngày làm việc',
      icon: <LocationOn sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Các Tỉnh Thành Khác',
      content: 'Giao hàng trong vòng 3-5 ngày làm việc',
      icon: <LocationOn sx={{ color: 'primary.main' }} />,
    },
  ];

  const shippingNotes = [
    {
      title: 'Thời Gian Giao Hàng',
      content: 'Đơn hàng sẽ được xử lý trong vòng 24 giờ kể từ khi đặt hàng thành công.',
      icon: <AccessTime sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Phí Vận Chuyển',
      content: 'Phí vận chuyển sẽ được tính dựa trên khoảng cách và phương thức vận chuyển bạn chọn.',
      icon: <Payment sx={{ color: 'primary.main' }} />,
    },
    {
      title: 'Lưu Ý Quan Trọng',
      content: 'Vui lòng cung cấp địa chỉ giao hàng chính xác và số điện thoại liên hệ để đảm bảo việc giao hàng được thuận lợi.',
      icon: <Warning sx={{ color: 'warning.main' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Chính Sách Vận Chuyển
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Phương Thức Vận Chuyển
            </Typography>
            <Grid container spacing={3}>
              {shippingMethods.map((method, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {method.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {method.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                      {method.content}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {method.price}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Khu Vực Giao Hàng
            </Typography>
            <List>
              {shippingAreas.map((area, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {area.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {area.title}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={area.content}
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
              Thông Tin Bổ Sung
            </Typography>
            <List>
              {shippingNotes.map((note, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {note.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {note.title}
                    </Typography>
                  </Box>
                  <ListItemText
                    primary={note.content}
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

export default ShippingPage; 