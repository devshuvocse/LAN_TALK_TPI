import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Layout/Navbar';
import ProfileEdit from '../Profile/ProfileEdit';
import ProfileView from '../Profile/ProfileView';

const Home = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [showProfileView, setShowProfileView] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    // Load profile picture separately
    const loadProfilePic = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user?.id) return;

        const res = await axios.get(`http://localhost:5000/api/user/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          setProfilePic(res.data.user.profilePic);
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
      }
    };

    loadProfilePic();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setProfilePic(updatedUser.profilePic);
  };

  const handleProfileClick = () => {
    setShowProfileView(true);
  };

  const handleEditClick = () => {
    setShowProfileView(false);
    setShowEditProfile(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} profilePic={profilePic} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-800">Welcome to LAN Talk TPI</h2>
          {/* Add your home page content here */}
        </div>
      </div>

      {/* Profile View Modal */}
      {showProfileView && (
        <ProfileView
          user={user}
          onEdit={handleEditClick}
          onClose={() => setShowProfileView(false)}
        />
      )}

      {/* Profile Edit Modal */}
      {showEditProfile && (
        <ProfileEdit
          user={user}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(updatedUser) => {
            handleProfileUpdate(updatedUser);
            setShowEditProfile(false);
          }}
        />
      )}
    </div>
  );
};

export default Home; 