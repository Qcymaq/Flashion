import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'Làm thế nào để đặt hàng?',
      answer: 'Để đặt hàng, bạn cần đăng nhập vào tài khoản của mình, chọn sản phẩm muốn mua, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau như MoMo, VNPay, và thẻ tín dụng.',
    },
    {
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy thuộc vào địa điểm giao hàng. Đối với các khu vực nội thành, thời gian giao hàng có thể nhanh hơn.',
    },
    {
      question: 'Làm thế nào để trả hàng?',
      answer: 'Bạn có thể yêu cầu trả hàng trong vòng 7 ngày kể từ khi nhận được sản phẩm. Vui lòng liên hệ với bộ phận chăm sóc khách hàng để được hướng dẫn chi tiết về quy trình trả hàng.',
    },
    {
      question: 'Làm thế nào để theo dõi đơn hàng?',
      answer: 'Bạn có thể theo dõi đơn hàng của mình bằng cách đăng nhập vào tài khoản và vào mục "Đơn hàng". Tại đây, bạn sẽ thấy trạng thái cập nhật mới nhất của đơn hàng.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
        Trung Tâm Trợ Giúp
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Câu Hỏi Thường Gặp
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={500}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Liên Hệ Hỗ Trợ
            </Typography>
            <Typography variant="body1" paragraph>
              Hotline: 0819994722
            </Typography>
            <Typography variant="body1" paragraph>
              Email: support@flashion.com
            </Typography>
            <Typography variant="body1">
              Giờ làm việc: 8:00 - 20:00 (Thứ 2 - Chủ Nhật)
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hướng Dẫn Nhanh
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" paragraph>
                Cách đặt hàng
              </Typography>
              <Typography component="li" paragraph>
                Chính sách vận chuyển
              </Typography>
              <Typography component="li" paragraph>
                Chính sách đổi trả
              </Typography>
              <Typography component="li" paragraph>
                Phương thức thanh toán
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpPage; 