import { useContext, useState } from 'react';
import { AuthContext } from '../store/authStore';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch({ type: 'LOGIN', payload: response.data });
      navigate(response.data.role === 'cook' ? '/cook/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/signup', userData);
      dispatch({ type: 'LOGIN', payload: response.data });
      navigate(response.data.role === 'cook' ? '/cook/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    }
  };

  return { user, login, signup, logout, loading, error };
};
