import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  shipping_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  has_more: boolean;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const { isAuthenticated } = useAuth();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  const fetchOrders = async (pageNum: number = 1) => {
    try {
      const skip = (pageNum - 1) * 10;
      const response = await fetchWithAuth(`${endpoints.orders.list}?skip=${skip}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data: PaginatedOrdersResponse = await response.json();
      
      if (pageNum === 1) {
        setOrders(data.orders);
      } else {
        setOrders(prevOrders => [...prevOrders, ...data.orders]);
      }
      
      setHasMore(data.has_more);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách đơn hàng',
        severity: 'error',
      });
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(page);
    }
  }, [isAuthenticated, page]);

  const handleOpen = (order: Order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetchWithAuth(endpoints.orders.updateStatus(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể cập nhật trạng thái đơn hàng');
      }

      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success',
      });

      // Refresh orders
      fetchOrders(1);
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái đơn hàng',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Quản lý đơn hàng
      </Typography>

      {orders.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6">Không có đơn hàng nào</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Mã người dùng</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow 
                  key={order._id}
                  ref={index === orders.length - 1 ? lastOrderElementRef : null}
                >
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user_id}</TableCell>
                  <TableCell>{order.total_price.toLocaleString()}đ</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(order)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    {order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateStatus(order._id, 'processing')}
                        sx={{ ml: 1 }}
                      >
                        Xử lý
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateStatus(order._id, 'shipped')}
                        sx={{ ml: 1 }}
                      >
                        Giao hàng
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateStatus(order._id, 'delivered')}
                        sx={{ ml: 1 }}
                      >
                        Hoàn thành
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Mã đơn hàng: {selectedOrder._id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Mã người dùng: {selectedOrder.user_id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Địa chỉ giao hàng: {selectedOrder.shipping_address}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Tổng tiền: {selectedOrder.total_price.toLocaleString()}đ
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Trạng thái: {getStatusLabel(selectedOrder.status)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Cập nhật lần cuối: {new Date(selectedOrder.updated_at).toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Sản phẩm
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {item.price.toLocaleString()}đ
                        </TableCell>
                        <TableCell align="right">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

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

export default AdminOrdersPage; 