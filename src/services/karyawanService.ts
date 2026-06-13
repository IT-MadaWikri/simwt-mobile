import api from './api';

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
  tempat_lahir?: string;
  alamat?: string;
  tanggal_masuk_kerja?: string;
  umur?: string | number;
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
      // Based on user feedback, GET /karyawan should provide the data.
      const response = await api.get('/karyawan');

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
  },
  getEmployeeById: async (id: string | number): Promise<Employee | null> => {
    try {
      const response = await api.get(`/karyawan/lihat/${id}`);
      if (response.data && response.data.karyawan) {
        return response.data.karyawan;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching employee detail for ${id}:`, error);
      return null;
    }
  }
};
