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
import { bankTransferDetails, hasBankTransferDetails, PAYMENT_DETAILS_UNAVAILABLE_MESSAGE } from '../config/payment';

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

  const getMembershipLabel = (membership: string) => {
    switch (membership) {
      case 'gold': return 'Vàng';
      case 'diamond': return 'Kim cương';
      default: return 'Miễn phí';
    }
  };

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'gold': return '#FFD700';
      case 'diamond': return '#B9F2FF';
      default: return '#666';
    }
  };

  const getMembershipIcon = (membership: string) => {
    switch (membership) {
      case 'gold': return <StarIcon sx={{ color: '#FFD700' }} />;
      case 'diamond': return <DiamondIcon sx={{ color: '#B9F2FF' }} />;
      default: return null;
    }
  };

  const getMembershipPrice = (membership: string) => {
    switch (membership) {
      case 'gold': return 49000;
      case 'diamond': return 199000;
      default: return 0;
    }
  };

  const getMembershipBenefits = (membership: string) => {
    switch (membership) {
      case 'gold':
        return [
          '50 lần thử trang điểm ảo mỗi tháng',
          'Ưu tiên hỗ trợ khách hàng',
          'Giảm giá 10% cho đơn hàng đầu tiên',
          'Truy cập sớm các sản phẩm mới'
        ];
      case 'diamond':
        return [
          'Không giới hạn thử trang điểm ảo',
          'Hỗ trợ khách hàng 24/7',
          'Giảm giá 20% cho tất cả đơn hàng',
          'Truy cập độc quyền các sản phẩm cao cấp',
          'Tư vấn chuyên gia miễn phí'
        ];
      default:
        return [
          '10 lần thử trang điểm ảo mỗi tháng',
          'Truy cập cơ bản các tính năng'
        ];
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
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>
          Nâng cấp thành viên
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
          {/* Step 1: Choose Plan */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>
                Bước 1: Chọn gói thành viên
              </Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                {/* Current Membership */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getMembershipIcon(membership)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          Thành viên hiện tại: {getMembershipLabel(membership)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Giới hạn thử trang điểm: {currentLimit} lần/tháng
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Upgrade Options */}
                {membership !== 'gold' && (
                  <Grid item xs={12} md={6}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedPlan === 'gold' ? 2 : 1,
                        borderColor: selectedPlan === 'gold' ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => setSelectedPlan('gold')}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <StarIcon sx={{ color: '#FFD700', mr: 1 }} />
                          <Typography variant="h6" fontWeight={600}>
                            Gói Vàng
                          </Typography>
                        </Box>
                        <Typography variant="h5" color="primary" fontWeight={700} sx={{ mb: 2 }}>
                          {formatPrice(getMembershipPrice('gold'))}
                        </Typography>
                        <List dense>
                          {getMembershipBenefits('gold').map((benefit, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {membership !== 'diamond' && (
                  <Grid item xs={12} md={6}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedPlan === 'diamond' ? 2 : 1,
                        borderColor: selectedPlan === 'diamond' ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => setSelectedPlan('diamond')}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DiamondIcon sx={{ color: '#B9F2FF', mr: 1 }} />
                          <Typography variant="h6" fontWeight={600}>
                            Gói Kim cương
                          </Typography>
                        </Box>
                        <Typography variant="h5" color="primary" fontWeight={700} sx={{ mb: 2 }}>
                          {formatPrice(getMembershipPrice('diamond'))}
                        </Typography>
                        <List dense>
                          {getMembershipBenefits('diamond').map((benefit, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </StepContent>
          </Step>

          {/* Step 2: Payment */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>
                Bước 2: Thanh toán
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin thanh toán
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BankIcon sx={{ mr: 1 }} />
                      <Typography fontWeight={600}>Chuyển khoản ngân hàng</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {hasBankTransferDetails ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                            {bankTransferDetails.bankName && (
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                {bankTransferDetails.bankName}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>Số tài khoản:</Typography>
                              <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                {bankTransferDetails.accountNumber}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  navigator.clipboard.writeText(bankTransferDetails.accountNumber);
                                  setCopiedText(bankTransferDetails.accountNumber);
                                  setTimeout(() => setCopiedText(null), 2000);
                                }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {bankTransferDetails.accountHolder && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>Chủ tài khoản:</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {bankTransferDetails.accountHolder}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>Nội dung:</Typography>
                              <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                {user?.email} - {selectedPlan}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  const content = `${user?.email} - ${selectedPlan}`;
                                  navigator.clipboard.writeText(content);
                                  setCopiedText(content);
                                  setTimeout(() => setCopiedText(null), 2000);
                                }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        </Grid>

                        {bankTransferDetails.qrImageUrl && (
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                QR Code thanh toán
                              </Typography>
                              <Box sx={{ textAlign: 'center' }}>
                                <img 
                                  src={bankTransferDetails.qrImageUrl} 
                                  alt="QR Code" 
                                  style={{ width: 150, height: 150 }}
                                />
                              </Box>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        {PAYMENT_DETAILS_UNAVAILABLE_MESSAGE}
                      </Alert>
                    )}

                    {copiedText && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Đã sao chép: {copiedText}
                      </Alert>
                    )}
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tải lên chứng minh thanh toán
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      📸 <strong>Hướng dẫn:</strong> Sau khi chuyển khoản, hãy chụp ảnh biên lai chuyển khoản và tải lên. 
                      Admin sẽ xem được ảnh này để xác nhận thanh toán của bạn.
                    </Typography>
                  </Alert>
                  
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="payment-proof-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="payment-proof-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Chọn ảnh chứng minh thanh toán
                    </Button>
                  </label>
                  
                  {paymentProof && (
                    <Card sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          ✓ Đã chọn: {paymentProof.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={URL.createObjectURL(paymentProof)}
                          alt="Payment Proof Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            borderRadius: 8,
                            border: '2px solid #e0e0e0'
                          }}
                        />
                      </Box>
                      
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          ✅ Ảnh sẽ được tải lên server và admin có thể xem để xác nhận thanh toán của bạn.
                        </Typography>
                      </Alert>
                    </Card>
                  )}
                </Box>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Success */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight={600}>
                Bước 3: Hoàn thành
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Yêu cầu nâng cấp đã được gửi!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chúng tôi sẽ xem xét và phê duyệt yêu cầu của bạn trong thời gian sớm nhất.
                </Typography>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Box>
          {activeStep > 0 && activeStep < 2 && (
            <Button onClick={() => setActiveStep(activeStep - 1)}>
              Quay lại
            </Button>
          )}
        </Box>
        <Box>
          {activeStep === 0 && (
            <Button 
              variant="contained" 
              onClick={() => setActiveStep(1)}
              disabled={!selectedPlan}
            >
              Tiếp tục
            </Button>
          )}
          {activeStep === 1 && (
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!paymentProof || loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          )}
          {activeStep === 2 && (
            <Button variant="contained" onClick={onClose}>
              Đóng
            </Button>
          )}
        </Box>
      </DialogActions>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ m: 2 }}>
          {success}
        </Alert>
      )}
    </Dialog>
  );
};

export default UpgradeMembershipModal; 