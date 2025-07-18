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
  Group as GroupIcon,
  Upgrade as UpgradeIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  FilterList as FilterIcon,
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
}

interface TopProduct {
  _id: string;
  name: string;
  total_sales: number;
  revenue: number;
  image_url: string;
}

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

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequests();
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
          </Card>
        </Grid>

        {/* Membership Requests */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<GroupIcon color="primary" />}
              title="Quản lý yêu cầu nâng cấp thành viên"
            />
            <CardContent>
              {/* Membership Requests Panel (full logic/UI from AdminMembershipRequestsPage) */}
              <MembershipRequestsPanel />
            </CardContent>
          </Card>
        </Grid>
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
    </Container>
  );
};

// Add the MembershipRequestsPanel component at the top of the file (can be in the same file for now)
// MembershipRequestsPanel implementation (copy from AdminMembershipRequestsPage, but as a component)
const MembershipRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'deny' | null;
    request: any | null;
  }>({ open: false, type: null, request: null });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch all requests, filter client-side
      const url = endpoints.admin.membershipRequests('all');
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch requests: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const validRequests = data.filter((req: any) => req.user_id && req.user_id !== 'undefined' && req.user_id !== 'null');
      setRequests(validRequests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [status]);

  const handleAction = async (type: 'approve' | 'deny', request: any) => {
    setConfirmDialog({ open: true, type, request });
  };

  const confirmAction = async () => {
    if (!confirmDialog.request || !confirmDialog.type) return;
    const { request, type } = confirmDialog;
    if (!request.request_id || request.request_id === 'undefined' || request.request_id === 'null') {
      setSnackbar({
        open: true,
        message: 'Invalid request ID. Please refresh the page and try again.',
        severity: 'error'
      });
      setConfirmDialog({ open: false, type: null, request: null });
      return;
    }
    setActionLoading(request.request_id);
    setConfirmDialog({ open: false, type: null, request: null });
    try {
      const endpoint = type === 'approve' 
        ? endpoints.admin.approveMembershipRequest(request.request_id)
        : endpoints.admin.denyMembershipRequest(request.request_id);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${type} request`);
      }
      setSnackbar({
        open: true,
        message: `Request ${type}d successfully!`,
        severity: 'success'
      });
      fetchRequests();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || `Failed to ${type} request`,
        severity: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'denied': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'denied': return 'Từ chối';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailDialog(true);
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length,
    total: requests.length
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats.pending}</Typography>
              <Typography variant="body2">Chờ duyệt</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats.approved}</Typography>
              <Typography variant="body2">Đã duyệt</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats.denied}</Typography>
              <Typography variant="body2">Từ chối</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">{stats.total}</Typography>
              <Typography variant="body2">Tổng cộng</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <FilterIcon color="action" />
        <Select 
          value={status} 
          onChange={e => setStatus(e.target.value)} 
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="pending">Chờ duyệt</MenuItem>
          <MenuItem value="approved">Đã duyệt</MenuItem>
          <MenuItem value="denied">Từ chối</MenuItem>
        </Select>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {requests.length} yêu cầu
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
          disabled={loading}
          size="small"
        >
          Làm mới
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Không có yêu cầu nâng cấp thành viên nào với trạng thái "{getStatusLabel(status)}"
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Từ</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Đến</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giá</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.filter(r => r.status === status).map(req => (
                <TableRow key={req.request_id} hover>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={req.old_membership?.toUpperCase()} 
                      size="small" 
                      variant="outlined"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={req.new_membership?.toUpperCase()} 
                      size="small" 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatPrice(req.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(req.status)}
                      color={getStatusColor(req.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(req.upgraded_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(req)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {req.status === 'pending' && (
                        <>
                          <Tooltip title="Duyệt yêu cầu">
                            <IconButton
                              size="small"
                              color="success"
                              disabled={actionLoading === req.request_id}
                              onClick={() => handleAction('approve', req)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối yêu cầu">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={actionLoading === req.request_id}
                              onClick={() => handleAction('deny', req)}
                            >
                              <DenyIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: null, request: null })}>
        <DialogTitle>
          {confirmDialog.type === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn {confirmDialog.type === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu nâng cấp thành viên của{' '}
            <strong>{confirmDialog.request?.email}</strong>?
          </Typography>
          {confirmDialog.request && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Từ:</strong> {confirmDialog.request.old_membership?.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Đến:</strong> {confirmDialog.request.new_membership?.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Giá:</strong> {formatPrice(confirmDialog.request.price)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, request: null })}>
            Hủy
          </Button>
          <Button 
            onClick={confirmAction}
            variant="contained"
            color={confirmDialog.type === 'approve' ? 'success' : 'error'}
            disabled={actionLoading === confirmDialog.request?._id}
          >
            {actionLoading === confirmDialog.request?._id ? (
              <CircularProgress size={20} />
            ) : (
              confirmDialog.type === 'approve' ? 'Duyệt' : 'Từ chối'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Detail Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết yêu cầu nâng cấp thành viên
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin người dùng</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{selectedRequest.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">ID người dùng:</Typography>
                  <Typography variant="body1" fontFamily="monospace">{selectedRequest._id}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin nâng cấp</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Từ hạng:</Typography>
                  <Chip label={selectedRequest.old_membership?.toUpperCase()} variant="outlined" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Đến hạng:</Typography>
                  <Chip label={selectedRequest.new_membership?.toUpperCase()} color="primary" />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Giá:</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatPrice(selectedRequest.price)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Chứng minh thanh toán</Typography>
                {selectedRequest.payment_proof_url ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <img 
                      src={selectedRequest.payment_proof_url} 
                      alt="Payment proof" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px', 
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }} 
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => window.open(selectedRequest.payment_proof_url, '_blank')}
                      >
                        Xem ảnh gốc
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">Không có chứng minh thanh toán</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard; 