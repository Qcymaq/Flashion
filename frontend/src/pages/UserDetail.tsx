import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { endpoints } from '../config/api';

interface User {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(`${endpoints.admin.users}/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin');
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
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Quay lại
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Không tìm thấy người dùng
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Quay lại
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h5" component="h1">
            Thông tin người dùng
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  mb: 2,
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user.full_name || 'Không có tên'}
              </Typography>
              <Typography color="text.secondary">
                {user.role || 'Không xác định'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={user.email || 'Không có email'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Ngày tạo"
                  secondary={user.created_at ? new Date(user.created_at).toLocaleString() : 'Không xác định'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Cập nhật lần cuối"
                  secondary={user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Không xác định'}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserDetail; 