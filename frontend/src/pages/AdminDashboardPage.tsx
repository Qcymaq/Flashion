import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingBag as ProductsIcon,
  Category as CategoriesIcon,
  LocalShipping as OrdersIcon,
  Payment as PaymentsIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from '../config/api';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
}

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      bgcolor: '#f5f5f5',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography color="text.secondary" variant="h6">
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<ProductsIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon={<CategoriesIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<OrdersIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`${stats.totalRevenue.toLocaleString()}đ`}
            icon={<PaymentsIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage; 