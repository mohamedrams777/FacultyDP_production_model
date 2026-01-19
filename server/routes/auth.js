const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    res.json({ message: 'Login successful', user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password validation for admin
const validateAdminPassword = (password) => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;
  
  return hasLower && hasUpper && hasNumber && hasSymbol && hasMinLength;
};

// Email sending function
const sendNotificationEmail = async (toEmail, userName, userEmail, userRole) => {
  try {
    // If SMTP is not configured, log the email content instead
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 SMTP not configured. Email notification would be sent to:', toEmail);
      console.log('   Registration Details:', {
        name: userName,
        email: userEmail,
        role: userRole,
      });
      console.log('   To enable email sending, configure SMTP settings in .env file');
      return;
    }

    // Create transporter (using Gmail as example - configure based on your email provider)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Welcome to Faculty FDP Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Faculty FDP Platform</h2>
          <p>Dear ${userName},</p>
          <p>Your account has been successfully registered on the Faculty FDP Platform.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Registration Details:</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> ${userRole.toUpperCase()}</p>
          </div>
          <p>You can now login to the platform using your registered email and password.</p>
          <p>Best regards,<br>Faculty FDP Platform Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✓ Notification email sent to:', toEmail);
  } catch (error) {
    console.error('✗ Error sending email:', error.message);
    // Don't fail registration if email fails
  }
};

// Register (for admin use)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, recoveryEmail, sendEmail } = req.body;

    console.log('Register request received:', { name, email, role, department, designation, phone, recoveryEmail });

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // Validate admin password strength
    if (role === 'admin' && !validateAdminPassword(password)) {
      return res.status(400).json({ 
        error: 'Admin password must contain: lowercase letter, uppercase letter, number, symbol, and be at least 8 characters long' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      department,
      designation,
      phone,
      recoveryEmail,
    });

    console.log('Saving user to database...');
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    // Send notification email if requested
    if (sendEmail && recoveryEmail) {
      await sendNotificationEmail(recoveryEmail, name, email, role);
    }

    const userData = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      department: savedUser.department,
      phone: savedUser.phone,
      recoveryEmail: savedUser.recoveryEmail,
    };

    res.status(201).json({ message: 'User registered successfully', user: userData });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
