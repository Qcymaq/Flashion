import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
  InputAdornment,
  Pagination,
  Tooltip,
  Checkbox,
  Toolbar,
  alpha,
  styled,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { endpoints, fetchWithAuth } from '../config/api';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
}

type ArrayField = 'images' | 'colors';

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  images: [],
  colors: [],
  stock: 0,
  is_active: true
};

// Predefined options
const CATEGORIES = [
  'Kem nền',
  'Kem che khuyết điểm',
  'Phấn phủ',
  'Mascara',
  'Chì kẻ chân mày',
  'Phấn mắt',
  'Kẻ mắt',
  'Son môi',
  'Son dưỡng',
  'Chì kẻ môi',
  'Má hồng'
];

const COMMON_COLORS = [
  'Red', 'Pink', 'Nude', 'Coral', 'Burgundy',
  'Light', 'Medium', 'Dark', 'Tan', 'Beige',
  'Black', 'White', 'Blue', 'Green', 'Yellow',
  'Purple', 'Orange', 'Brown', 'Gray', 'Gold',
  'Silver', 'Rose Gold'
];

const formatVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const BACKEND_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getImageUrl = (img: string | undefined) => {
  if (!img) return '/images/placeholder.png';
  if (img.startsWith('http')) return img;
  return `${BACKEND_BASE_URL}${img}`;
};

const ColorButton = styled(Button)({
  minWidth: '36px',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  padding: 0,
  margin: '0 4px 4px 0',
  border: '2px solid transparent',
  '&.selected': {
    border: '2px solid #000',
  },
});

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [colorPickerValue, setColorPickerValue] = useState('#000000');

  const fetchProducts = useCallback(async () => {
    console.log('Fetching products...');
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(endpoints.admin.products);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login...');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log('Component mounted, fetching products...');
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenDialog = (product?: Product) => {
    console.log('Opening dialog...', { product });
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
        colors: product.colors,
        stock: product.stock,
        is_active: product.is_active
      });
    } else {
      setSelectedProduct(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
    console.log('Dialog state after opening:', { openDialog: true, formData: initialFormData });
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog...');
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData(initialFormData);
    console.log('Dialog state after closing:', { openDialog: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name === 'is_active') {
      setFormData(prev => ({
        ...prev,
        is_active: value === 'true'
      }));
    }
  };

  const handleArrayInputChange = (field: ArrayField, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const handleAddArrayItem = (field: ArrayField) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field: ArrayField, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: Math.round(parseFloat(formData.price.toString())), // VND, no cents
        stock: parseInt(formData.stock.toString()),
        images: formData.images.filter(url => url.trim() !== ''),
        colors: formData.colors.filter(color => color.trim() !== '')
      };

      let response;
      if (selectedProduct) {
        // Update existing product
        response = await fetchWithAuth(endpoints.admin.updateProduct(selectedProduct._id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        response = await fetchWithAuth(endpoints.admin.createProduct, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to save product');
      }

      showSnackbar(`Product ${selectedProduct ? 'updated' : 'created'} successfully`, 'success');
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(error instanceof Error ? error.message : 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      for (const productId of selectedProducts) {
        await fetchWithAuth(endpoints.admin.deleteProduct(productId), {
          method: 'DELETE',
        });
      }
      showSnackbar('Selected products deleted successfully', 'success');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      showSnackbar('Failed to delete products', 'error');
    } finally {
      setLoading(false);
      setBulkDeleteConfirmOpen(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      setLoading(true);
      await fetchWithAuth(endpoints.admin.deleteProduct(productId), {
        method: 'DELETE',
      });
      showSnackbar('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      showSnackbar('Failed to delete product', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const response = await fetchWithAuth(endpoints.admin.updateProduct(productId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      showSnackbar('Product status updated successfully', 'success');
      fetchProducts();
    } catch (error) {
      showSnackbar('Failed to update product status', 'error');
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField as keyof Product];
      const bValue = b[sortField as keyof Product];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Add a useEffect to monitor dialog state
  useEffect(() => {
    console.log('Dialog state changed:', { openDialog });
  }, [openDialog]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading products...</Typography>
        </Box>
        {/* Always render Dialog and Snackbar */}
        {renderDialogAndSnackbar()}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchProducts}>
          Retry
        </Button>
        {/* Always render Dialog and Snackbar */}
        {renderDialogAndSnackbar()}
      </Container>
    );
  }

  // MAIN CONTENT VARIABLE
  let mainContent;
  if (!products || products.length === 0) {
    mainContent = (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No products found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Product
          </Button>
        </Paper>
    );
  } else {
    mainContent = (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Toolbar
              sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(selectedProducts.length > 0 && {
                  bgcolor: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
              }}
            >
              {selectedProducts.length > 0 ? (
                <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
                  {selectedProducts.length} selected
                </Typography>
              ) : (
                <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle">
                  Manage Products
                </Typography>
              )}

              {selectedProducts.length > 0 ? (
                <Tooltip title="Delete">
                  <IconButton onClick={() => setBulkDeleteConfirmOpen(true)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add New Product
                </Button>
              )}
            </Toolbar>

            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                        checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell 
                      onClick={() => handleSort('name')}
                      sx={{ cursor: 'pointer' }}
                    >
                      Name {sortField === 'name' && <SortIcon />}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('price')}
                      sx={{ cursor: 'pointer' }}
                    >
                      Price {sortField === 'price' && <SortIcon />}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('category')}
                      sx={{ cursor: 'pointer' }}
                    >
                      Category {sortField === 'category' && <SortIcon />}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('stock')}
                      sx={{ cursor: 'pointer' }}
                    >
                      Stock {sortField === 'stock' && <SortIcon />}
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          component="img"
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          sx={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{formatVND(product.price)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={product.is_active}
                              onChange={() => handleStatusToggle(product._id, product.is_active)}
                              color="primary"
                            />
                          }
                          label={product.is_active ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => {
                          setProductToDelete(product._id);
                          setDeleteConfirmOpen(true);
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredProducts.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  // Always render Dialog and Snackbar
  function renderDialogAndSnackbar() {
    return (
      <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={() => productToDelete && handleDelete(productToDelete)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedProducts.length} selected products?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error">
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

        {/* Product Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        disablePortal
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
            position: 'relative',
            zIndex: 9999
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center'
          },
          '& .MuiDialog-paper': {
            margin: '32px',
            width: '100%',
            maxWidth: '900px'
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            borderBottom: '1px solid #e0e0e0',
            padding: '16px 24px',
            backgroundColor: '#f5f5f5'
          }}>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent sx={{ 
            padding: '24px',
            '&.MuiDialogContent-root': {
              paddingTop: '24px'
            }
          }}>
            <Stack spacing={3}>
              <TextField
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                sx={{ backgroundColor: '#fff' }}
              />
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                required
                variant="outlined"
                sx={{ backgroundColor: '#fff' }}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0
                }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth required variant="outlined" sx={{ backgroundColor: '#fff' }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={(e: SelectChangeEvent) => {
                    setFormData(prev => ({
                      ...prev,
                      category: e.target.value
                    }));
                  }}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="stock"
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                sx={{ backgroundColor: '#fff' }}
              />
              
              <FormControl fullWidth variant="outlined" sx={{ backgroundColor: '#fff' }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="is_active"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  padding: 2,
                  backgroundColor: '#fff',
                  flex: 1,
                  minWidth: '200px'
                }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Images
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddArrayItem('images')}
                    >
                      Add Image URL
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    {formData.images.map((url, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            value={url}
                            onChange={(e) => handleArrayInputChange('images', index, e.target.value)}
                            placeholder="Enter image URL"
                            variant="outlined"
                            size="small"
                          />
                          <IconButton
                            onClick={() => handleRemoveArrayItem('images', index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        {url && (
                          <Box
                            sx={{
                              mt: 1,
                              position: 'relative',
                              paddingTop: '56.25%', // 16:9 aspect ratio
                              '& img': {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              },
                            }}
                          >
                            <img src={url} alt={`Preview ${index + 1}`} />
                          </Box>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  padding: 2,
                  backgroundColor: '#fff',
                  flex: 1,
                  minWidth: '200px'
                }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Colors
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.colors.map((color, idx) => (
                      <ColorButton
                        key={color + idx}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            colors: prev.colors.filter((_, i) => i !== idx)
                          }));
                        }}
                        title={color}
                      >
                        &nbsp;
                      </ColorButton>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={colorPickerValue}
                      onChange={e => setColorPickerValue(e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        if (!formData.colors.includes(colorPickerValue)) {
                          setFormData(prev => ({ ...prev, colors: [...prev.colors, colorPickerValue] }));
                        }
                        setColorPickerValue('#000000');
                      }}
                    >
                      Thêm màu
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e0e0e0',
            padding: '16px 24px',
            backgroundColor: '#f5f5f5'
          }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
      </>
    );
  }

  // MAIN RETURN
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {mainContent}
      {renderDialogAndSnackbar()}
    </Container>
  );
};

export default AdminProductsPage; 