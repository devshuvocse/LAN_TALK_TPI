import React from 'react';

const ProfileView = ({ user, onEdit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img 
              src={user.profilePic} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
            />
            <button
              onClick={onEdit}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mt-4">{user.fullName}</h3>
          <p className="text-gray-500">{user.studentId}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-building text-primary"></i>
              <span className="text-gray-600">Department</span>
            </div>
            <span className="font-medium">{user.department}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-calendar text-primary"></i>
              <span className="text-gray-600">Session</span>
            </div>
            <span className="font-medium">{user.session}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-users text-primary"></i>
              <span className="text-gray-600">Group</span>
            </div>
            <span className="font-medium">Group {user.group}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-clock text-primary"></i>
              <span className="text-gray-600">Shift</span>
            </div>
            <span className="font-medium">{user.shift} Shift</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-phone text-primary"></i>
              <span className="text-gray-600">Phone</span>
            </div>
            <span className="font-medium">{user.phone}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <i className="fas fa-tint text-primary"></i>
              <span className="text-gray-600">Blood Group</span>
            </div>
            <span className="font-medium">{user.blood}</span>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <i className="fas fa-pencil-alt"></i>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileView; 