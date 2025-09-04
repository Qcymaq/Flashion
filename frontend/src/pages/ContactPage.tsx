import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { submitConsultation, ConsultationForm } from '../services/consultation';
import { 
  getEmailError, 
  getPhoneError, 
  getNameError, 
  getServiceError, 
  getMessageError 
} from '../utils/validation';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ConsultationForm>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<ConsultationForm>>({});
  const [touched, setTouched] = useState<Partial<ConsultationForm>>({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const validateField = (name: keyof ConsultationForm, value: string) => {
    switch (name) {
      case 'email':
        return getEmailError(value);
      case 'phone':
        return getPhoneError(value);
      case 'name':
        return getNameError(value);
      case 'service':
        return getServiceError(value);
      case 'message':
        return getMessageError(value);
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ConsultationForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name as keyof ConsultationForm, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ConsultationForm> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof ConsultationForm;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin trước khi gửi.',
        severity: 'error',
      });
      return;
    }

    try {
      await submitConsultation(formData);
      setSnackbar({
        open: true,
        message: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!',
        severity: 'success',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      setErrors({});
      setTouched({});
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Địa Chỉ',
      content: 'FPT University, Hồ Chí Minh (7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh)',
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Điện Thoại',
      content: '0819994722',
    },
    {
      icon: <Email sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Email',
      content: 'flashion@fpt.vn',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Giờ Làm Việc',
      content: 'Thứ 2 - Thứ 6: 8:00 - 17:30\nThứ 7: 8:00 - 12:00',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6 }}>
          Liên Hệ
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Thông Tin Liên Hệ
              </Typography>
              <Box sx={{ mt: 3 }}>
                {contactInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                    <Box sx={{ mr: 2 }}>
                      {info.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {info.title}
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {info.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{
              bgcolor: '#fff', 
              borderRadius: 3, 
              p: 4, 
              boxShadow: 1, 
              height: '100%'
            }}>
              <Typography variant="h6" fontWeight={700} align="center" sx={{ mb: 1 }}>
                Gửi tin nhắn cho chúng tôi
              </Typography>
              <Typography align="center" sx={{ mb: 2, fontSize: 14 }}>
                Chúng tôi phản hồi ngay sau 1 - 3 phút
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Họ và tên của bạn"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ mb: 2 }}
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ mb: 2 }}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ mb: 2 }}
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
                <TextField
                  fullWidth
                  label="Vui lòng chọn dịch vụ mà quan tâm"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ mb: 2 }}
                  required
                  error={!!errors.service}
                  helperText={errors.service}
                />
                <TextField
                  fullWidth
                  label="Yêu cầu cụ thể (nếu có)"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ mb: 2 }}
                  multiline
                  rows={3}
                  error={!!errors.message}
                  helperText={errors.message}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  sx={{ bgcolor: '#fbeee6', color: '#000', fontWeight: 700 }}
                >
                  Gửi ngay cho chúng tôi
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
};

export default ContactPage; 