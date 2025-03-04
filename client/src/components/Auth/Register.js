import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    department: 'CST',
    session: '',
    group: 'A',
    shift: '1st',
    semester: '',
    phone: '',
    blood: '',
    password: '',
    confirmPassword: '',
    profilePic: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const departments = [
    { value: 'CST', label: 'Computer Science & Technology' },
    { value: 'FOOD', label: 'Food Technology' },
    { value: 'RAC', label: 'Refrigeration & Air Conditioning' },
    { value: 'AIDT', label: 'Architecture & Interior Design Technology' },
    { value: 'MNT', label: 'Mechatronics Technology' }
  ];

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
  ];

  const fileInputRef = React.useRef(null);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return '';
    if (password.length < 8) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to Blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.7); // Compress with 70% quality
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        try {
          const compressedBlob = await compressImage(file);
          if (compressedBlob.size > 5242880) {
            setError('Image is too large. Please choose a smaller image.');
            return;
          }
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData({ ...formData, profilePic: reader.result });
          };
          reader.readAsDataURL(compressedBlob);
        } catch (err) {
          setError('Error processing image. Please try again.');
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, profilePic: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileContainerClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleSessionInput = (e) => {
    let value = e.target.value;
    const prevValue = formData.session;
    
    // Remove any non-digit and non-hyphen characters
    value = value.replace(/[^\d-]/g, '');
    
    // Handle backspace/delete
    if (value.length < prevValue.length) {
      setFormData({ ...formData, session: value });
      return;
    }

    // Format: YY-YY
    if (value.length <= 2) {
      // First two digits
      setFormData({ ...formData, session: value });
    } else if (value.length === 2 && !value.includes('-')) {
      // Add hyphen after first two digits
      setFormData({ ...formData, session: value + '-' });
    } else if (value.length >= 3 && !value.includes('-')) {
      // Add hyphen between numbers
      setFormData({ ...formData, session: value.slice(0, 2) + '-' + value.slice(2, 4) });
    } else if (value.length <= 5) {
      // Allow total 5 characters (YY-YY)
      setFormData({ ...formData, session: value });
    }
  };

  const handleStudentIdInput = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^\d]/g, '').slice(0, 6);
    setFormData({ ...formData, studentId: numericValue });
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 11 digits
    const numericValue = value.replace(/[^\d]/g, '').slice(0, 11);
    
    // Phone number must start with 01
    if (numericValue.length >= 2 && !numericValue.startsWith('01')) {
      setError('Phone number must start with 01');
      return;
    }

    setFormData({ ...formData, phone: numericValue });
    setError(''); // Clear error if valid input
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    if (!formData.studentId || !formData.fullName || !formData.department) {
      setError('Please fill in all fields in this step');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.session || !formData.group || !formData.shift || !formData.blood) {
      setError('Please fill in all fields in this step');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.phone || !formData.profilePic) {
      setError('Please fill in all fields in this step');
      return false;
    }

    // Phone number must be 11 digits
    if (formData.phone.length !== 11) {
      setError('Phone number must be 11 digits');
      return false;
    }

    // Phone number must start with 01
    if (!formData.phone.startsWith('01')) {
      setError('Phone number must start with 01');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Student ID */}
      <div className="space-y-2">
        <label className="block text-gray-700 font-medium">Student ID</label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleStudentIdInput}
          placeholder="Enter 6-digit student ID"
          maxLength="6"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label className="block text-gray-700 font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>

      {/* Department */}
      <div className="space-y-2">
        <label className="block text-gray-700 font-medium">Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session */}
        <div className="form-group">
          <label className="block text-gray-700 font-medium mb-2">Session</label>
          <input
            type="text"
            placeholder="YY-YY"
            value={formData.session}
            onChange={handleSessionInput}
            maxLength="5"
            required
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
          />
          <small className="text-gray-500 text-sm mt-1">Example: 21-22</small>
        </div>

        {/* Semester */}
        <div className="form-group">
          <label className="block text-gray-700 font-medium mb-2">Current Semester</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors appearance-none bg-white"
          >
            <option value="">Select Semester</option>
            <option value="1st">1st Semester</option>
            <option value="2nd">2nd Semester</option>
            <option value="3rd">3rd Semester</option>
            <option value="4th">4th Semester</option>
            <option value="5th">5th Semester</option>
            <option value="6th">6th Semester</option>
            <option value="7th">7th Semester</option>
            <option value="8th">8th Semester</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Group */}
        <div className="form-group">
          <label className="block text-gray-700 font-medium mb-2">Group</label>
          <select
            name="group"
            value={formData.group}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors appearance-none bg-white"
          >
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
        </div>

        {/* Shift */}
        <div className="form-group">
          <label className="block text-gray-700 font-medium mb-2">Shift</label>
          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors appearance-none bg-white"
          >
            <option value="1st">1st Shift</option>
            <option value="2nd">2nd Shift</option>
          </select>
        </div>
      </div>

      {/* Blood Group */}
      <div className="form-group mt-4">
        <label className="block text-gray-700 font-medium mb-2">Blood Group</label>
        <select
          name="blood"
          value={formData.blood}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors appearance-none bg-white"
        >
          <option value="">Select Blood Group</option>
          {bloodGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="space-y-2 group">
        <label className="block text-gray-700 font-semibold transition-colors duration-300 group-focus-within:text-primary">
          Phone Number
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="01XXXXXXXXX"
            value={formData.phone}
            onChange={handlePhoneInput}
            maxLength="11"
            required
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-300"
          />
          <i className="fas fa-phone absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300"></i>
        </div>
        <small className="text-gray-500 text-sm ml-2">Example: 01712345678</small>
      </div>

      <div className="form-group">
        <label>Profile Picture</label>
        <div 
          className={`file-input-container ${formData.profilePic ? 'has-file' : ''}`}
          onClick={handleFileContainerClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {formData.profilePic ? (
            <div className="preview-container">
              <img 
                src={formData.profilePic} 
                alt="Profile preview" 
                className="image-preview"
              />
              <span className="file-name">Image selected</span>
            </div>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt"></i>
              <span>Choose a file or drag it here</span>
              <span className="file-size-info">Maximum file size: 5MB</span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <div className="form-group">
        <label>Password</label>
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password (min. 6 characters)"
            value={formData.password}
            onChange={handlePasswordChange}
            minLength="6"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
          </button>
        </div>
        {passwordStrength && (
          <div className={`password-strength strength-${passwordStrength}`}></div>
        )}
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <div className="password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            minLength="6"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
          </button>
        </div>
      </div>
    </>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Form validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const registrationData = {
        studentId: formData.studentId,
        fullName: formData.fullName,
        department: formData.department,
        session: formData.session,
        group: formData.group,
        shift: formData.shift,
        semester: formData.semester,
        phone: formData.phone,
        blood: formData.blood,
        password: formData.password,
        profilePic: formData.profilePic
      };

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        registrationData
      );

      if (res.data.success) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login.' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
              Create your account
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-10 relative">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold relative z-10
                ${step >= num 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-400'
                } mx-2 transition-all duration-300`}
            >
              {num}
              {step >= num && num < 4 && (
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-primary to-secondary right-[-100%] top-1/2 transform -translate-y-1/2 z-0"></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl mb-6 border-l-4 border-red-500 shadow-lg animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form steps */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-[0_10px_20px_rgba(8,_112,_184,_0.5)] disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Next
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-[0_10px_20px_rgba(8,_112,_184,_0.5)] disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 pt-6 text-center border-t border-gray-200">
          <Link 
            to="/login" 
            className="text-primary hover:text-secondary font-semibold transition-colors inline-flex items-center group"
          >
            Already have an account? Sign in
            <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 