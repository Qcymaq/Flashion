import React from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  LocalShipping,
  Support,
  Security,
  Help,
} from '@mui/icons-material';

const BuyingGuidePage = () => {
  const steps = [
    {
      title: 'Tìm kiếm sản phẩm',
      description: 'Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục để tìm sản phẩm bạn muốn mua.',
      icon: <ShoppingCart />,
    },
    {
      title: 'Thêm vào giỏ hàng',
      description: 'Chọn số lượng và thêm sản phẩm vào giỏ hàng. Bạn có thể tiếp tục mua sắm hoặc tiến hành thanh toán.',
      icon: <ShoppingCart />,
    },
    {
      title: 'Thanh toán',
      description: 'Chọn phương thức thanh toán phù hợp (MoMo, VNPay) và điền thông tin giao hàng.',
      icon: <Payment />,
    },
    {
      title: 'Theo dõi đơn hàng',
      description: 'Sau khi đặt hàng thành công, bạn có thể theo dõi trạng thái đơn hàng trong tài khoản của mình.',
      icon: <LocalShipping />,
    },
  ];

  const faqs = [
    {
      question: 'Làm thế nào để thay đổi địa chỉ giao hàng?',
      answer: 'Bạn có thể thay đổi địa chỉ giao hàng trong quá trình thanh toán hoặc cập nhật trong trang cá nhân của bạn.',
    },
    {
      question: 'Tôi có thể hủy đơn hàng không?',
      answer: 'Bạn có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt hàng, miễn là đơn hàng chưa được xử lý.',
    },
    {
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng thông thường từ 2-5 ngày làm việc, tùy thuộc vào địa điểm giao hàng.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
        Hướng Dẫn Mua Hàng
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Các bước mua hàng
        </Typography>
        <List>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {step.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight="bold">
                      {step.title}
                    </Typography>
                  }
                  secondary={step.description}
                />
              </ListItem>
              {index < steps.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Câu hỏi thường gặp
        </Typography>
        <List>
          {faqs.map((faq, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Help />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight="bold">
                      {faq.question}
                    </Typography>
                  }
                  secondary={faq.answer}
                />
              </ListItem>
              {index < faqs.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Hỗ trợ khách hàng
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Support />
            </ListItemIcon>
            <ListItemText
              primary="Hotline hỗ trợ: 0123456789"
              secondary="Thời gian làm việc: 8:00 - 22:00"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText
              primary="Bảo mật thông tin"
              secondary="Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn"
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default BuyingGuidePage; 