import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';

const MainLayout: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box component="main" flex={1}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout; 