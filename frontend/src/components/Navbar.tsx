import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  styled,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  InputBase,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { endpoints } from '../config/api';

const NavButton = styled(Button)({
  color: '#fff',
  margin: '0 8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const Logo = styled(RouterLink)({
  color: '#fff',
  textDecoration: 'none',
  fontSize: '24px',
  fontWeight: 'bold',
});

const SearchInput = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate total items in cart
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      setLoading(true);
      try {
        const response = await fetch(`${endpoints.products.list}/search?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      }
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId: string) => {
    handleSearchClose();
    navigate(`/studio/${productId}`);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#000' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Logo to="/">
          FLASHion
        </Logo>
        <Box>
          <RouterLink to="/products" style={{ textDecoration: 'none' }}>
            <NavButton>
              SẢN PHẨM
            </NavButton>
          </RouterLink>
          <RouterLink to="/beauty-tips" style={{ textDecoration: 'none' }}>
            <NavButton>
              NHẬT KÝ LÀM ĐẸP
            </NavButton>
          </RouterLink>
          <RouterLink to="/guide" style={{ textDecoration: 'none' }}>
            <NavButton>
              HƯỚNG DẪN
            </NavButton>
          </RouterLink>
          <RouterLink to="/about" style={{ textDecoration: 'none' }}>
            <NavButton>
              VỀ CHÚNG TÔI
            </NavButton>
          </RouterLink>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={() => navigate('/cart')}>
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleSearchClick}>
            <SearchIcon />
          </IconButton>
          {user ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  ml: 1,
                }}
                onClick={handleMenu}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    ml: 1,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {user.name}
                </Typography>
              </Box>
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
                </Box>
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/orders'); handleClose(); }}>
                  My Orders
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                    Admin Dashboard
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton color="inherit" onClick={() => navigate('/login')}>
              <PersonIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={handleSearchClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            position: 'absolute',
            top: '64px',
            margin: 0,
            borderRadius: '0 0 4px 4px',
          },
        }}
      >
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              autoFocus
            />
          </Box>
          <List>
            {loading ? (
              <ListItem>
                <ListItemText primary="Đang tìm kiếm..." />
              </ListItem>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <ListItem
                  key={product._id}
                  button
                  onClick={() => handleProductClick(product._id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={product.images[0]}
                      alt={product.name}
                      variant="rounded"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.price.toLocaleString('vi-VN')}đ`}
                  />
                </ListItem>
              ))
            ) : searchTerm.length >= 2 ? (
              <ListItem>
                <ListItemText primary="Không tìm thấy sản phẩm" />
              </ListItem>
            ) : null}
          </List>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
};

export default Navbar; 