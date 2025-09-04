import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getBeautyTips, 
  createBeautyTip, 
  updateBeautyTip, 
  deleteBeautyTip, 
  togglePublishStatus,
  getCategories,
  getBeautyTipsStats,
  BeautyTip,
  BeautyTipCreate,
  BeautyTipUpdate,
  BeautyTipsStats,
  getCommentsForTip,
  deleteComment
} from '../services/beautyTips';
import { useAuth } from '../contexts/AuthContext';

const authors = ['Chuyên gia Flashion', 'Chuyên gia trang điểm Flashion', 'Dermatologist Flashion', 'Chuyên gia Màu sắc'];

// Default categories if none exist in database
const defaultCategories = [
  'Làm đẹp',
  'Trang điểm',
  'Chăm sóc da',
  'Tóc và tạo kiểu',
  'Mỹ phẩm',
  'Xu hướng',
  'Bí quyết',
  'Đánh giá sản phẩm'
];

const AdminBeautyTipsPage = () => {
  const navigate = useNavigate();
  const [beautyTips, setBeautyTips] = useState<BeautyTip[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<BeautyTipsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingTip, setEditingTip] = useState<BeautyTip | null>(null);
  const [viewingTip, setViewingTip] = useState<BeautyTip | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const { token } = useAuth();
  const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [commentDeleteLoading, setCommentDeleteLoading] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    full_content: '',
    image: '',
    category: '',
    tags: [] as string[],
    author: '',
    read_time: '',
    is_published: true,
    related_articles: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tipsData, categoriesData, statsData] = await Promise.all([
        getBeautyTips(0, 100, undefined, undefined, false), // Get all tips including drafts
        getCategories(),
        getBeautyTipsStats()
      ]);
      
      setBeautyTips(tipsData);
      
      // Use default categories if database returns empty or invalid categories
      const validCategories = categoriesData.filter(cat => cat && cat.trim() !== '');
      if (validCategories.length === 0) {
        setCategories(defaultCategories);
      } else {
        setCategories(validCategories);
      }
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu', severity: 'error' });
      // Use default categories on error
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tip?: BeautyTip) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        title: tip.title,
        excerpt: tip.excerpt,
        content: tip.content,
        full_content: tip.full_content,
        image: tip.image,
        category: tip.category,
        tags: tip.tags,
        author: tip.author,
        read_time: tip.read_time,
        is_published: tip.is_published,
        related_articles: tip.related_articles
      });
    } else {
      setEditingTip(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        full_content: '',
        image: '',
        category: '',
        tags: [],
        author: '',
        read_time: '',
        is_published: true,
        related_articles: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTip(null);
  };

  const handleOpenViewDialog = (tip: BeautyTip) => {
    setViewingTip(tip);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingTip(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTip) {
        // Update existing tip
        const updateData: BeautyTipUpdate = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          full_content: formData.full_content,
          image: formData.image,
          category: formData.category,
          tags: formData.tags,
          author: formData.author,
          read_time: formData.read_time,
          is_published: formData.is_published,
          related_articles: formData.related_articles
        };
        
        await updateBeautyTip(editingTip._id, updateData);
        setSnackbar({ open: true, message: 'Cập nhật bài viết thành công!', severity: 'success' });
      } else {
        // Create new tip
        const createData: BeautyTipCreate = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          full_content: formData.full_content,
          image: formData.image,
          category: formData.category,
          tags: formData.tags,
          author: formData.author,
          read_time: formData.read_time,
          is_published: formData.is_published,
          related_articles: formData.related_articles
        };
        
        await createBeautyTip(createData);
        setSnackbar({ open: true, message: 'Tạo bài viết mới thành công!', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving beauty tip:', error);
      setSnackbar({ open: true, message: 'Lỗi khi lưu bài viết', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteBeautyTip(id);
        setSnackbar({ open: true, message: 'Xóa bài viết thành công!', severity: 'success' });
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting beauty tip:', error);
        setSnackbar({ open: true, message: 'Lỗi khi xóa bài viết', severity: 'error' });
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublishStatus(id);
      setSnackbar({ 
        open: true, 
        message: 'Cập nhật trạng thái thành công!', 
        severity: 'success' 
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTips = beautyTips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedTips = filteredTips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenCommentsDialog = async (tipId: string) => {
    setSelectedTipId(tipId);
    setOpenCommentsDialog(true);
    setCommentsLoading(true);
    try {
      const data = await getCommentsForTip(tipId);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCloseCommentsDialog = () => {
    setOpenCommentsDialog(false);
    setComments([]);
    setSelectedTipId(null);
  };

  const handleDeleteComment = async (tipId: string, commentId: string) => {
    if (!token) return;
    setCommentDeleteLoading(commentId);
    try {
      await deleteComment(tipId, commentId, token);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setDeleteSuccess('Đã xóa bình luận thành công!');
    } catch (error: any) {
      // Ignore 404 errors (already deleted)
      if (error.message && error.message.includes('404')) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setDeleteSuccess('Đã xóa bình luận thành công!');
      } else {
        alert('Không thể xóa bình luận');
      }
    } finally {
      setCommentDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý Nhật ký làm đẹp
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#222' } }}
        >
          Thêm bài viết mới
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {stats.total_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng bài viết
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {stats.published_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã xuất bản
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {stats.total_views.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng lượt xem
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                {stats.total_likes.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng lượt thích
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Danh mục"
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Tổng: ${filteredTips.length} bài viết`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Đã xuất bản: ${filteredTips.filter(t => t.is_published).length}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`Bản nháp: ${filteredTips.filter(t => !t.is_published).length}`} 
                color="warning" 
                variant="outlined" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Lượt xem</TableCell>
              <TableCell>Lượt thích</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTips.map((tip) => (
              <TableRow key={tip._id} hover>
                <TableCell>
                  <Box
                    component="img"
                    src={tip.image}
                    alt={tip.title}
                    sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {tip.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {tip.excerpt.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={tip.category} size="small" color="primary" />
                </TableCell>
                <TableCell>{tip.author}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tip.views.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {tip.likes.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(tip.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenViewDialog(tip)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(tip)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(tip._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Quản lý bình luận">
                      <IconButton onClick={() => handleOpenCommentsDialog(tip._id)}>
                        <CommentIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTips.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTip ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề bài viết"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tóm tắt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Danh mục"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tác giả</InputLabel>
                <Select
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  label="Tác giả"
                >
                  {authors.map((author) => (
                    <MenuItem key={author} value={author}>{author}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời gian đọc (VD: 5 phút)"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL hình ảnh"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                placeholder="VD: Trẻ hóa, Tại nhà, Tự nhiên"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội dung tóm tắt"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội dung đầy đủ (HTML)"
                value={formData.full_content}
                onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
                multiline
                rows={8}
                required
                helperText="Sử dụng HTML để định dạng nội dung (VD: <h2>Tiêu đề</h2><p>Nội dung</p>)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                }
                label="Xuất bản ngay"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Related Articles (IDs, separated by commas)"
                value={formData.related_articles.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  related_articles: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                })}
                placeholder="VD: 1, 2, 3"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTip ? 'Cập nhật' : 'Tạo bài viết'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết bài viết
        </DialogTitle>
        <DialogContent>
          {viewingTip && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <img 
                  src={viewingTip.image} 
                  alt={viewingTip.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                {viewingTip.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={viewingTip.category} color="primary" />
                <Chip label={viewingTip.read_time} variant="outlined" />
                <Chip label={viewingTip.is_published ? 'Đã xuất bản' : 'Bản nháp'} 
                      color={viewingTip.is_published ? 'success' : 'warning'} />
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {viewingTip.excerpt}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tác giả: {viewingTip.author}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Lượt xem: {viewingTip.views.toLocaleString()}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày tạo: {new Date(viewingTip.created_at).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags:</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {viewingTip.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Nội dung:</Typography>
              <div 
                dangerouslySetInnerHTML={{ __html: viewingTip.full_content }}
                style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '4px', 
                  padding: '16px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              if (viewingTip) handleOpenDialog(viewingTip);
            }} 
            variant="contained"
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={openCommentsDialog} onClose={handleCloseCommentsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Quản lý bình luận</DialogTitle>
        <DialogContent>
          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : deleteSuccess && (
            <Alert severity="success" onClose={() => setDeleteSuccess(null)} sx={{ mb: 2 }}>
              {deleteSuccess}
            </Alert>
          )}
          {comments.length === 0 ? (
            <Typography color="text.secondary">Chưa có bình luận nào cho bài viết này.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((c) => (
                <Box key={c._id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', borderBottom: '1px solid #eee', pb: 1 }}>
                  <Avatar src={c.user_avatar || undefined} alt={c.user_name} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>{c.user_name}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{c.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(c.created_at).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                  <IconButton color="error" onClick={() => { if (selectedTipId) handleDeleteComment(selectedTipId, c._id); }} disabled={commentDeleteLoading === c._id}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentsDialog}>Đóng</Button>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminBeautyTipsPage; 