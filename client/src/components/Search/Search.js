import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../Layout/Navbar';

const Search = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/user/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResults(res.data.users);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Error searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="py-8">
        <div className="w-full max-w-2xl mx-auto px-4">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Students</h1>
            <p className="text-gray-600">Find students by name, ID or department</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ID, or department..."
                className="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                <i className="fas fa-search text-xl"></i>
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
              {error}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {results.map(user => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-center space-x-4">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <i className="fas fa-user text-gray-400 text-xl"></i>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                    <div className="text-sm text-gray-500 space-x-2">
                      <span>ID: {user.studentId}</span>
                      <span>•</span>
                      <span>{user.department}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {results.length === 0 && query && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-gray-600 text-lg">No results found</h3>
                <p className="text-gray-500">Try different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 