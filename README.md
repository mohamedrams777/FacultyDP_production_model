# Faculty FDP Management System

A comprehensive web application for managing Faculty Development Programs (FDP), seminars, achievements, reimbursements, internships, and more.

## 🚀 Features

- **User Management**: Registration with role-based access (Admin, Faculty, HOD)
- **FDP Management**: Track attended and organized FDPs with certificate uploads
- **Reimbursements**: Submit and manage FDP expense reimbursements
- **Achievements**: Record and verify faculty achievements
- **Internships**: Track student internships supervised by faculty
- **Seminars & Events**: Manage seminars and upcoming events
- **Teaching Records**: ABL, Joint Teaching, Adjunct Faculty
- **Audit & Reports**: Comprehensive reporting with PDF/Excel export
- **Notifications**: Real-time notification system

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (Cloud database - **Required**)
- npm or yarn package manager

## 🗄️ Database Setup (MongoDB Atlas - Cloud)

**This application uses MongoDB Atlas (cloud database) - no local MongoDB installation required!**

### Quick Setup:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a free cluster (M0 tier)

2. **Get Connection String**
   - In Atlas, go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string

3. **Configure Environment**
   ```bash
   cd server
   # Create .env file
   # Add your MongoDB Atlas connection string:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FDP
   ```

4. **Whitelist IP Address**
   - In Atlas → Network Access
   - Add your IP address (or "Allow Access from Anywhere" for development)

📖 **Detailed setup instructions**: See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FacultyFDP
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Configure Environment Variables
Create `server/.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/FDP
PORT=3001
NODE_ENV=development

# Optional: Email configuration for registration notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Install Client Dependencies
```bash
cd ../client
npm install
```

## 🚀 Running the Application

### Start Server
```bash
cd server
npm start
```
Server will run on http://localhost:3001

### Start Client (in a new terminal)
```bash
cd client
npm run dev
```
Client will run on http://localhost:5173 (or port shown in terminal)

## 👤 Default Access

### Registration Flow:
1. New users can register from the login page
2. Select role: Faculty, Admin, or HOD
3. Fill in department and designation
4. After registration, login to access dashboard

### Admin Password Requirements:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one symbol

## 📁 Project Structure

```
FacultyFDP/
├── server/              # Backend (Node.js/Express)
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Upload middleware
│   └── uploads/        # Uploaded files
│
└── client/             # Frontend (React/TypeScript)
    ├── src/
    │   ├── pages/      # Page components
    │   ├── components/ # Reusable components
    │   ├── lib/        # API client
    │   └── types/      # TypeScript types
```

## 🔐 Roles & Permissions

- **Faculty**: Manage own records, submit requests
- **Admin**: Full access, approve/reject requests, generate reports
- **HOD**: Department-level access, view reports for their department

## 📊 Available Modules

- FDP Attended/Organized
- Seminars
- Activity-Based Learning (ABL)
- Joint Teaching
- Adjunct Faculty
- **FDP Reimbursements** ⭐
- **Achievements** ⭐
- **Internship Activities** ⭐
- **Audit & Reports** ⭐

## 📄 Report Generation

The Audit & Reports section allows:
- Comprehensive data aggregation
- Date range filtering
- Department filtering
- PDF export with formatted tables
- Excel export with multiple sheets
- Statistics dashboard

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Atlas (Cloud)
- Multer (File uploads)
- Nodemailer (Email notifications)
- bcryptjs (Password hashing)

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- jsPDF (PDF generation)
- XLSX (Excel generation)

## 📝 Notes

- All file uploads are limited to 10MB
- Supported file types: PDF, JPG, JPEG, PNG
- Certificates and documents are viewable by all authorized users
- Database automatically creates collections as needed

## 🆘 Troubleshooting

### Server won't start
- Check MongoDB Atlas connection string in `.env` file
- Verify IP is whitelisted in Atlas
- Ensure cluster is running (not paused)

### Database connection fails
- Verify connection string format
- Check username/password are correct
- Ensure database name `/FDP` is included
- See [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) for detailed help

## 📚 Documentation

- [MongoDB Atlas Setup Guide](./MONGODB_ATLAS_SETUP.md) - Detailed cloud database setup
- [API Testing Guide](./server/API_TESTING_GUIDE.md) - API endpoint documentation
- [Troubleshooting Guide](./server/TROUBLESHOOTING.md) - Common issues and solutions

## ✅ All Features Implemented

- ✅ User registration with role selection
- ✅ Strong password validation for admin
- ✅ Department and designation fields
- ✅ Email notification support
- ✅ Password visibility toggle
- ✅ Confirm password validation
- ✅ Certificate uploads (PDF, JPG, PNG - 10MB max)
- ✅ FDP Reimbursement module
- ✅ Achievements section
- ✅ Internship activities
- ✅ Unified audit/reporting with PDF/Excel
- ✅ Cloud MongoDB support (Atlas)

---

**Built with ❤️ for Faculty Development Program Management**
