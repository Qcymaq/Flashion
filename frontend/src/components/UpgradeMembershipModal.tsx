import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Fade,
  Zoom,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  LocalOffer as OfferIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as BankIcon,
  ContentCopy as CopyIcon,
  QrCode as QrIcon,
} from '@mui/icons-material';
import { endpoints } from '../config/api';

interface UpgradeMembershipModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

const plans = [
  {
    value: 'gold',
    label: 'Gold Membership',
    price: 49000,
    features: [
      '50 lần thử trang điểm ảo',
      'Ưu đãi đặc biệt cho sản phẩm',
      'Hỗ trợ ưu tiên',
      'Truy cập nội dung premium',
      'Miễn phí vận chuyển cho đơn hàng >500k'
    ],
    icon: <StarIcon sx={{ color: '#FFD700' }} />,
    color: '#FFD700',
    popular: false
  },
  {
    value: 'diamond',
    label: 'Diamond Membership',
    price: 199000,
    features: [
      'Không giới hạn thử trang điểm ảo',
      'Ưu đãi cao cấp nhất',
      'Hỗ trợ 24/7',
      'Truy cập tất cả nội dung premium',
      'Miễn phí vận chuyển mọi đơn hàng',
      'Tư vấn chuyên gia miễn phí',
      'Quà tặng đặc biệt hàng tháng'
    ],
    icon: <DiamondIcon sx={{ color: '#B9F2FF' }} />,
    color: '#B9F2FF',
    popular: true
  },
];

// Banking information
const bankingInfo = [
  {
    bank: 'Vietcombank',
    accountNumber: '0631000524772',
    accountName: 'PHAM DANG KHOI',
    branch: 'Chi nhánh TP.HCM',
    qrCode: '/public/images/vietcombank-qr.png'
  }
];

const UpgradeMembershipModal: React.FC<UpgradeMembershipModalProps> = ({ open, onClose, user }) => {
  const [selectedPlan, setSelectedPlan] = useState('gold');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestRequest, setLatestRequest] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStatusLoading(true);
      fetch(endpoints.auth.upgradeRequestStatus, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(res => res.json())
        .then(data => setLatestRequest(data))
        .catch(() => setLatestRequest(null))
        .finally(() => setStatusLoading(false));
    } else {
      setLatestRequest(null);
      setActiveStep(0);
      setSelectedPlan('gold');
      setPaymentProof(null);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handlePlanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPlan(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPaymentProof(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Check if payment proof is uploaded
    if (!paymentProof) {
      setError('Bạn chưa tải lên hình chuyển khoản. Vui lòng chụp ảnh biên lai và tải lên để tiếp tục.');
      setLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('membership', selectedPlan);
      formData.append('payment_proof', paymentProof);
      
      const response = await fetch(endpoints.auth.upgradeRequest, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Có lỗi xảy ra khi gửi yêu cầu nâng cấp');
      }
      
      setSuccess('Yêu cầu nâng cấp đã được gửi! Vui lòng chờ admin phê duyệt.');
      setActiveStep(2);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu nâng cấp');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCurrentMembershipInfo = () => {
    const membership = user?.membership || 'free';
    const limits = {
      free: 10,
      gold: 50,
      diamond: '∞'
    };
    const currentLimit = limits[membership as keyof typeof limits];
    return { membership, currentLimit };
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const { membership, currentLimit } = getCurrentMembershipInfo();
  const selectedPlanData = plans.find(plan => plan.value === selectedPlan);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon />
          <Typography variant="h5" fontWeight="bold">
            Nâng cấp thành viên
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: 'white', p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Current Membership Status */}
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={`Hạng hiện tại: ${membership.toUpperCase()}`}
                  color="primary"
                  variant="outlined"
                />
                {typeof user?.try_on_count === 'number' && (
                  <Chip 
                    label={`Đã thử: ${user.try_on_count}/${currentLimit}`}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Status Alert */}
          {statusLoading ? (
            <Box my={2} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          ) : latestRequest && latestRequest.status && latestRequest.status !== 'none' && (
            <Alert 
              severity={
                latestRequest.status === 'pending' ? 'info' :
                latestRequest.status === 'approved' ? 'success' :
                'error'
              } 
              sx={{ mb: 3 }}
              icon={
                latestRequest.status === 'pending' ? <InfoIcon /> :
                latestRequest.status === 'approved' ? <CheckIcon /> :
                <CloseIcon />
              }
            >
              <Typography variant="body1" fontWeight="bold">
                {latestRequest.status === 'pending' && 'Yêu cầu đang chờ duyệt'}
                {latestRequest.status === 'approved' && 'Yêu cầu đã được duyệt!'}
                {latestRequest.status === 'denied' && 'Yêu cầu bị từ chối'}
              </Typography>
              <Typography variant="body2">
                {latestRequest.status === 'pending' && 'Admin sẽ xem xét và phê duyệt yêu cầu của bạn trong thời gian sớm nhất.'}
                {latestRequest.status === 'approved' && 'Chúc mừng! Bạn đã được nâng cấp thành viên thành công.'}
                {latestRequest.status === 'denied' && 'Yêu cầu của bạn không được chấp nhận. Vui lòng liên hệ admin để biết thêm chi tiết.'}
              </Typography>
              {latestRequest.payment_proof_url && (
                <Box mt={1}>
                  <img 
                    src={latestRequest.payment_proof_url} 
                    alt="Payment proof" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }} 
                  />
                </Box>
              )}
            </Alert>
          )}

          {/* Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Chọn gói thành viên</StepLabel>
              <StepContent>
                <Grid container spacing={3}>
                  {plans.map((plan) => (
                    <Grid item xs={12} md={6} key={plan.value}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedPlan === plan.value ? 3 : 1,
                          borderColor: selectedPlan === plan.value ? 'primary.main' : 'grey.300',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          }
                        }}
                        onClick={() => setSelectedPlan(plan.value)}
                      >
                        {plan.popular && (
                          <Chip
                            label="PHỔ BIẾN"
                            color="secondary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                            }}
                          />
                        )}
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            {plan.icon}
                            <Typography variant="h6" fontWeight="bold">
                              {plan.label}
                            </Typography>
                          </Box>
                          <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                            {formatPrice(plan.price)}
                          </Typography>
                          <List dense>
                            {plan.features.map((feature, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                    disabled={!selectedPlan}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Thanh toán</StepLabel>
              <StepContent>
                <form onSubmit={handleSubmit}>
                  {/* Order Summary */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin đơn hàng
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Gói thành viên:</Typography>
                        <Typography fontWeight="bold">{selectedPlanData?.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Giá:</Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {selectedPlanData ? formatPrice(selectedPlanData.price) : ''}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Tổng cộng:</Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {selectedPlanData ? formatPrice(selectedPlanData.price) : ''}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Banking Information */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BankIcon color="primary" />
                        <Typography variant="h6">
                          Thông tin chuyển khoản
                        </Typography>
                      </Box>
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Lưu ý:</strong> Vui lòng chuyển khoản chính xác số tiền và ghi nội dung: <strong>FLASHION UPGRADE {user?.email?.split('@')[0]}</strong>
                        </Typography>
                      </Alert>

                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Tài khoản ngân hàng
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Ngân hàng</TableCell>
                                  <TableCell>Số tài khoản</TableCell>
                                  <TableCell>Chủ tài khoản</TableCell>
                                  <TableCell>Thao tác</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {bankingInfo.map((bank, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BankIcon color="primary" fontSize="small" />
                                        <Typography variant="body2" fontWeight="bold">
                                          {bank.bank}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                                          {bank.accountNumber}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => copyToClipboard(bank.accountNumber, `${bank.bank}-account`)}
                                          color={copiedText === `${bank.bank}-account` ? 'success' : 'primary'}
                                        >
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {bank.accountName}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={<QrIcon />}
                                          onClick={() => window.open(bank.qrCode, '_blank')}
                                        >
                                          QR Code
                                        </Button>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Hướng dẫn thanh toán
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Chuyển khoản chính xác số tiền" 
                                secondary={selectedPlanData ? formatPrice(selectedPlanData.price) : ''}
                              />
                            </ListItem>
                                                         <ListItem>
                               <ListItemIcon>
                                 <CheckIcon color="success" fontSize="small" />
                               </ListItemIcon>
                               <ListItemText 
                                 primary="Nội dung chuyển khoản" 
                                 secondary={`FLASHION UPGRADE ${user?.email?.split('@')[0]}`}
                               />
                             </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Chụp ảnh biên lai" 
                                secondary="Sau khi chuyển khoản, vui lòng chụp ảnh biên lai và upload bên dưới"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Chờ xác nhận" 
                                secondary="Admin sẽ xác nhận thanh toán và nâng cấp tài khoản trong 24h"
                              />
                            </ListItem>
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>

                  {/* Payment Proof Upload */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Chứng minh thanh toán
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vui lòng upload ảnh chụp màn hình hoặc biên lai thanh toán để admin có thể xác minh.
                      </Typography>
                      <TextField
                        type="file"
                        inputProps={{ accept: 'image/*' }}
                        onChange={handleFileChange}
                        fullWidth
                        helperText="Chấp nhận: JPG, PNG, GIF (Tối đa 5MB)"
                      />
                    </CardContent>
                  </Card>

                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={() => setActiveStep(0)}>
                      Quay lại
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      disabled={loading || (latestRequest && latestRequest.status === 'pending')}
                      startIcon={loading ? <CircularProgress size={18} /> : <PaymentIcon />}
                    >
                      {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                  </Box>
                </form>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Hoàn thành</StepLabel>
              <StepContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Yêu cầu đã được gửi thành công!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin sẽ xem xét và phê duyệt yêu cầu của bạn trong thời gian sớm nhất.
                  </Typography>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeMembershipModal; 