import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

interface ArchivedOrder {
  _id: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  status: string;
  created_at: string;
  archived_at: string;
  archived_by: string;
  archive_reason: string;
}

const AdminArchivedOrdersPage: React.FC = () => {
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedOrders();
  }, []);

  const fetchArchivedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(endpoints.admin.archivedOrders);
      if (response.ok) {
        const data = await response.json();
        // Validate and clean the data
        const validatedData = Array.isArray(data) ? data.map(order => ({
          _id: order._id || '',
          user: {
            _id: order.user?._id || '',
            full_name: order.user?.full_name || 'Unknown User',
            email: order.user?.email || 'No email'
          },
          items: Array.isArray(order.items) ? order.items : [],
          total_price: order.total_price || 0,
          status: order.status || 'archived',
          created_at: order.created_at || '',
          archived_at: order.archived_at || '',
          archived_by: order.archived_by || '',
          archive_reason: order.archive_reason || 'No reason provided'
        })) : [];
        
        console.log('Archived orders data:', validatedData); // Debug log
        setArchivedOrders(validatedData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch archived orders');
      }
    } catch (error) {
      console.error('Error fetching archived orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch archived orders');
      setArchivedOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getTotalArchivedRevenue = () => {
    return archivedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Đơn Hàng Đã Lưu Trữ
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ArchiveIcon color="action" />
              <Typography variant="h6">
                Tổng quan đơn hàng đã lưu trữ
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tổng đơn hàng
                </Typography>
                <Typography variant="h6">
                  {archivedOrders.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tổng doanh thu đã lưu trữ
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {getTotalArchivedRevenue().toLocaleString()}đ
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {archivedOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có đơn hàng nào đã được lưu trữ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các đơn hàng sẽ xuất hiện ở đây sau khi bạn thực hiện reset doanh thu
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Ngày lưu trữ</TableCell>
                <TableCell>Lý do lưu trữ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {archivedOrders && archivedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id ? order._id.slice(-8) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.user?.full_name || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email || 'No email'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {order.items && order.items.slice(0, 2).map((item, index) => (
                        <Typography key={index} variant="body2">
                          {item.product_name} x{item.quantity}
                        </Typography>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{order.items.length - 2} sản phẩm khác
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.total_price ? order.total_price.toLocaleString() : '0'}đ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.archived_at ? new Date(order.archived_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {order.archive_reason || 'No reason provided'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminArchivedOrdersPage; 