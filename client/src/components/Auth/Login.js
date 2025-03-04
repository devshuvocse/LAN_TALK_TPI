import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        // Clear location state
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        studentId: formData.studentId,
        password: formData.password
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentIdInput = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '').slice(0, 6);
    setFormData({ ...formData, studentId: numericValue });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/90 to-secondary/90 p-5 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-black tracking-tight flex justify-center items-center select-none">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">L</span>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">A</span>
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">N</span>
            <span className="text-gray-300 mx-1">_</span>
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">T</span>
            <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">A</span>
            <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">L</span>
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">K</span>
            <span className="text-gray-300 mx-1">_</span>
            <span className="bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">T</span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">P</span>
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:scale-110 transition-transform cursor-default">I</span>
          </h2>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 blur-lg opacity-20 animate-pulse"></div>
            <p className="text-gray-600 relative">
              Sign in to your account
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50/80 backdrop-blur-sm text-green-600 p-4 rounded-xl mb-6 border-l-4 border-green-500 shadow-lg animate-fadeIn">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl mb-6 border-l-4 border-red-500 shadow-lg animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="block text-gray-700 font-semibold transition-colors duration-300 group-focus-within:text-primary">
              Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your 6-digit student ID"
                value={formData.studentId}
                onChange={handleStudentIdInput}
                maxLength="6"
                required
                disabled={loading}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-300"
              />
              <i className="fas fa-id-card absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300"></i>
            </div>
            <small className="text-gray-500 text-sm ml-2">Example: 213454</small>
          </div>

          <div className="space-y-2 group">
            <label className="block text-gray-700 font-semibold transition-colors duration-300 group-focus-within:text-primary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setError('');
                  setFormData({...formData, password: e.target.value});
                }}
                required
                disabled={loading}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-300 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors group-focus-within:text-primary"
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-[0_10px_20px_rgba(8,_112,_184,_0.5)] disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 text-center border-t border-gray-200">
          <Link 
            to="/register" 
            className="text-primary hover:text-secondary font-semibold transition-colors inline-flex items-center group"
          >
            New student? Create an account
            <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 