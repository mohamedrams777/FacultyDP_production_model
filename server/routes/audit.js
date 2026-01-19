const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FDPAttended = require('../models/FDPAttended');
const FDPOrganized = require('../models/FDPOrganized');
const Seminar = require('../models/Seminar');
const ABL = require('../models/ABL');
const JointTeaching = require('../models/JointTeaching');
const AdjunctFaculty = require('../models/AdjunctFaculty');
const FDPReimbursement = require('../models/FDPReimbursement');
const Achievement = require('../models/Achievement');
const Internship = require('../models/Internship');

// Middleware to check admin/HOD role
const checkAccess = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await User.findById(userId);
    if (!user || !['admin', 'hod'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden - Admin or HOD access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get comprehensive audit data
router.get('/data', checkAccess, async (req, res) => {
  try {
    const { startDate, endDate, department, facultyId } = req.query;
    
    // Date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Department filter for user queries
    let deptFilter = {};
    if (req.user.role === 'hod' && req.user.department) {
      deptFilter.department = req.user.department;
    } else if (department && req.user.role === 'admin') {
      deptFilter.department = department;
    }
    
    // Faculty filter
    const facultyFilter = {};
    if (facultyId) {
      facultyFilter.facultyId = facultyId;
    }

    // Build queries with proper filters
    const facultyQuery = { role: 'faculty', ...deptFilter };
    const recordQuery = { ...dateFilter, ...facultyFilter };
    
    // For records, we need to filter by faculty department
    let facultyIds = [];
    if (Object.keys(deptFilter).length > 0) {
      const facultyInDept = await User.find(deptFilter).select('_id');
      facultyIds = facultyInDept.map((f) => f._id);
      if (facultyIds.length > 0) {
        recordQuery.facultyId = { $in: facultyIds };
      } else {
        // No faculty in department, return empty results
        return res.json({
          summary: {
            totalFaculty: 0,
            totalFDPAttended: 0,
            totalFDPOrganized: 0,
            totalSeminars: 0,
            totalABL: 0,
            totalJointTeaching: 0,
            totalAdjunctFaculty: 0,
            totalReimbursements: 0,
            totalReimbursementAmount: 0,
            totalAchievements: 0,
            totalInternships: 0,
          },
          data: {
            faculty: [],
            fdpAttended: [],
            fdpOrganized: [],
            seminars: [],
            abl: [],
            jointTeaching: [],
            adjunctFaculty: [],
            reimbursements: [],
            achievements: [],
            internships: [],
          },
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            department: department || req.user.department || 'all',
            facultyId: facultyId || 'all',
          },
          generatedAt: new Date(),
          generatedBy: {
            id: req.user._id,
            name: req.user.name,
            role: req.user.role,
          },
        });
      }
    }

    const [
      faculty,
      fdpAttended,
      fdpOrganized,
      seminars,
      abl,
      jointTeaching,
      adjunctFaculty,
      reimbursements,
      achievements,
      internships,
    ] = await Promise.all([
      User.find(facultyQuery).select('-password'),
      FDPAttended.find(recordQuery).populate('facultyId', 'name email department'),
      FDPOrganized.find(recordQuery).populate('facultyId', 'name email department'),
      Seminar.find(recordQuery).populate('facultyId', 'name email department'),
      ABL.find(recordQuery).populate('facultyId', 'name email department'),
      JointTeaching.find(recordQuery).populate('facultyId', 'name email department'),
      AdjunctFaculty.find(recordQuery).populate('facultyId', 'name email department'),
      FDPReimbursement.find(recordQuery).populate('facultyId', 'name email department'),
      Achievement.find(recordQuery).populate('facultyId', 'name email department'),
      Internship.find(recordQuery).populate('facultyId', 'name email department'),
    ]);

    res.json({
      summary: {
        totalFaculty: faculty.length,
        totalFDPAttended: fdpAttended.length,
        totalFDPOrganized: fdpOrganized.length,
        totalSeminars: seminars.length,
        totalABL: abl.length,
        totalJointTeaching: jointTeaching.length,
        totalAdjunctFaculty: adjunctFaculty.length,
        totalReimbursements: reimbursements.length,
        totalReimbursementAmount: reimbursements.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
        totalAchievements: achievements.length,
        totalInternships: internships.length,
      },
      data: {
        faculty,
        fdpAttended,
        fdpOrganized,
        seminars,
        abl,
        jointTeaching,
        adjunctFaculty,
        reimbursements,
        achievements,
        internships,
      },
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        department: department || req.user.department || 'all',
        facultyId: facultyId || 'all',
      },
      generatedAt: new Date(),
      generatedBy: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for audit
router.get('/stats', checkAccess, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const deptFilter = req.user.role === 'hod' && req.user.department 
      ? { department: req.user.department }
      : department 
        ? { department }
        : {};

    // For HOD, filter records by faculty in their department
    let recordFilter = { ...dateFilter };
    if (Object.keys(deptFilter).length > 0) {
      const facultyInDept = await User.find({ role: 'faculty', ...deptFilter }).select('_id');
      const facultyIds = facultyInDept.map((f) => f._id);
      if (facultyIds.length > 0) {
        recordFilter.facultyId = { $in: facultyIds };
      } else {
        // No faculty in department
        return res.json({
          faculty: { total: 0 },
          fdps: { pending: 0, approved: 0, rejected: 0, total: 0 },
          reimbursements: { total: 0, pending: 0, approved: 0, totalAmount: 0 },
          achievements: { verified: 0 },
          internships: { ongoing: 0, completed: 0, total: 0 },
          period: {
            startDate: startDate || 'all time',
            endDate: endDate || 'all time',
          },
        });
      }
    }

    const [
      totalFaculty,
      pendingFDPs,
      approvedFDPs,
      rejectedFDPs,
      totalReimbursements,
      pendingReimbursements,
      approvedReimbursements,
      totalReimbursementAmount,
      verifiedAchievements,
      ongoingInternships,
      completedInternships,
    ] = await Promise.all([
      User.countDocuments({ role: 'faculty', ...deptFilter }),
      FDPAttended.countDocuments({ status: 'pending', ...recordFilter }),
      FDPAttended.countDocuments({ status: 'approved', ...recordFilter }),
      FDPAttended.countDocuments({ status: 'rejected', ...recordFilter }),
      FDPReimbursement.countDocuments({ ...recordFilter }),
      FDPReimbursement.countDocuments({ status: 'pending', ...recordFilter }),
      FDPReimbursement.countDocuments({ status: 'approved', ...recordFilter }),
      FDPReimbursement.aggregate([
        { $match: { ...recordFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Achievement.countDocuments({ status: 'verified', ...recordFilter }),
      Internship.countDocuments({ status: 'ongoing', ...recordFilter }),
      Internship.countDocuments({ status: 'completed', ...recordFilter }),
    ]);

    res.json({
      faculty: {
        total: totalFaculty,
      },
      fdps: {
        pending: pendingFDPs,
        approved: approvedFDPs,
        rejected: rejectedFDPs,
        total: pendingFDPs + approvedFDPs + rejectedFDPs,
      },
      reimbursements: {
        total: totalReimbursements,
        pending: pendingReimbursements,
        approved: approvedReimbursements,
        totalAmount: totalReimbursementAmount[0]?.total || 0,
      },
      achievements: {
        verified: verifiedAchievements,
      },
      internships: {
        ongoing: ongoingInternships,
        completed: completedInternships,
        total: ongoingInternships + completedInternships,
      },
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'all time',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
