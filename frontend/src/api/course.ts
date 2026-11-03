import { api } from './client';

export interface Course {
  _id: string;       
  id?: string;
  title: string;     
  description: string;
  price?: number;    
  instructorId?: string;
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get('/courses');
  return response.data;
};