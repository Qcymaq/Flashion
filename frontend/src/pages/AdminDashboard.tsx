import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  Chip,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  RestartAlt as ResetIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface User {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  membership?: string; // Added for the new dropdown
}

interface TopProduct {
  _id: string;
  name: string;
  total_sales: number;
  revenue: number;
  image_url: string;
}

type MembershipUpgradeLog = {
  _id: string;
  user_id: string;
  email: string;
  old_membership: string;
  new_membership: string;
  price: number;
  upgraded_at: string;
  status: string;
  payment_proof_url?: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  // Revenue management states
  const [revenueMenuAnchor, setRevenueMenuAnchor] = useState<null | HTMLElement>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Membership requests state
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [membershipLogs, setMembershipLogs] = useState<MembershipUpgradeLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Password reset requests state
  const [passwordResetStats, setPasswordResetStats] = useState({
    pending: 0,
    completed: 0,
    expired: 0,
    total: 0,
  });
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequests();
    fetchMembershipLogs();
    fetchPasswordResetStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, usersRes, productsRes] = await Promise.all([
        fetchWithAuth(endpoints.admin.stats),
        fetchWithAuth(endpoints.admin.users),
        fetchWithAuth(endpoints.admin.topProducts),
      ]);

      if (!statsRes.ok) {
        const errorData = await statsRes.json().catch(() => ({}));
        throw new Error(`Failed to fetch stats: ${errorData.message || statsRes.statusText}`);
      }
      if (!usersRes.ok) {
        const errorData = await usersRes.json().catch(() => ({}));
        throw new Error(`Failed to fetch users: ${errorData.message || usersRes.statusText}`);
      }
      if (!productsRes.ok) {
        const errorData = await productsRes.json().catch(() => ({}));
        throw new Error(`Failed to fetch top products: ${errorData.message || productsRes.statusText}`);
      }

      const [statsData, usersData, productsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        productsRes.json(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setTopProducts(productsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setPendingLoading(true);
    try {
      const url = endpoints.admin.membershipRequests('pending');
      console.log('Dashboard fetching pending requests from:', url);
      
      const res = await fetchWithAuth(url);
      console.log('Dashboard response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Dashboard error response:', errorText);
        throw new Error('Failed to fetch pending requests');
      }
      
      const data = await res.json();
      console.log('Dashboard fetched pending requests:', data);
      console.log('Dashboard pending count:', data.length);
      
      setPendingRequests(data);
    } catch (e) {
      console.error('Dashboard error fetching pending requests:', e);
      setPendingRequests([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await fetchWithAuth(`${endpoints.admin.users}/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to delete user');
        }

        // Show success message
        alert('Xóa người dùng thành công');
        
        // Refresh the users list
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error instanceof Error ? error.message : 'Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  // Revenue management functions
  const handleRevenueMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRevenueMenuAnchor(event.currentTarget);
  };

  const handleRevenueMenuClose = () => {
    setRevenueMenuAnchor(null);
  };

  const handleRefreshRevenue = async () => {
    try {
      setRevenueLoading(true);
      await fetchDashboardData();
      setSnackbar({
        open: true,
        message: 'Đã làm mới dữ liệu doanh thu',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi làm mới dữ liệu doanh thu',
        severity: 'error',
      });
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleResetRevenue = () => {
    setResetDialogOpen(true);
    handleRevenueMenuClose();
  };

  const handleResetRevenueConfirm = async () => {
    if (!resetReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập lý do reset doanh thu',
        severity: 'error',
      });
      return;
    }

    try {
      setRevenueLoading(true);
      const response = await fetchWithAuth(endpoints.admin.resetRevenue, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: resetReason }),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchDashboardData();
        setSnackbar({
          open: true,
          message: `${result.message} (${result.archived_orders} đơn hàng đã được lưu trữ)`,
          severity: 'success',
        });
        setResetDialogOpen(false);
        setResetReason('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset revenue');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Lỗi khi reset doanh thu',
        severity: 'error',
      });
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleDownloadRevenueReport = () => {
    // Simulate downloading revenue report
    const reportData = {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      averageOrderValue: stats.averageOrderValue,
      date: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Đã tải xuống báo cáo doanh thu',
      severity: 'success',
    });
    handleRevenueMenuClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchMembershipLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetchWithAuth(endpoints.admin.membershipRequests('all'));
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to fetch membership logs');
      }
      const data = await res.json();
      setMembershipLogs(data);
    } catch (err: any) {
      setLogsError(err.message || 'Failed to fetch membership logs');
      setMembershipLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchPasswordResetStats = async () => {
    setPasswordResetLoading(true);
    try {
      const response = await fetchWithAuth(endpoints.admin.passwordResetStats);
      if (response.ok) {
        const data = await response.json();
        setPasswordResetStats(data);
      }
    } catch (error) {
      console.error('Error fetching password reset stats:', error);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            Lỗi khi tải dữ liệu
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchDashboardData}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Tổng người dùng</Typography>
            </Box>
            <Typography variant="h4">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.main',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Tổng đơn hàng</Typography>
            </Box>
            <Typography variant="h4">{stats.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.main',
              color: 'white',
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Doanh thu</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="Làm mới doanh thu">
                  <IconButton
                    size="small"
                    onClick={handleRefreshRevenue}
                    disabled={revenueLoading}
                    sx={{ color: 'white' }}
                  >
                    {revenueLoading ? (
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                    ) : (
                      <RefreshIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tùy chọn doanh thu">
                  <IconButton
                    size="small"
                    onClick={handleRevenueMenuOpen}
                    sx={{ color: 'white' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {revenueLoading ? (
                <CircularProgress size={32} sx={{ color: 'white' }} />
              ) : (
                `${stats.totalRevenue.toLocaleString()}đ`
              )}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Trung bình: {stats.averageOrderValue.toLocaleString()}đ/đơn
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon fontSize="small" sx={{ opacity: 0.8 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {stats.totalOrders} đơn
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Users Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Danh sách người dùng"
              action={
                <Button
                  color="primary"
                  onClick={() => navigate('/admin/users')}
                >
                  Xem tất cả
                </Button>
              }
            />
            <Divider />
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <ListItem
                      key={user._id}
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            onClick={() => handleEditUser(user._id)}
                            sx={{ mr: 1 }}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteUser(user._id)}
                            color="error"
                            title="Xóa người dùng"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.full_name || 'Không có tên'}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {user.email || 'Không có email'}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Vai trò: {user.role || 'Không xác định'} - Ngày tạo: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Không xác định'}
                            </Typography>
                            <br />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>Membership:</Typography>
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
                                      fetchDashboardData();
                                    } else {
                                      alert('Failed to update membership');
                                    }
                                  } catch (err) {
                                    alert('Error updating membership');
                                  }
                                }}
                                size="small"
                                sx={{ minWidth: 100 }}
                              >
                                <MenuItem value="free">Free</MenuItem>
                                <MenuItem value="gold">Gold</MenuItem>
                                <MenuItem value="diamond">Diamond</MenuItem>
                              </Select>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="Không có người dùng nào"
                      secondary="Chưa có người dùng nào trong hệ thống"
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Sản phẩm bán chạy"
              action={
                <Button
                  color="primary"
                  onClick={() => navigate('/admin/products')}
                >
                  Xem tất cả
                </Button>
              }
            />
            <Divider />
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {topProducts.map((product) => (
                    <React.Fragment key={product._id || product.name}>
                      <ListItem
                        secondaryAction={
                          product._id ? (
                            <IconButton
                              edge="end"
                              onClick={() => navigate(`/admin/products/${product._id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          ) : null
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={product.image_url} alt={product.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Đã bán: {product.total_sales}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Doanh thu: {product.revenue.toLocaleString()}đ
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Box>
          </Card>
        </Grid>

        {/* Password Reset Requests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Yêu cầu đặt lại mật khẩu"
              action={
                <Button
                  color="primary"
                  onClick={() => navigate('/admin/password-reset-requests')}
                >
                  Xem tất cả
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {passwordResetLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="warning.dark">
                          {passwordResetStats.pending}
                        </Typography>
                        <Typography variant="body2" color="warning.dark">
                          Chờ xử lý
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="success.dark">
                          {passwordResetStats.completed}
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                          Đã hoàn thành
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="error.dark">
                          {passwordResetStats.expired}
                        </Typography>
                        <Typography variant="body2" color="error.dark">
                          Hết hạn
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="h4" color="info.dark">
                          {passwordResetStats.total}
                        </Typography>
                        <Typography variant="body2" color="info.dark">
                          Tổng cộng
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  {passwordResetStats.pending > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Có {passwordResetStats.pending} yêu cầu đặt lại mật khẩu đang chờ xử lý thủ công
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Membership Requests - REMOVED */}
        {/* <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<GroupIcon color="primary" />}
              title="Quản lý yêu cầu nâng cấp thành viên"
            />
            <CardContent>
              <MembershipRequestsPanel />
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>

      {/* Revenue Management Menu */}
      <Menu
        anchorEl={revenueMenuAnchor}
        open={Boolean(revenueMenuAnchor)}
        onClose={handleRevenueMenuClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        <MenuItem onClick={handleRefreshRevenue} disabled={revenueLoading}>
          <RefreshIcon sx={{ mr: 2 }} />
          Làm mới doanh thu
        </MenuItem>
        <MenuItem onClick={handleResetRevenue}>
          <ResetIcon sx={{ mr: 2 }} />
          Reset doanh thu
        </MenuItem>
        <MenuItem onClick={handleDownloadRevenueReport}>
          <DownloadIcon sx={{ mr: 2 }} />
          Tải báo cáo
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/analytics')}>
          <AnalyticsIcon sx={{ mr: 2 }} />
          Phân tích chi tiết
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/orders/archived')}>
          <DeleteIcon sx={{ mr: 2 }} />
          Xem đơn hàng đã lưu trữ
        </MenuItem>
      </Menu>

      {/* Reset Revenue Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Doanh Thu</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Cảnh báo:</strong> Hành động này sẽ reset toàn bộ doanh thu về 0. Hành động này không thể hoàn tác.
          </Alert>
          <TextField
            fullWidth
            label="Lý do reset doanh thu"
            multiline
            rows={3}
            value={resetReason}
            onChange={(e) => setResetReason(e.target.value)}
            placeholder="Vui lòng nhập lý do reset doanh thu..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleResetRevenueConfirm} 
            color="error" 
            variant="contained"
            disabled={!resetReason.trim() || revenueLoading}
          >
            {revenueLoading ? <CircularProgress size={20} /> : 'Reset Doanh Thu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Membership Upgrade Log Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Lịch sử nâng cấp thành viên
        </Typography>
        {logsLoading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={32} />
          </Box>
        ) : logsError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{logsError}</Alert>
        ) : (
          <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            <TableContainer component={Paper} elevation={1} sx={{ mb: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Từ</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Đến</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giá</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày nâng cấp</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Chứng minh thanh toán</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {membershipLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Không có lịch sử nâng cấp nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    membershipLogs.map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>{log.email}</TableCell>
                        <TableCell>
                          <Chip label={log.old_membership?.toUpperCase()} size="small" variant="outlined" color="default" />
                        </TableCell>
                        <TableCell>
                          <Chip label={log.new_membership?.toUpperCase()} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(log.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.upgraded_at).toLocaleString('vi-VN', {
                              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.payment_proof_url ? (
                            <Typography 
                              variant="body2" 
                              color="primary" 
                              sx={{ 
                                textDecoration: 'underline', 
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.dark' }
                              }}
                              onClick={() => {
                                // Construct the full URL by adding the backend base URL
                                const backendBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
                                const fullUrl = `${backendBaseUrl}${log.payment_proof_url}`;
                                window.open(fullUrl, '_blank');
                              }}
                            >
                              Xem ảnh chuyển khoản
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">Không có</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 