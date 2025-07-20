import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Sort as SortIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getBeautyTips, getCategories, BeautyTip } from '../services/beautyTips';
import { useAuth } from '../contexts/AuthContext';
import { toggleLikeBeautyTip } from '../services/beautyTips';
import { useNavigate } from 'react-router-dom';

const BeautyTipsPage = () => {
  const [beautyTips, setBeautyTips] = useState<BeautyTip[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const [likeStates, setLikeStates] = useState<Record<string, { liked: boolean; likes: number }>>({});

  const itemsPerPage = 9;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [tips, cats] = await Promise.all([
          getBeautyTips(0, itemsPerPage, 'Tất cả', ''),
          getCategories()
        ]);
        
        // Assuming the API doesn't give total count, so we calculate it
        const allTips = await getBeautyTips(0, 100); // Fetch up to 100 to get total for pagination
        setBeautyTips(tips);
        setTotalPages(Math.ceil(allTips.length / itemsPerPage));

        setCategories(['Tất cả', ...cats]);
      } catch (error) {
        console.error("Failed to fetch beauty tips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Initialize like states from tips data
    const states: Record<string, { liked: boolean; likes: number }> = {};
    beautyTips.forEach((tip) => {
      // If tip.liked_by exists, check if user has liked
      let liked = false;
      if (user && (tip as any).liked_by && Array.isArray((tip as any).liked_by)) {
        liked = (tip as any).liked_by.includes(user._id);
      }
      states[tip._id] = { liked, likes: tip.likes };
    });
    setLikeStates(states);
  }, [beautyTips, user]);

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setLoading(true);
    try {
      const tips = await getBeautyTips((value - 1) * itemsPerPage, itemsPerPage, selectedCategory, searchTerm);
      setBeautyTips(tips);
    } catch (error) {
      console.error("Failed to fetch beauty tips for new page:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    setPage(1);
    setLoading(true);
    try {
      const allTips = await getBeautyTips(0, 100, selectedCategory, searchTerm);
      const tipsForPage = allTips.slice(0, itemsPerPage);
      setBeautyTips(tipsForPage);
      setTotalPages(Math.ceil(allTips.length / itemsPerPage));
    } catch (error) {
      console.error("Failed to fetch beauty tips with search:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
    try {
      const allTips = await getBeautyTips(0, 100, category, searchTerm);
      const tipsForPage = allTips.slice(0, itemsPerPage);
      setBeautyTips(tipsForPage);
      setTotalPages(Math.ceil(allTips.length / itemsPerPage));
    } catch (error) {
      console.error("Failed to fetch beauty tips with category change:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tipId: string) => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    try {
      const result = await toggleLikeBeautyTip(tipId, token);
      setLikeStates((prev) => ({
        ...prev,
        [tipId]: { liked: result.liked, likes: result.likes },
      }));
    } catch {}
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#333' }}>
          Nhật ký làm đẹp
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Khám phá bí quyết & xu hướng làm đẹp mới nhất từ các chuyên gia Flashion
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          sx={{ flex: 1, minWidth: '250px' }}
          placeholder="Tìm kiếm bài viết..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            label="Danh mục"
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch} sx={{ height: '56px' }}>
          Tìm kiếm
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {beautyTips.map((tip) => (
            <Grid item xs={12} sm={6} md={4} key={tip._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={tip.image}
                  alt={tip.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip label={tip.category} color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography gutterBottom variant="h6" component="h2" fontWeight={600} sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '3.5rem' // approx 2 lines
                    }}>
                    <Link to={`/beauty-tips/${tip._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {tip.title}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '4.5rem' // approx 3 lines
                    }}>
                    {tip.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tip.author} • {new Date(tip.created_at).toLocaleDateString('vi-VN')} • {tip.read_time} đọc
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 54, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color={likeStates[tip._id]?.liked ? 'error' : 'default'}
                        onClick={() => handleLike(tip._id)}
                        aria-label={likeStates[tip._id]?.liked ? 'Bỏ thích' : 'Thích'}
                        sx={{ p: 0.5 }}
                      >
                        {likeStates[tip._id]?.liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                      </IconButton>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 18, textAlign: 'center', fontWeight: 500 }}>
                        {likeStates[tip._id]?.likes ?? tip.likes}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: 2, width: '100%' }}
                    component={Link}
                    to={`/beauty-tips/${tip._id}`}
                  >
                    Đọc thêm
                  </Button>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {tip.author} • {new Date(tip.created_at).toLocaleDateString('vi-VN')} • {tip.read_time} đọc
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          disabled={loading}
        />
      </Box>
    </Container>
  );
};

export default BeautyTipsPage; 