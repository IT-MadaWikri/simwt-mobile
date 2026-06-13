/**
 * SIMWT Mobile — TypeScript Type Definitions
 */

export interface User {
  id: number;
  name: string;
  nama_lengkap?: string;
  username: string;
  email: string;
  role?: string;
  avatar?: string;
  department?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
  token?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
  created_at: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  service: string;
  serviceIcon: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'in_progress';
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  category: string;
}
