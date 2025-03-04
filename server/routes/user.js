const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Get user profile
router.get('/profile/:id', auth, async (req, res) => {
  try {
    console.log('Fetching profile for ID:', req.params.id);
    console.log('Authenticated user:', req.userId);

    const student = await Student.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if user can view this profile
    const canViewProfile = 
      student._id.toString() === req.userId || // Own profile
      student.profilePrivacy === 'public' || // Public profile
      req.userRole === 'admin'; // Admin user

    if (!canViewProfile) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    // Format response
    const profileData = {
      id: student._id.toString(),
      studentId: student.studentId,
      fullName: student.fullName,
      department: student.department,
      session: student.session,
      group: student.group,
      shift: student.shift,
      semester: student.semester,
      phone: student.phonePrivacy === 'public' || student._id.toString() === req.userId ? student.phone : null,
      blood: student.blood,
      profilePic: student.profilePic,
      isOnline: student.isOnline,
      lastSeen: student.lastSeen,
      skills: student.skills,
      projects: student.projects,
      phonePrivacy: student.phonePrivacy,
      profilePrivacy: student.profilePrivacy
    };

    res.json({
      success: true,
      user: profileData
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Get profile picture
router.get('/profile-pic/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('profilePic');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      profilePic: student.profilePic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading profile picture',
      error: error.message
    });
  }
});

// Update profile
router.put('/profile/:id', auth, async (req, res) => {
  try {
    const { fullName, phone, blood, profilePic } = req.body;

    // Validate required fields
    if (!fullName || !phone || !blood) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate phone number format
    if (!/^01\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Find student
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if phone number is already used by another student
    if (phone !== student.phone) {
      const existingPhone = await Student.findOne({ 
        _id: { $ne: req.params.id },
        phone 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    // Update student data
    student.fullName = fullName;
    student.phone = phone;
    student.blood = blood;
    if (profilePic) {
      student.profilePic = profilePic;
    }

    await student.save();

    // Send response
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        department: student.department,
        session: student.session,
        group: student.group,
        shift: student.shift,
        phone: student.phone,
        blood: student.blood,
        profilePic: student.profilePic
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Update phone privacy
router.patch('/phone-privacy/:id', auth, async (req, res) => {
  try {
    const { privacy } = req.body;
    
    // Validate privacy option
    if (!['public', 'private'].includes(privacy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid privacy option'
      });
    }

    // Check if user is updating their own privacy
    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.phonePrivacy = privacy;
    await student.save();

    res.json({
      success: true,
      message: 'Privacy updated successfully',
      privacy: student.phonePrivacy
    });

  } catch (error) {
    console.error('Privacy update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating privacy',
      error: error.message
    });
  }
});

// Update profile privacy
router.patch('/profile-privacy/:id', auth, async (req, res) => {
  try {
    const { privacy } = req.body;
    const userId = req.params.id;
    
    console.log('Privacy Update Request:', {
      requestedId: userId,
      authUserId: req.userId,
      authUserIdString: req.userIdString,
      requestedPrivacy: privacy
    });

    // Validate privacy option
    if (!['public', 'private'].includes(privacy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid privacy option'
      });
    }

    // Check authorization using string comparison
    if (userId !== req.userIdString) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Find and update the student
    const student = await Student.findById(userId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update privacy
    student.profilePrivacy = privacy;
    await student.save();

    console.log('Updated student:', {
      id: student._id,
      privacy: student.profilePrivacy
    });

    res.json({
      success: true,
      message: `Profile is now ${privacy}`,
      privacy: student.profilePrivacy
    });

  } catch (error) {
    console.error('Profile privacy update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile privacy',
      error: error.message
    });
  }
});

// Add skill
router.post('/skills/:id', auth, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const paramId = req.params.id.toString();
    const authUserId = req.userId.toString();
    
    console.log('Comparing IDs:', { paramId, authUserId });

    const { skill } = req.body;

    // Validate input
    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill data'
      });
    }

    // Check authorization
    if (paramId !== authUserId) {
      console.log('Authorization mismatch:', { paramId, authUserId });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const student = await Student.findById(paramId);
    console.log('Found student:', student ? 'yes' : 'no');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Initialize skills array if it doesn't exist
    if (!student.skills) {
      student.skills = [];
    }

    // Add skill if it doesn't exist
    if (!student.skills.includes(skill)) {
      student.skills.push(skill);
      await student.save();
      console.log('Skill added successfully'); // Debug log
    } else {
      console.log('Skill already exists'); // Debug log
    }

    res.json({
      success: true,
      message: 'Skill added successfully',
      skills: student.skills
    });

  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
});

// Remove skill
router.delete('/skills/:id/:skill', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove skill
    student.skills = student.skills.filter(s => s !== req.params.skill);
    await student.save();

    res.json({
      success: true,
      message: 'Skill removed successfully',
      skills: student.skills
    });

  } catch (error) {
    console.error('Error removing skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing skill',
      error: error.message
    });
  }
});

// Add project
router.post('/projects/:id', auth, async (req, res) => {
  try {
    const { title, description, link, technologies } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Check authorization
    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add new project
    const project = {
      title,
      description,
      link: link || '',
      technologies: technologies || []
    };

    student.projects.push(project);
    await student.save();

    res.json({
      success: true,
      message: 'Project added successfully',
      projectId: student.projects[student.projects.length - 1]._id,
      projects: student.projects
    });

  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding project',
      error: error.message
    });
  }
});

// Remove project
router.delete('/projects/:id/:projectId', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove project
    student.projects = student.projects.filter(p => p._id.toString() !== req.params.projectId);
    await student.save();

    res.json({
      success: true,
      message: 'Project removed successfully',
      projects: student.projects
    });

  } catch (error) {
    console.error('Error removing project:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing project',
      error: error.message
    });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ 
        success: true,
        users: [] 
      });
    }

    // Create search regex (case insensitive)
    const searchRegex = new RegExp(q, 'i');

    // Execute search
    const users = await Student.find({
      $or: [
        { fullName: searchRegex },
        { studentId: searchRegex },
        { department: searchRegex },
        { semester: searchRegex },
        { session: searchRegex }
      ]
    })
    .select('studentId fullName department semester session group shift profilePic')
    .limit(20)
    .lean();

    // Format results
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      studentId: user.studentId,
      fullName: user.fullName,
      department: user.department,
      semester: user.semester,
      session: user.session,
      group: user.group,
      shift: user.shift,
      profilePic: user.profilePic
    }));

    // Return results
    res.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      query: q
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
});

module.exports = router; 