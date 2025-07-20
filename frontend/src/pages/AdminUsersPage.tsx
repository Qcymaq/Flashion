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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LockReset as LockResetIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Alert, Snackbar, CircularProgress } from '@mui/material';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

// Add membership to User interface
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  membership?: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(endpoints.admin.users);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpen = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        password: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const url = selectedUser
        ? `${endpoints.admin.users}/${selectedUser._id}`
        : endpoints.admin.users;
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(selectedUser ? 'Người dùng đã được cập nhật thành công!' : 'Người dùng đã được tạo thành công!');
        fetchUsers();
        setTimeout(() => {
          handleClose();
          setSuccess(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi lưu người dùng');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(`${endpoints.admin.users}/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setSuccess('Người dùng đã được xóa thành công!');
          fetchUsers();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Có lỗi xảy ra khi xóa người dùng');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Có lỗi xảy ra khi xóa người dùng');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetchWithAuth(`${endpoints.admin.users}/${user._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(endpoints.admin.resetUserPassword(resetPasswordUser._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (response.ok) {
        setSuccess('Mật khẩu đã được đặt lại thành công!');
        setResetPasswordDialog(false);
        setResetPasswordUser(null);
        setNewPassword('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (user: User) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(endpoints.admin.sendResetLink(user._id), {
        method: 'POST',
      });

      if (response.ok) {
        setSuccess('Đã gửi link đặt lại mật khẩu cho người dùng!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi gửi link đặt lại mật khẩu');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      setError('Có lỗi xảy ra khi gửi link đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Người dùng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm người dùng
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thành viên</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'} 
                    color={user.role === 'admin' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.is_active ? 'Hoạt động' : 'Không hoạt động'} 
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleStatus(user)}
                    style={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={user.membership || 'free'}
                    onChange={async (e) => {
                      const newMembership = e.target.value;
                      try {
                        const response = await fetchWithAuth(`${endpoints.admin.users}/${user._id}/membership`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ membership: newMembership }),
                        });
                        if (response.ok) {
                          fetchUsers();
                        } else {
                          alert('Không thể cập nhật thành viên');
                        }
                      } catch (err) {
                        alert('Lỗi cập nhật thành viên');
                      }
                    }}
                    size="small"
                  >
                    <MenuItem value="free">Miễn phí</MenuItem>
                    <MenuItem value="gold">Vàng</MenuItem>
                    <MenuItem value="diamond">Kim cương</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      setResetPasswordUser(user);
                      setResetPasswordDialog(true);
                    }}
                    title="Đặt lại mật khẩu"
                  >
                    <LockResetIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleSendResetLink(user)}
                    title="Gửi link đặt lại mật khẩu"
                  >
                    <EmailIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Vai trò</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as User['role'] })
                }
                label="Vai trò"
              >
                <MenuItem value="user">Người dùng</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
            {!selectedUser && (
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                margin="normal"
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang xử lý...' : (selectedUser ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onClose={() => setResetPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Đặt lại mật khẩu cho {resetPasswordUser?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              helperText="Nhập mật khẩu mới cho người dùng"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setResetPasswordDialog(false);
              setResetPasswordUser(null);
              setNewPassword('');
            }} 
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            disabled={loading || !newPassword.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Alerts */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersPage; 