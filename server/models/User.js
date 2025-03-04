const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 6,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid student ID! Must be 6 digits.`
    }
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  session: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2}-\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid session! Format should be YY-YY`
    }
  },
  group: {
    type: String,
    required: true,
    enum: ['A', 'B']
  },
  shift: {
    type: String,
    required: true,
    enum: ['1st', '2nd']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^01\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  profilePic: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 