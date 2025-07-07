import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Chip,
  Avatar,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  TextField,
  Button,
  Divider,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Send
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getBeautyTip, toggleLikeBeautyTip, addCommentToTip, getCommentsForTip } from '../services/beautyTips';

interface BeautyTip {
  _id: string;
  title: string;
  excerpt: string;
  full_content: string;
  image: string;
  category: string;
  author: string;
  author_avatar: string;
  read_time: string;
  views: number;
  likes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Comment {
  _id: string;
  content: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

const BeautyTipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tip, setTip] = useState<BeautyTip | null>(null);
  const [relatedTips, setRelatedTips] = useState<BeautyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, token } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [likeState, setLikeState] = useState<{ liked: boolean; likes: number }>({ liked: false, likes: 0 });

  useEffect(() => {
    const fetchTipData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Unique view logic
        const viewedKey = `viewed_tip_${id}`;
        let tipData;
        if (!sessionStorage.getItem(viewedKey)) {
          tipData = await getBeautyTip(id); // This will increment view count
          sessionStorage.setItem(viewedKey, '1');
        } else {
          // Fetch without incrementing view (simulate by not calling backend, or call and ignore increment)
          tipData = await getBeautyTip(id); // Optionally, you could create a separate endpoint for no-increment
        }
        setTip(tipData);
      } catch (error) {
        console.error("Failed to fetch beauty tip:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTipData();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        const data = await getCommentsForTip(id);
        setComments(data);
      } catch (error) {
        setComments([]);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (tip && user) {
      let liked = false;
      if ((tip as any).liked_by && Array.isArray((tip as any).liked_by)) {
        liked = (tip as any).liked_by.includes(user._id);
      }
      setLikeState({ liked, likes: tip.likes });
    } else if (tip) {
      setLikeState({ liked: false, likes: tip.likes });
    }
  }, [tip, user]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      if (!id || !token) return;
      await addCommentToTip(id, commentContent, token);
      setCommentContent('');
      // Refresh comments
      const data = await getCommentsForTip(id);
      setComments(data);
    } catch (error: any) {
      setCommentError(error.message || 'Lỗi khi gửi bình luận');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !token || !tip) {
      navigate('/login');
      return;
    }
    try {
      const result = await toggleLikeBeautyTip(tip._id, token);
      setLikeState({ liked: result.liked, likes: result.likes });
    } catch {}
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tip) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Bài viết không tồn tại
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
        </Typography>
        <Button component={RouterLink} to="/beauty-tips" variant="contained" sx={{ mt: 3 }}>
          Quay lại trang Nhật ký làm đẹp
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Grid container spacing={5}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Header */}
            <Chip label={tip.category} color="primary" sx={{ mb: 2 }} />
            <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
              {tip.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {tip.excerpt}
            </Typography>

            {/* Author Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={tip.author_avatar} alt={tip.author} sx={{ width: 56, height: 56, mr: 2 }} />
              <Box>
                <Typography variant="body1" fontWeight={600}>{tip.author}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(tip.created_at).toLocaleDateString('vi-VN')} • {tip.read_time} đọc • 👁️ {tip.views.toLocaleString()} lượt xem
                </Typography>
              </Box>
            </Box>

            {/* Image */}
            <CardMedia
              component="img"
              image={tip.image}
              alt={tip.title}
              sx={{ width: '100%', borderRadius: 2, mb: 4 }}
            />

            {/* Full Content */}
            <Box
              className="article-content"
              sx={{
                '& h2': { mt: 4, mb: 2, fontSize: '1.75rem' },
                '& h3': { mt: 3, mb: 1, fontSize: '1.5rem' },
                '& p': { mb: 2, lineHeight: 1.7, fontSize: '1.1rem' },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 1 },
                '& strong': { fontWeight: 'bold' }
              }}
              dangerouslySetInnerHTML={{ __html: tip.full_content }}
            />
            
            <Divider sx={{ my: 4 }} />

            {/* Tags and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: { xs: 2, md: 0 } }}>
                {tip.tags.map((tag: string) => (
                  <Chip key={tag} label={tag} variant="outlined" />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton
                  color={likeState.liked ? 'error' : 'default'}
                  onClick={handleLike}
                  aria-label={likeState.liked ? 'Bỏ thích' : 'Thích'}
                >
                  {likeState.liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {likeState.likes}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {/* Comments Section */}
            <Typography variant="h6" fontWeight={600} sx={{ my: 2 }}>
              Bình luận ({comments.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit}>
                  <TextField
                    multiline
                    rows={3}
                    placeholder="Viết bình luận của bạn..."
                    fullWidth
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton type="submit" disabled={commentLoading || !commentContent.trim()}>
                            <Send />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  {commentError && <Typography color="error" fontSize={14} sx={{ mt: 1 }}>{commentError}</Typography>}
                </form>
              ) : (
                <Typography color="text.secondary" fontSize={14}>
                  Vui lòng <RouterLink to="/login">đăng nhập</RouterLink> để bình luận.
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments.length === 0 && (
                  <Typography color="text.secondary" fontSize={14}>Chưa có bình luận nào.</Typography>
                )}
                {comments.map((c) => (
                  <Box key={c._id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar src={c.user_avatar || undefined} alt={c.user_name} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>{c.user_name}</Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>{c.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.created_at).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BeautyTipDetailPage; 