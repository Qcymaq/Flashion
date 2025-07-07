import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  Review,
  ReviewStats,
  CreateReviewData,
  createReview,
  getProductReviews,
  getProductReviewStats,
  updateReview,
  deleteReview,
} from '../services/reviews';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [totalPages, setTotalPages] = useState(1);
  
  // Review form states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const limit = 5; // Reviews per page

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const reviewsData = await getProductReviews(productId, page, limit, sortBy, 'desc');
      setReviews(reviewsData);
      // For simplicity, we'll assume we have total pages based on the limit
      // In a real app, you'd get this from the API response
      setTotalPages(Math.ceil((stats?.total_reviews || 0) / limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, page, sortBy, stats]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getProductReviewStats(productId);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  const handleOpenReviewDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setRating(review.rating);
      setComment(review.comment);
    } else {
      setEditingReview(null);
      setRating(5);
      setComment('');
    }
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setEditingReview(null);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập nội dung đánh giá',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingReview) {
        // Update existing review
        await updateReview(editingReview._id, { rating, comment });
        setSnackbar({
          open: true,
          message: 'Đánh giá đã được cập nhật thành công',
          severity: 'success',
        });
      } else {
        // Create new review
        const reviewData: CreateReviewData = {
          product_id: productId,
          rating,
          comment: comment.trim(),
        };
        await createReview(reviewData);
        setSnackbar({
          open: true,
          message: 'Đánh giá đã được gửi thành công',
          severity: 'success',
        });
      }
      
      handleCloseReviewDialog();
      fetchReviews();
      fetchStats();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Có lỗi xảy ra',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setSnackbar({
        open: true,
        message: 'Đánh giá đã được xóa thành công',
        severity: 'success',
      });
      fetchReviews();
      fetchStats();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa đánh giá',
        severity: 'error',
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedReview(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingPercentage = (rating: number) => {
    if (!stats || stats.total_reviews === 0) return 0;
    const ratingKey = rating.toString() as keyof typeof stats.rating_distribution;
    return Math.round((stats.rating_distribution[ratingKey] / stats.total_reviews) * 100);
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Review Statistics */}
      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Đánh giá sản phẩm
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {/* Overall Rating */}
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.average_rating.toFixed(1)}
                </Typography>
                <Rating value={stats.average_rating} precision={0.1} readOnly size="large" />
                <Typography variant="body2" color="text.secondary">
                  {stats.total_reviews} đánh giá
                </Typography>
                {stats.verified_purchases > 0 && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    <VerifiedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    {stats.verified_purchases} đánh giá từ người mua
                  </Typography>
                )}
              </Box>

              {/* Rating Distribution */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {star} <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getRatingPercentage(star)}
                      sx={{ flex: 1, mx: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {stats.rating_distribution[star.toString() as keyof typeof stats.rating_distribution]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Review Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Đánh giá từ khách hàng ({stats?.total_reviews || 0})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sắp xếp"
            >
              <MenuItem value="created_at">Mới nhất</MenuItem>
              <MenuItem value="rating">Đánh giá</MenuItem>
            </Select>
          </FormControl>
          
          {isAuthenticated && (
            <Button
              variant="contained"
              onClick={() => handleOpenReviewDialog()}
              sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
            >
              Viết đánh giá
            </Button>
          )}
        </Box>
      </Box>

      {/* Reviews List */}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Chưa có đánh giá nào cho sản phẩm này
            </Typography>
            {isAuthenticated && (
              <Button
                variant="outlined"
                onClick={() => handleOpenReviewDialog()}
                sx={{ mt: 2 }}
              >
                Viết đánh giá đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {reviews.map((review) => (
            <Card key={review._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={review.user_avatar} alt={review.user_name}>
                      {review.user_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.user_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={review.rating} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(review.created_at)}
                        </Typography>
                        {review.is_verified_purchase && (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="Đã mua"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  {isAuthenticated && user?._id === review.user_id && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, review)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá cho ' + productName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Đánh giá của bạn:
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue || 5)}
              size="large"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nội dung đánh giá"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submitting || !comment.trim()}
            sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
          >
            {submitting ? <CircularProgress size={20} /> : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedReview) {
              handleOpenReviewDialog(selectedReview);
            }
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReview) {
              handleDeleteReview(selectedReview._id);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductReviews; 