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
      content: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Điện Thoại',
      content: '1900 1234',
    },
    {
      icon: <Email sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Email',
      content: 'support@flashion.com',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Giờ Làm Việc',
      content: 'Thứ 2 - Thứ 6: 8:00 - 17:30\nThứ 7: 8:00 - 12:00',
    },
  ];

  return (
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
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Gửi Tin Nhắn Cho Chúng Tôi
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                margin="normal"
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
                required
                margin="normal"
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
                required
                margin="normal"
                error={!!errors.phone}
                helperText={errors.phone}
              />
              <TextField
                fullWidth
                label="Dịch vụ quan tâm"
                name="service"
                value={formData.service}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                margin="normal"
                error={!!errors.service}
                helperText={errors.service}
              />
              <TextField
                fullWidth
                label="Nội dung"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                multiline
                rows={4}
                margin="normal"
                error={!!errors.message}
                helperText={errors.message}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
              >
                Gửi Tin Nhắn
              </Button>
            </Box>
          </Paper>
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
  );
};

export default ContactPage; 