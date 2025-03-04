import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ user, profilePic }) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get(
        `http://localhost:5000/api/user/search?q=${encodeURIComponent(query)}`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );

      if (res.data.success) {
        setResults(res.data.users);
      } else {
        console.error('Search failed:', res.data.message);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add debounced search for real-time results
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.trim()) {
        handleSearch({ preventDefault: () => {} });
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-800 hover:text-primary transition-colors">
              LAN Talk TPI
            </Link>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-2xl mx-8 flex items-center">
            <div className="w-full relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search by name, ID, or department..."
                  className="w-[50%] pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </form>

              {/* Search Results Dropdown */}
              {showSearch && (
                <div className="absolute w-[50%] left-0 right-0 mt-1 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {results.map(user => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.id}`}
                          onClick={() => setShowSearch(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <i className="fas fa-user text-gray-400"></i>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{user.fullName}</h4>
                            <div className="text-xs text-gray-500">
                              <span>{user.studentId}</span>
                              <span className="mx-1">•</span>
                              <span>{user.department}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {query && results.length === 0 && !loading && (
                        <div className="text-center py-4 text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {/* Profile Picture & Name */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-medium hidden md:block">
                {user?.fullName}
              </span>
              <Link 
                to={`/profile/${user?.id}`}
                className="relative group"
              >
                <img 
                  src={profilePic || user?.profilePic || '/default-avatar.png'} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-300 cursor-pointer"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 