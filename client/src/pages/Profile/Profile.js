import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProfileEdit from '../../components/Profile/ProfileEdit';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser?.id === id;
  const [phonePrivacy, setPhonePrivacy] = useState(user?.phonePrivacy || 'private');
  const [profilePrivacy, setProfilePrivacy] = useState(user?.profilePrivacy || 'public');
  const [activeTab, setActiveTab] = useState('posts');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    link: '',
    technologies: []
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/user/profile/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Profile Data:', res.data);

        if (res.data.success) {
          setUser(res.data.user);
          setProfilePrivacy(res.data.user.profilePrivacy);
          setPhonePrivacy(res.data.user.phonePrivacy);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  const handlePrivacyToggle = async () => {
    try {
      const newPrivacy = phonePrivacy === 'public' ? 'private' : 'public';
      
      const res = await axios.patch(
        `http://localhost:5000/api/user/phone-privacy/${id}`,
        { privacy: newPrivacy },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.data.success) {
        setPhonePrivacy(newPrivacy);
        setUser({ ...user, phonePrivacy: newPrivacy });
      }
    } catch (err) {
      console.error('Error updating privacy:', err);
    }
  };

  const handleProfilePrivacyToggle = async () => {
    try {
      const newPrivacy = profilePrivacy === 'public' ? 'private' : 'public';
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      console.log('Toggling privacy:', {
        currentPrivacy: profilePrivacy,
        newPrivacy,
        userId: id
      });

      const res = await axios.patch(
        `http://localhost:5000/api/user/profile-privacy/${id}`,
        { privacy: newPrivacy },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Server response:', res.data);

      if (res.data.success) {
        setProfilePrivacy(newPrivacy);
        setUser(prev => ({
          ...prev,
          profilePrivacy: newPrivacy
        }));
        alert(res.data.message);
      }
    } catch (err) {
      console.error('Error updating profile privacy:', err);
      alert(err.response?.data?.message || 'Error updating profile privacy');
    }
  };

  const handleAddSkill = async () => {
    try {
      if (!id) {
        alert('Invalid profile ID');
        return;
      }

      console.log('Adding skill:', newSkill);
      console.log('User ID:', id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      console.log('Token:', token);

      const res = await axios.post(
        `http://localhost:5000/api/user/skills/${id}`,
        { skill: newSkill },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Response:', res.data);

      if (res.data.success) {
        setUser({ ...user, skills: [...(user.skills || []), newSkill] });
        setNewSkill('');
        setShowAddSkill(false);
      }
    } catch (err) {
      console.error('Error adding skill:', err.response?.data || err);
      alert(err.response?.data?.message || 'Error adding skill');
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/user/skills/${id}/${skill}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.data.success) {
        setUser({ 
          ...user, 
          skills: user.skills.filter(s => s !== skill) 
        });
      }
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/user/projects/${id}`,
        newProject,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.data.success) {
        setUser({ 
          ...user, 
          projects: [...(user.projects || []), { ...newProject, id: res.data.projectId }] 
        });
        setNewProject({
          title: '',
          description: '',
          link: '',
          technologies: []
        });
        setShowAddProject(false);
      }
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  const handleRemoveProject = async (projectId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/user/projects/${id}/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.data.success) {
        setUser({
          ...user,
          projects: user.projects.filter(p => p.id !== projectId)
        });
      }
    } catch (err) {
      console.error('Error removing project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover & Profile Section - Always Public */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          {/* Cover Photo */}
          <div className="h-60 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-b-lg relative flex items-center justify-center">
            {/* TPI Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-[120px] font-bold text-gray-100/20 select-none tracking-widest">
                TPI
              </h1>
            </div>
            
            {/* Update Cover Button */}
            {isOwnProfile && (
              <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-all duration-300">
                <i className="fas fa-camera mr-2"></i>
                Update Cover
              </button>
            )}
          </div>

          {/* Profile Info - Always Public */}
          <div className="px-4 pb-4">
            <div className="flex justify-between">
              <div className="flex items-end -mt-16 space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <img 
                      src={user.profilePic} 
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                </div>
                <div className="pb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-gray-600">{user.department} • {user.session}</p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-end pb-4 space-x-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="h-10 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 flex items-center space-x-2"
                    >
                      <i className="fas fa-edit text-sm"></i>
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleProfilePrivacyToggle}
                      className={`h-10 px-4 rounded-lg flex items-center space-x-2 ${
                        profilePrivacy === 'public'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={`Profile is ${profilePrivacy}`}
                    >
                      <i className={`fas fa-${profilePrivacy === 'public' ? 'globe' : 'lock'} text-sm`}></i>
                      <span className="capitalize">{profilePrivacy}</span>
                    </button>
                  </>
                ) : (
                  user.profilePrivacy === 'public' ? (
                    <button className="h-10 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300">
                      Add Friend
                    </button>
                  ) : (
                    <span className="text-gray-500 italic">Private Profile</span>
                  )
                )}
              </div>
            </div>

            {/* Profile Navigation */}
            <div className="flex space-x-8 mt-4 border-t">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-4 font-medium transition-colors ${
                  activeTab === 'posts' 
                    ? 'text-primary border-t-2 border-primary -mt-px' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-4 font-medium transition-colors ${
                  activeTab === 'about' 
                    ? 'text-primary border-t-2 border-primary -mt-px' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-4 font-medium transition-colors ${
                  activeTab === 'friends' 
                    ? 'text-primary border-t-2 border-primary -mt-px' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Friends
              </button>
              <button 
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-4 font-medium transition-colors ${
                  activeTab === 'photos' 
                    ? 'text-primary border-t-2 border-primary -mt-px' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts Section */}
            <div className="lg:col-span-3">
              {(user.profilePrivacy === 'public' || isOwnProfile) ? (
                <>
                  {/* Create Post Box */}
                  {isOwnProfile && (
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                      <div className="flex space-x-4">
                        <img 
                          src={user.profilePic} 
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                        <button 
                          className="flex-grow text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          What's on your mind, {user.fullName.split(' ')[0]}?
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow">
                      <p className="p-6 text-gray-500 text-center">No posts yet</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Private Profile</h3>
                  <p className="text-gray-500">Posts are private. Only friends can view posts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow divide-y">
            {/* Academic Information - Always Public */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-6">Academic Information</h3>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon="id-card"
                    label="Student ID"
                    value={user?.studentId}
                  />
                  <InfoCard
                    icon="building"
                    label="Department"
                    value={user?.department}
                  />
                  <InfoCard
                    icon="graduation-cap"
                    label="Session"
                    value={user?.session}
                  />
                  <InfoCard
                    icon="users"
                    label="Group"
                    value={`Group ${user?.group}`}
                  />
                  <InfoCard
                    icon="clock"
                    label="Shift"
                    value={`${user?.shift} Shift`}
                  />
                  <InfoCard
                    icon="book"
                    label="Semester"
                    value={user?.semester ? `${user.semester} Semester` : 'Not set'}
                  />
                  <InfoCard
                    icon="phone"
                    label="Phone"
                    value={user?.phone}
                    isPrivate={user?.phonePrivacy === 'private' && !isOwnProfile}
                  />
                  <InfoCard
                    icon="tint"
                    label="Blood Group"
                    value={user?.blood}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information - Privacy Controlled */}
            {(user.profilePrivacy === 'public' || isOwnProfile) && (
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-phone text-primary w-5"></i>
                      <span className="text-gray-600">Phone</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isOwnProfile || user.phonePrivacy === 'public' ? (
                        <>
                          <span className="font-medium">{user.phone}</span>
                          {isOwnProfile && (
                            <button
                              onClick={handlePrivacyToggle}
                              className={`p-1.5 rounded-full transition-colors ${
                                phonePrivacy === 'public' 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title={`Phone number is ${phonePrivacy}`}
                            >
                              <i className={`fas fa-${phonePrivacy === 'public' ? 'globe' : 'lock'} text-sm`}></i>
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Private</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-tint text-primary w-5"></i>
                      <span className="text-gray-600">Blood Group</span>
                    </div>
                    <span className="font-medium">{user.blood}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Skills</h3>
                {isOwnProfile && (
                  <button 
                    onClick={() => setShowAddSkill(true)}
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    <i className="fas fa-plus-circle text-xl"></i>
                  </button>
                )}
              </div>
              
              {user.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-full px-4 py-2 flex items-center space-x-2"
                    >
                      <span className="text-gray-700">{skill}</span>
                      {isOwnProfile && (
                        <button 
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <i className="fas fa-times text-sm"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No skills added yet</p>
              )}
            </div>

            {/* Projects Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Projects</h3>
                {isOwnProfile && (
                  <button 
                    onClick={() => setShowAddProject(true)}
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    <i className="fas fa-plus-circle text-xl"></i>
                  </button>
                )}
              </div>

              {user.projects?.length > 0 ? (
                <div className="space-y-6">
                  {user.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                        </div>
                        {isOwnProfile && (
                          <button 
                            onClick={() => handleRemoveProject(project.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        )}
                      </div>
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary-dark mt-2 inline-flex items-center space-x-1"
                        >
                          <i className="fas fa-external-link-alt text-sm"></i>
                          <span>View Project</span>
                        </a>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No projects added yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Friends list coming soon</p>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Photos coming soon</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <ProfileEdit
          user={user}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            setShowEditProfile(false);
          }}
        />
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Skill</h3>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill name"
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSkill(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Project</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter project title"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Enter project description"
                  rows="3"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Project Link (Optional)</label>
                <input
                  type="url"
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                  placeholder="https://"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Technologies Used</label>
                <input
                  type="text"
                  value={newProject.technologies.join(', ')}
                  onChange={(e) => setNewProject({
                    ...newProject, 
                    technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// InfoCard component
const InfoCard = ({ icon, label, value, isPrivate }) => {
  console.log(`InfoCard ${label}:`, value);
  
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        <i className={`fas fa-${icon} text-primary`}></i>
        <span className="text-gray-600">{label}</span>
      </div>
      <span className="font-medium">
        {isPrivate ? '••••••••••' : value || 'Not set'}
      </span>
    </div>
  );
};

export default Profile; 