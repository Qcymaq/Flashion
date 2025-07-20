import React, { useEffect, useState, useCallback } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { getConsultations, updateConsultationStatus, deleteConsultation } from '../../services/consultation';
import { useAuth } from '../../contexts/AuthContext';

interface Consultation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
}

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const { token } = useAuth();

  const fetchConsultations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getConsultations(token);
      setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching consultations',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, consultationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsultation(consultationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConsultation(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedConsultation || !token) return;

    try {
      await updateConsultationStatus(selectedConsultation, status, token);
      await fetchConsultations();
      handleMenuClose();
      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating consultation status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConsultation || !token) return;

    try {
      await deleteConsultation(selectedConsultation, token);
      await fetchConsultations();
      setDeleteDialogOpen(false);
      handleMenuClose();
      setSnackbar({
        open: true,
        message: 'Consultation deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting consultation:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting consultation',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý yêu cầu tư vấn
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Dịch vụ</TableCell>
              <TableCell>Yêu cầu</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation._id}>
                <TableCell>{consultation.name}</TableCell>
                <TableCell>{consultation.email}</TableCell>
                <TableCell>{consultation.phone}</TableCell>
                <TableCell>{consultation.service}</TableCell>
                <TableCell>{consultation.message}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      consultation.status === 'pending'
                        ? 'Chờ xử lý'
                        : consultation.status === 'in_progress'
                        ? 'Đang xử lý'
                        : 'Hoàn thành'
                    }
                    color={getStatusColor(consultation.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(consultation.created_at).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, consultation._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>
          Chờ xử lý
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('in_progress')}>
          Đang xử lý
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>
          Hoàn thành
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa yêu cầu tư vấn này?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConsultationsPage; 