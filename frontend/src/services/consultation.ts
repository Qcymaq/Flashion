import axios from 'axios';

// Use HTTPS and your domain for production
const API_URL = process.env.REACT_APP_API_URL || 'https://flashion.xyz/api';

export interface ConsultationForm {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export const submitConsultation = async (formData: ConsultationForm) => {
  try {
    const response = await axios.post(`${API_URL}/consultations/`, formData);
    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle validation errors (422)
      if (status === 422 && data.detail) {
        const validationErrors = data.detail;
        let errorMessage = 'Vui lòng kiểm tra lại thông tin:\n';
        
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err: any) => {
            const field = err.loc[err.loc.length - 1];
            const message = err.msg;
            
            switch (field) {
              case 'email':
                errorMessage += '• Email không hợp lệ. Vui lòng nhập email đúng định dạng (ví dụ: example@email.com)\n';
                break;
              case 'name':
                errorMessage += '• Tên không được để trống\n';
                break;
              case 'phone':
                errorMessage += '• Số điện thoại không được để trống\n';
                break;
              case 'service':
                errorMessage += '• Vui lòng chọn dịch vụ quan tâm\n';
                break;
              case 'message':
                errorMessage += '• Nội dung không được để trống\n';
                break;
              default:
                errorMessage += `• ${message}\n`;
            }
          });
        } else {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Handle other HTTP errors
      if (status === 400) {
        throw new Error('Dữ liệu gửi không đúng định dạng. Vui lòng thử lại.');
      }
      
      if (status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      }
      
      // Generic error message for other status codes
      throw new Error(`Lỗi ${status}: ${data.detail || 'Có lỗi xảy ra'}`);
    }
    
    // Handle network errors
    if (error.request) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.');
    }
    
    // Handle other errors
    throw new Error('Có lỗi xảy ra. Vui lòng thử lại sau.');
  }
};

export const getConsultations = async (token: string | null): Promise<any> => {
  if (!token) throw new Error('Authentication required');
  try {
    const response = await axios.get(`${API_URL}/consultations/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateConsultationStatus = async (consultationId: string, status: string, token: string | null): Promise<any> => {
  if (!token) throw new Error('Authentication required');
  try {
    const response = await axios.put(
      `${API_URL}/consultations/${consultationId}/status?status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteConsultation = async (consultationId: string, token: string | null): Promise<any> => {
  if (!token) throw new Error('Authentication required');
  try {
    const response = await axios.delete(
      `${API_URL}/consultations/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}; 