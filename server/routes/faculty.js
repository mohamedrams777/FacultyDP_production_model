const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FDPAttended = require('../models/FDPAttended');
const FDPOrganized = require('../models/FDPOrganized');
const Seminar = require('../models/Seminar');
const ABL = require('../models/ABL');
const JointTeaching = require('../models/JointTeaching');
const AdjunctFaculty = require('../models/AdjunctFaculty');
const Notification = require('../models/Notification');
const FDPReimbursement = require('../models/FDPReimbursement');
const Achievement = require('../models/Achievement');
const Internship = require('../models/Internship');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'certificate-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'image/jpeg' ||
                   file.mimetype === 'image/jpg' ||
                   file.mimetype === 'image/png';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed (max 10MB)!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// Middleware to get faculty ID from headers
const getFacultyId = (req, res, next) => {
  req.facultyId = req.headers['user-id'] || req.body.facultyId;
  if (!req.facultyId) {
    return res.status(401).json({ error: 'Unauthorized - Faculty ID required' });
  }
  next();
};

// ========== FDP Attended Routes ==========
router.get('/fdp/attended', getFacultyId, async (req, res) => {
  try {
    const records = await FDPAttended.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/fdp/attended', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      recordData.certificate = `/uploads/certificates/${req.file.filename}`;
    }
    
    const record = new FDPAttended(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/fdp/attended/:id', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      updateData.certificate = `/uploads/certificates/${req.file.filename}`;
      // Delete old certificate if exists
      const oldRecord = await FDPAttended.findById(req.params.id);
      if (oldRecord && oldRecord.certificate) {
        const oldPath = path.join(__dirname, '..', oldRecord.certificate);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await FDPAttended.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    if (!record) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/fdp/attended/:id', getFacultyId, async (req, res) => {
  try {
    const record = await FDPAttended.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== FDP Organized Routes ==========
router.get('/fdp/organized', getFacultyId, async (req, res) => {
  try {
    const records = await FDPOrganized.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/fdp/organized', getFacultyId, async (req, res) => {
  try {
    const record = new FDPOrganized({
      ...req.body,
      facultyId: req.facultyId,
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/fdp/organized/:id', getFacultyId, async (req, res) => {
  try {
    const record = await FDPOrganized.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/fdp/organized/:id', getFacultyId, async (req, res) => {
  try {
    const record = await FDPOrganized.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Seminar Routes ==========
router.get('/seminars', getFacultyId, async (req, res) => {
  try {
    const records = await Seminar.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seminars', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      recordData.certificate = `/uploads/certificates/${req.file.filename}`;
    }
    
    const record = new Seminar(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/seminars/:id', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      updateData.certificate = `/uploads/certificates/${req.file.filename}`;
      // Delete old certificate if exists
      const oldRecord = await Seminar.findById(req.params.id);
      if (oldRecord && oldRecord.certificate) {
        const oldPath = path.join(__dirname, '..', oldRecord.certificate);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await Seminar.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    if (!record) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/seminars/:id', getFacultyId, async (req, res) => {
  try {
    const record = await Seminar.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ABL Routes ==========
router.get('/abl', getFacultyId, async (req, res) => {
  try {
    const records = await ABL.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/abl', getFacultyId, async (req, res) => {
  try {
    const record = new ABL({
      ...req.body,
      facultyId: req.facultyId,
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/abl/:id', getFacultyId, async (req, res) => {
  try {
    const record = await ABL.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/abl/:id', getFacultyId, async (req, res) => {
  try {
    const record = await ABL.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Joint Teaching Routes ==========
router.get('/joint-teaching', getFacultyId, async (req, res) => {
  try {
    const records = await JointTeaching.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/joint-teaching', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      recordData.certificate = `/uploads/certificates/${req.file.filename}`;
    }
    
    const record = new JointTeaching(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/joint-teaching/:id', getFacultyId, upload.single('certificate'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // If certificate file is uploaded, save the path
    if (req.file) {
      updateData.certificate = `/uploads/certificates/${req.file.filename}`;
      // Delete old certificate if exists
      const oldRecord = await JointTeaching.findById(req.params.id);
      if (oldRecord && oldRecord.certificate) {
        const oldPath = path.join(__dirname, '..', oldRecord.certificate);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await JointTeaching.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    if (!record) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/joint-teaching/:id', getFacultyId, async (req, res) => {
  try {
    const record = await JointTeaching.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Adjunct Faculty Routes ==========
router.get('/adjunct', getFacultyId, async (req, res) => {
  try {
    const records = await AdjunctFaculty.find({ facultyId: req.facultyId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/adjunct', getFacultyId, async (req, res) => {
  try {
    const record = new AdjunctFaculty({
      ...req.body,
      facultyId: req.facultyId,
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/adjunct/:id', getFacultyId, async (req, res) => {
  try {
    const record = await AdjunctFaculty.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/adjunct/:id', getFacultyId, async (req, res) => {
  try {
    const record = await AdjunctFaculty.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Notifications Routes ==========
router.get('/notifications', getFacultyId, async (req, res) => {
  try {
    const records = await Notification.find({ recipientId: req.facultyId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/:id/read', getFacultyId, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.facultyId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/read-all', getFacultyId, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.facultyId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Dashboard Stats ==========
router.get('/dashboard', getFacultyId, async (req, res) => {
  try {
    const [fdpAttended, fdpOrganized, seminars, abl, jointTeaching, adjunct] = await Promise.all([
      FDPAttended.countDocuments({ facultyId: req.facultyId }),
      FDPOrganized.countDocuments({ facultyId: req.facultyId }),
      Seminar.countDocuments({ facultyId: req.facultyId }),
      ABL.countDocuments({ facultyId: req.facultyId }),
      JointTeaching.countDocuments({ facultyId: req.facultyId }),
      AdjunctFaculty.countDocuments({ facultyId: req.facultyId }),
    ]);

    const recentFDPs = await FDPAttended.find({ facultyId: req.facultyId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      stats: {
        fdpAttended,
        fdpOrganized,
        seminars,
        abl,
        jointTeaching,
        adjunct,
      },
      recentFDPs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== FDP Reimbursement Routes ==========
router.get('/reimbursements', getFacultyId, async (req, res) => {
  try {
    const records = await FDPReimbursement.find({ facultyId: req.facultyId })
      .populate('fdpId', 'title')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reimbursements', getFacultyId, upload.single('receiptDocument'), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
      amount: parseFloat(req.body.amount),
    };
    
    if (req.file) {
      recordData.receiptDocument = `/uploads/certificates/${req.file.filename}`;
    }
    
    const record = new FDPReimbursement(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/reimbursements/:id', getFacultyId, upload.single('receiptDocument'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    if (req.body.amount) {
      updateData.amount = parseFloat(req.body.amount);
    }
    
    if (req.file) {
      updateData.receiptDocument = `/uploads/certificates/${req.file.filename}`;
      const oldRecord = await FDPReimbursement.findById(req.params.id);
      if (oldRecord && oldRecord.receiptDocument) {
        const oldPath = path.join(__dirname, '..', oldRecord.receiptDocument);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await FDPReimbursement.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    
    if (!record) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reimbursements/:id', getFacultyId, async (req, res) => {
  try {
    const record = await FDPReimbursement.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Delete receipt document if exists
    if (record.receiptDocument) {
      const filePath = path.join(__dirname, '..', record.receiptDocument);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Achievement Routes ==========
router.get('/achievements', getFacultyId, async (req, res) => {
  try {
    const records = await Achievement.find({ facultyId: req.facultyId })
      .sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/achievements', getFacultyId, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
    };
    
    if (req.files?.certificate) {
      recordData.certificate = `/uploads/certificates/${req.files.certificate[0].filename}`;
    }
    
    if (req.files?.supportingDocument) {
      recordData.supportingDocument = `/uploads/certificates/${req.files.supportingDocument[0].filename}`;
    }
    
    const record = new Achievement(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/achievements/:id', getFacultyId, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'supportingDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    const oldRecord = await Achievement.findById(req.params.id);
    
    if (req.files?.certificate) {
      updateData.certificate = `/uploads/certificates/${req.files.certificate[0].filename}`;
      if (oldRecord && oldRecord.certificate) {
        const oldPath = path.join(__dirname, '..', oldRecord.certificate);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    if (req.files?.supportingDocument) {
      updateData.supportingDocument = `/uploads/certificates/${req.files.supportingDocument[0].filename}`;
      if (oldRecord && oldRecord.supportingDocument) {
        const oldPath = path.join(__dirname, '..', oldRecord.supportingDocument);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await Achievement.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    
    if (!record) {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/achievements/:id', getFacultyId, async (req, res) => {
  try {
    const record = await Achievement.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Delete documents if exist
    if (record.certificate) {
      const filePath = path.join(__dirname, '..', record.certificate);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    if (record.supportingDocument) {
      const filePath = path.join(__dirname, '..', record.supportingDocument);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Internship Routes ==========
router.get('/internships', getFacultyId, async (req, res) => {
  try {
    const records = await Internship.find({ facultyId: req.facultyId })
      .sort({ startDate: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/internships', getFacultyId, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'report', maxCount: 1 }
]), async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      facultyId: req.facultyId,
    };
    
    if (req.body.startDate) recordData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) recordData.endDate = new Date(req.body.endDate);
    if (req.body.duration) recordData.duration = parseInt(req.body.duration);
    if (req.body.stipend) recordData.stipend = parseFloat(req.body.stipend);
    if (req.body.skillsGained) {
      recordData.skillsGained = typeof req.body.skillsGained === 'string' 
        ? req.body.skillsGained.split(',').map(s => s.trim())
        : req.body.skillsGained;
    }
    
    if (req.files?.certificate) {
      recordData.certificate = `/uploads/certificates/${req.files.certificate[0].filename}`;
    }
    
    if (req.files?.report) {
      recordData.report = `/uploads/certificates/${req.files.report[0].filename}`;
    }
    
    const record = new Internship(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/internships/:id', getFacultyId, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'report', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
    if (req.body.duration) updateData.duration = parseInt(req.body.duration);
    if (req.body.stipend) updateData.stipend = parseFloat(req.body.stipend);
    if (req.body.skillsGained) {
      updateData.skillsGained = typeof req.body.skillsGained === 'string' 
        ? req.body.skillsGained.split(',').map(s => s.trim())
        : req.body.skillsGained;
    }
    
    const oldRecord = await Internship.findById(req.params.id);
    
    if (req.files?.certificate) {
      updateData.certificate = `/uploads/certificates/${req.files.certificate[0].filename}`;
      if (oldRecord && oldRecord.certificate) {
        const oldPath = path.join(__dirname, '..', oldRecord.certificate);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    if (req.files?.report) {
      updateData.report = `/uploads/certificates/${req.files.report[0].filename}`;
      if (oldRecord && oldRecord.report) {
        const oldPath = path.join(__dirname, '..', oldRecord.report);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }
    
    const record = await Internship.findOneAndUpdate(
      { _id: req.params.id, facultyId: req.facultyId },
      updateData,
      { new: true }
    );
    
    if (!record) {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/internships/:id', getFacultyId, async (req, res) => {
  try {
    const record = await Internship.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.facultyId,
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Delete documents if exist
    if (record.certificate) {
      const filePath = path.join(__dirname, '..', record.certificate);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    if (record.report) {
      const filePath = path.join(__dirname, '..', record.report);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
