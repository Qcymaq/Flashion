import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const TermsPage: React.FC = () => {
  const terms = [
    {
      title: '1. Điều Khoản Chung',
      content: 'Bằng việc truy cập và sử dụng website FLASHion, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện sau đây.',
    },
    {
      title: '2. Tài Khoản Người Dùng',
      content: 'Khi đăng ký tài khoản, bạn phải cung cấp thông tin chính xác và đầy đủ. Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.',
    },
    {
      title: '3. Đặt Hàng và Thanh Toán',
      content: 'Khi đặt hàng, bạn cần cung cấp thông tin chính xác về địa chỉ giao hàng và phương thức thanh toán. Chúng tôi có quyền từ chối đơn hàng nếu thông tin không hợp lệ.',
    },
    {
      title: '4. Vận Chuyển và Giao Hàng',
      content: 'Thời gian giao hàng có thể thay đổi tùy thuộc vào địa điểm và phương thức vận chuyển. Chúng tôi không chịu trách nhiệm về sự chậm trễ do các yếu tố khách quan.',
    },
    {
      title: '5. Chính Sách Đổi Trả',
      content: 'Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và có đầy đủ phụ kiện.',
    },
    {
      title: '6. Bảo Mật Thông Tin',
      content: 'Chúng tôi cam kết bảo mật thông tin cá nhân của bạn theo đúng quy định của pháp luật và chính sách bảo mật của chúng tôi.',
    },
    {
      title: '7. Quyền Sở Hữu Trí Tuệ',
      content: 'Tất cả nội dung trên website, bao gồm hình ảnh, logo, và văn bản đều thuộc quyền sở hữu của FLASHion và được bảo vệ bởi luật bản quyền.',
    },
    {
      title: '8. Giới Hạn Trách Nhiệm',
      content: 'FLASHion không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng website của chúng tôi.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Điều Khoản và Điều Kiện
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" paragraph>
          Chào mừng bạn đến với FLASHion. Vui lòng đọc kỹ các điều khoản và điều kiện sau đây trước khi sử dụng website của chúng tôi.
        </Typography>

        <List>
          {terms.map((term, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {term.title}
              </Typography>
              <ListItemText
                primary={term.content}
                sx={{ mt: 1 }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage; 