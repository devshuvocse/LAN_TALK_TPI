const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { 
      studentId, 
      fullName, 
      session, 
      group, 
      shift, 
      phone, 
      bloodGroup,
      password, // পাসওয়ার্ড রেজিস্ট্রেশন টাইমে নিব
      profilePic 
    } = req.body;

    // চেক করি ইউজার আগে থেকে আছে কিনা
    const userExists = await Student.findOne({ 
      $or: [
        { studentId }, 
        { phone }
      ] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this Student ID or Phone number' 
      });
    }

    // পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 12);

    // নতুন ইউজার তৈরি
    const user = new Student({
      studentId,
      fullName,
      session,
      group,
      shift,
      phone,
      bloodGroup,
      password: hashedPassword,
      profilePic
    });

    await user.save();

    // টোকেন তৈরি
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        session: user.session,
        group: user.group,
        shift: user.shift,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
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
      { userId: student._id },
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
};

// পাসওয়ার্ড চেঞ্জ কন্ট্রোলার
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // বর্তমান পাসওয়ার্ড চেক
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // পাসওয়ার্ড আপডেট
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// পাসওয়ার্ড রিসেট কন্ট্রোলার
exports.resetPassword = async (req, res) => {
  try {
    const { studentId, phone, newPassword } = req.body;

    const user = await Student.findOne({ studentId, phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}; 