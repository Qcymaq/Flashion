import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  AccountCircle,
  AdminPanelSettings,
  Store,
  ShoppingCart,
  ExitToApp,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import UpgradeMembershipModal from './UpgradeMembershipModal';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'user';
  membership?: string;
  try_on_count?: number;
}

const UserProfile: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(endpoints.auth.me, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  // Helper to get try-on limit
  const getTryOnLimit = (membership?: string) => {
    if (membership === 'gold') return 50;
    if (membership === 'diamond') return '∞';
    return 10;
  };

  if (!user) return null;

  return (
    <Box>
      <IconButton
        size="large"
        onClick={handleMenu}
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {user.name}
        </Typography>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 250, maxWidth: '100%' },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
            Membership: {(user.membership ? user.membership.charAt(0).toUpperCase() + user.membership.slice(1) : "Free")}
          </Typography>
          {typeof user.try_on_count === 'number' && (
            <Typography variant="body2" color="text.secondary">
              Try-on: {user.try_on_count} / {getTryOnLimit(user.membership)}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem onClick={() => handleNavigation('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem onClick={() => setUpgradeOpen(true)}>
          <ListItemIcon>
            <Store fontSize="small" />
          </ListItemIcon>
          Upgrade Membership
        </MenuItem>

        <MenuItem onClick={() => handleNavigation('/orders')}>
          <ListItemIcon>
            <ShoppingCart fontSize="small" />
          </ListItemIcon>
          My Orders
        </MenuItem>

        {user.role === 'admin' && (
          <MenuItem onClick={() => handleNavigation('/admin')}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            Admin Dashboard
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <UpgradeMembershipModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} user={user} />
    </Box>
  );
};

export default UserProfile; 