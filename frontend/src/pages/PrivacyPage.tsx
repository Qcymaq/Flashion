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

const PrivacyPage: React.FC = () => {
  const privacySections = [
    {
      title: '1. Thông Tin Chúng Tôi Thu Thập',
      content: 'Chúng tôi thu thập thông tin cá nhân của bạn khi bạn đăng ký tài khoản, đặt hàng, hoặc liên hệ với chúng tôi. Thông tin này bao gồm tên, địa chỉ email, số điện thoại, và địa chỉ giao hàng.',
    },
    {
      title: '2. Cách Chúng Tôi Sử Dụng Thông Tin',
      content: 'Chúng tôi sử dụng thông tin của bạn để xử lý đơn hàng, cung cấp dịch vụ khách hàng, gửi thông báo về đơn hàng, và cải thiện trải nghiệm mua sắm của bạn.',
    },
    {
      title: '3. Bảo Mật Thông Tin',
      content: 'Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, sử dụng hoặc tiết lộ trái phép.',
    },
    {
      title: '4. Chia Sẻ Thông Tin',
      content: 'Chúng tôi không bán, trao đổi hoặc chuyển thông tin cá nhân của bạn cho bên thứ ba mà không có sự đồng ý của bạn, trừ khi được yêu cầu bởi pháp luật.',
    },
    {
      title: '5. Cookie và Công Nghệ Theo Dõi',
      content: 'Chúng tôi sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm của bạn trên website và phân tích cách bạn sử dụng website của chúng tôi.',
    },
    {
      title: '6. Quyền Của Người Dùng',
      content: 'Bạn có quyền truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình. Bạn cũng có quyền từ chối việc thu thập và sử dụng thông tin của mình.',
    },
    {
      title: '7. Thay Đổi Chính Sách',
      content: 'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng thông báo trên website.',
    },
    {
      title: '8. Liên Hệ',
      content: 'Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật của chúng tôi, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại được cung cấp trên website.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Chính Sách Bảo Mật
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" paragraph>
          Tại FLASHion, chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
        </Typography>

        <List>
          {privacySections.map((section, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              <ListItemText
                primary={section.content}
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

export default PrivacyPage; 