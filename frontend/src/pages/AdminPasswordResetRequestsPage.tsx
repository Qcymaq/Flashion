import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

interface PasswordResetRequest {
  request_id: string;
  user_id: string;
  user_email?: string;
  user_phone?: string;
  user_name?: string;
  requested_at: string;
  expires_at: string;
  status: 'pending' | 'completed' | 'expired';
  reset_method: 'email' | 'phone';
  completed_at?: string;
}

const AdminPasswordResetRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? endpoints.admin.passwordResetRequests()
        : endpoints.admin.passwordResetRequests(statusFilter);
      
      const response = await fetchWithAuth(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch password reset requests');
      }
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
      setError('Failed to fetch password reset requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: PasswordResetRequest) => {
    setSelectedRequest(request);
    setDetailDialog(true);
  };

  const handleRevokeRequest = async (requestId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn thu hồi yêu cầu đặt lại mật khẩu này?')) {
      try {
        const response = await fetchWithAuth(endpoints.admin.revokePasswordResetRequest(requestId), {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSuccess('Đã thu hồi yêu cầu đặt lại mật khẩu thành công!');
          fetchRequests();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to revoke request');
        }
      } catch (error) {
        console.error('Error revoking request:', error);
        setError('Failed to revoke request');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!selectedRequest || !newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    try {
      const response = await fetchWithAuth(endpoints.admin.resetUserPassword(selectedRequest.user_id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (response.ok) {
        setSuccess('Mật khẩu đã được đặt lại thành công!');
        setResetPasswordDialog(false);
        setSelectedRequest(null);
        setNewPassword('');
        fetchRequests();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
    }
  };

  const handleMarkAsCompleted = async (request: PasswordResetRequest) => {
    if (window.confirm('Bạn có chắc chắn muốn đánh dấu yêu cầu này là đã xử lý xong?')) {
      try {
        const response = await fetchWithAuth(endpoints.admin.markPasswordResetCompleted(request.request_id), {
          method: 'PUT',
        });
        
        if (response.ok) {
          setSuccess('Đã đánh dấu yêu cầu là đã xử lý xong!');
          fetchRequests();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to mark request as completed');
        }
      } catch (error) {
        console.error('Error marking request as completed:', error);
        setError('Failed to mark request as completed');
      }
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác.')) {
      try {
        const response = await fetchWithAuth(endpoints.admin.deletePasswordResetRequest(requestId), {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSuccess('Đã xóa yêu cầu thành công!');
          fetchRequests();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to delete request');
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        setError('Failed to delete request');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'completed': return 'Đã hoàn thành';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Yêu cầu đặt lại mật khẩu</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo trạng thái</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Lọc theo trạng thái"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="pending">Chờ xử lý</MenuItem>
            <MenuItem value="completed">Đã hoàn thành</MenuItem>
            <MenuItem value="expired">Hết hạn</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Thông tin liên hệ</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell>Thời gian yêu cầu</TableCell>
                <TableCell>Hết hạn</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {request.user_name || 'Không có tên'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {request.user_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {request.user_email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">{request.user_email}</Typography>
                      </Box>
                    )}
                    {request.user_phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">{request.user_phone}</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.reset_method === 'email' ? 'Email' : 'Số điện thoại'}
                      size="small"
                      color={request.reset_method === 'email' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(request.requested_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={isExpired(request.expires_at) ? 'error' : 'text.primary'}
                    >
                      {formatDateTime(request.expires_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(request.status)}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleViewDetails(request)}
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {request.status === 'pending' && (
                      <>
                        <IconButton 
                          onClick={() => handleMarkAsCompleted(request)}
                          title="Đã xử lý xong"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleRevokeRequest(request.request_id)}
                          title="Thu hồi yêu cầu"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton 
                      onClick={() => handleDeleteRequest(request.request_id)}
                      title="Xóa yêu cầu"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết yêu cầu đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Thông tin người dùng</Typography>
              <Typography><strong>Tên:</strong> {selectedRequest.user_name || 'Không có tên'}</Typography>
              <Typography><strong>Email:</strong> {selectedRequest.user_email || 'Không có email'}</Typography>
              <Typography><strong>Số điện thoại:</strong> {selectedRequest.user_phone || 'Không có số điện thoại'}</Typography>
              <Typography><strong>ID người dùng:</strong> {selectedRequest.user_id}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Thông tin yêu cầu</Typography>
              <Typography><strong>ID yêu cầu:</strong> {selectedRequest.request_id}</Typography>
              <Typography><strong>Phương thức:</strong> {selectedRequest.reset_method === 'email' ? 'Email' : 'Số điện thoại'}</Typography>
              <Typography><strong>Thời gian yêu cầu:</strong> {formatDateTime(selectedRequest.requested_at)}</Typography>
              <Typography><strong>Hết hạn:</strong> {formatDateTime(selectedRequest.expires_at)}</Typography>
              <Typography><strong>Trạng thái:</strong> {getStatusText(selectedRequest.status)}</Typography>
              {selectedRequest.completed_at && (
                <Typography><strong>Hoàn thành:</strong> {formatDateTime(selectedRequest.completed_at)}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Đặt lại mật khẩu cho {selectedRequest?.user_name || 'người dùng'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Mật khẩu mới sẽ được đặt cho người dùng. Admin cần gửi mật khẩu này cho người dùng qua email hoặc SMS thủ công."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog(false)}>Hủy</Button>
          <Button onClick={handleResetPassword} variant="contained">
            Đặt lại mật khẩu
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPasswordResetRequestsPage; 