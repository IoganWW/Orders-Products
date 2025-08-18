// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  return error.response?.data?.error || 
         error.response?.data?.message || 
         error.message || 
         'Unknown error occurred';
};