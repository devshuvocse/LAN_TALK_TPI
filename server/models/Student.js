const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CST', 'FOOD', 'RAC', 'AIDT', 'MNT']
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  group: {
    type: String,
    required: [true, 'Group is required'],
    enum: ['A', 'B']
  },
  shift: {
    type: String,
    required: [true, 'Shift is required'],
    enum: ['1st', '2nd']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  blood: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  profilePic: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  phonePrivacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  profilePrivacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    link: String,
    technologies: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Student', studentSchema); 