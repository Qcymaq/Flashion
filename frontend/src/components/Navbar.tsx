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
  Chip,
  Card,
  CardContent,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { endpoints } from '../config/api';
import UpgradeMembershipModal from './UpgradeMembershipModal';

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

const UpgradeButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
  color: '#000',
  fontWeight: 'bold',
  borderRadius: '20px',
  padding: '8px 16px',
  margin: '0 8px',
  textTransform: 'none',
  boxShadow: '0 3px 5px 2px rgba(255, 215, 0, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FFA500 30%, #FFD700 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 10px 2px rgba(255, 215, 0, .4)',
  },
  transition: 'all 0.3s ease',
}));

// Add or update the User interface/type to include membership and try_on_count
interface User {
  name: string;
  email: string;
  role: string;
  membership?: string;
  try_on_count?: number;
  // ...other fields as needed
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user: rawUser, logout } = useAuth();
  const user = rawUser as User;
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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

  const getMembershipIcon = (membership?: string) => {
    switch (membership) {
      case 'gold':
        return <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />;
      case 'diamond':
        return <DiamondIcon sx={{ color: '#B9F2FF', fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getMembershipLabel = (membership?: string) => {
    switch (membership) {
      case 'gold':
        return 'Gold';
      case 'diamond':
        return 'Diamond';
      default:
        return 'Free';
    }
  };

  const getMembershipColor = (membership?: string) => {
    switch (membership) {
      case 'gold':
        return '#FFD700';
      case 'diamond':
        return '#B9F2FF';
      default:
        return '#666';
    }
  };

  const shouldShowUpgradeButton = () => {
    return user && user.role !== 'admin' && user.membership !== 'diamond';
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
          
          {/* Upgrade Membership Button - More Prominent */}
          {shouldShowUpgradeButton() && (
            <Tooltip title="Nâng cấp thành viên để có thêm quyền lợi" arrow>
              <UpgradeButton
                onClick={() => setUpgradeOpen(true)}
                startIcon={<UpgradeIcon />}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Nâng cấp {user?.membership === 'gold' ? 'lên Diamond' : 'thành viên'}
              </UpgradeButton>
            </Tooltip>
          )}

          {user ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  ml: 1,
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
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
                <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      lineHeight: 1,
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getMembershipIcon(user.membership)}
                    <Typography
                      variant="caption"
                      sx={{
                        color: getMembershipColor(user.membership),
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    >
                      {getMembershipLabel(user.membership)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: { 
                    width: 280, 
                    maxWidth: '100%',
                    mt: 1,
                    borderRadius: 2,
                  },
                }}
                TransitionComponent={Zoom}
              >
                {/* User Info Card */}
                <Card sx={{ m: 1, bgcolor: 'grey.50' }}>
                  <CardContent sx={{ pb: '8px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Membership Status */}
                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                     {user.role === 'admin' ? (
                       <Chip 
                         label="ADMIN"
                         size="small"
                         color="error"
                         variant="outlined"
                       />
                     ) : (
                       <>
                         {getMembershipIcon(user.membership)}
                         <Chip 
                           label={`Hạng ${getMembershipLabel(user.membership)}`}
                           size="small"
                           color={user.membership === 'diamond' ? 'secondary' : user.membership === 'gold' ? 'warning' : 'default'}
                           variant="outlined"
                         />
                       </>
                     )}
                   </Box>
                   
                   {/* Try-on Count */}
                   {user.role !== 'admin' && typeof user.try_on_count === 'number' && (
                     <Typography variant="caption" color="text.secondary">
                       Đã thử: {user.try_on_count} / {user.membership === 'gold' ? 50 : user.membership === 'diamond' ? '∞' : 10}
                     </Typography>
                   )}
                  </CardContent>
                </Card>

                <Divider />

                {/* Menu Items */}
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  <Typography>Hồ sơ cá nhân</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { navigate('/orders'); handleClose(); }}>
                  <Typography>Đơn hàng của tôi</Typography>
                </MenuItem>



                {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                    <Typography>Bảng điều khiển quản trị</Typography>
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <Typography>Đăng xuất</Typography>
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
      
      <UpgradeMembershipModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} user={user} />
    </AppBar>
  );
};

export default Navbar; 
