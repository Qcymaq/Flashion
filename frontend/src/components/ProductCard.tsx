import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Rating, Box, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
}

const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: '8px',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
});

const BuyButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: '20px',
  padding: '8px 24px',
  '&:hover': {
    backgroundColor: '#333',
  },
});

const ProductCard = ({ id, name, price, rating, reviews, image }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <StyledCard>
      <Link to={`/studio/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={name}
        />
        <CardContent>
          <Typography variant="h6" component="div" noWrap>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={rating} precision={0.5} size="small" readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({reviews})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Giá: {price.toLocaleString()}đ
            </Typography>
            <BuyButton variant="contained" size="small" onClick={(e) => {
              e.preventDefault();
              navigate(`/studio/${id}`);
            }}>
              Thử Ngay
            </BuyButton>
          </Box>
        </CardContent>
      </Link>
    </StyledCard>
  );
};

export default ProductCard; 