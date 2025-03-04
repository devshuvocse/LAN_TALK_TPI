const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Student = require('../models/Student');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      department,
      session,
      group,
      shift,
      semester,
      phone,
      blood,
      password,
      profilePic
    } = req.body;

    // Validate required fields
    const requiredFields = ['studentId', 'fullName', 'department', 'session', 'group', 'shift', 'semester', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate student ID format
    if (!/^\d{6}$/.test(studentId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid student ID format' 
      });
    }

    // Validate phone number format
    if (!/^01\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid phone number format' 
      });
    }

    // Check if student exists
    const existingStudent = await Student.findOne({ 
      $or: [{ studentId }, { phone }] 
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or phone number already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create student with default values
    const student = new Student({
      studentId,
      fullName,
      department,
      session,
      group,
      shift,
      semester,
      phone,
      blood: blood || '',
      password: hashedPassword,
      profilePic: profilePic || '',
      phonePrivacy: 'private',
      profilePrivacy: 'public',
      skills: [],
      projects: [],
      isOnline: false,
      lastSeen: new Date()
    });

    await student.save();

    // Generate token
    const token = jwt.sign(
      { userId: student._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: student._id.toString(),
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        session: student.session,
        group: student.group,
        shift: student.shift,
        semester: student.semester,
        phone: student.phone,
        blood: student.blood,
        profilePic: student.profilePic,
        phonePrivacy: student.phonePrivacy,
        profilePrivacy: student.profilePrivacy
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Find student by ID
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid student ID or password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: student._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update online status
    student.isOnline = true;
    await student.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student._id.toString(),
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        session: student.session,
        group: student.group,
        shift: student.shift,
        semester: student.semester,
        phone: student.phone,
        blood: student.blood,
        profilePic: student.profilePic,
        phonePrivacy: student.phonePrivacy,
        profilePrivacy: student.profilePrivacy
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: error.message 
    });
  }
});

module.exports = router; 