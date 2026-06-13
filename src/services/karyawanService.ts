import api from './api';
import ApiConstants from '../../constants/Api';

export interface Employee {
  id: number;
  nama_lengkap: string;
  nik?: string;
  departemen?: {
    nama: string;
  };
  jabatan?: string | {
    nama: string;
  };
  foto_profil?: string;
  tanggal_lahir?: string;
  status_karyawan?: string;
}

export const karyawanService = {
  getBirthdaysToday: async (): Promise<Employee[]> => {
    try {
      const response = await api.get('/karyawan/birthday-today');
      if (response.data && Array.isArray(response.data.employees)) {
        return response.data.employees;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      return [];
    }
  },
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      // The backend has GET /karyawan which returns DataTables JSON for mobile apps
      // or we can use GET /master-data/karyawan. 
      // Based on user feedback, GET /master-data/karyawan should provide the data.
      const response = await api.get('/master-data/karyawan');
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Fallback if the endpoint returns an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching all employees:', error);
      return [];
    }
  }
};
