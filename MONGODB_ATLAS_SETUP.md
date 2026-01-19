# MongoDB Atlas Setup Guide

This application is configured to use **MongoDB Atlas (Cloud)** by default. You don't need to install MongoDB locally.

## 🚀 Quick Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Sign in to your account

### 2. Create a Free Cluster
1. Click "Build a Database"
2. Choose "FREE" (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Click "Create"

### 3. Create Database User
1. In the Security → Database Access section
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and generate a secure password (save it!)
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Click "Add User"

### 4. Whitelist Your IP Address
1. Go to Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address for production
4. Click "Confirm"

### 5. Get Connection String
1. Go to Database → Connect
2. Click "Connect your application"
3. Choose "Node.js" as driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Configure Application
1. In the `server` folder, copy `.env.example` to `.env`:
   ```bash
   cd server
   copy .env.example .env  # Windows
   # or
   cp .env.example .env    # Mac/Linux
   ```

2. Open `server/.env` and update the connection string:
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/FDP?retryWrites=true&w=majority
   ```
   
   **Important:** 
   - Replace `<username>` and `<password>` with your database user credentials
   - Replace `cluster0.xxxxx` with your actual cluster name
   - Add `/FDP` before the `?` to specify the database name
   - The final format should be: `mongodb+srv://username:password@cluster.mongodb.net/FDP?retryWrites=true&w=majority`

### 7. Start the Server
```bash
cd server
npm start
```

You should see:
```
✓ Connected to MongoDB successfully
  Database: FDP
  Connection: mongodb+srv://***@cluster.mongodb.net/FDP
  Type: ☁️  Cloud (MongoDB Atlas)
  ✓ Using cloud database - no local MongoDB required
```

## ✅ Verification

1. Check server console for successful connection message
2. The database "FDP" will be created automatically
3. Collections will be created as you use the application

## 🔒 Security Notes

- **Never commit `.env` file to version control**
- The `.env` file is already in `.gitignore`
- Use strong passwords for database users
- For production, whitelist only specific IP addresses
- Consider using MongoDB Atlas connection string with SRV record

## 📊 Database Name

The application uses database name: **FDP**

Collections will be automatically created:
- `users`
- `fdpattendeds`
- `fdporganizeds`
- `seminars`
- `fdpreimbursements`
- `achievements`
- `internships`
- And other collections as needed

## 🆘 Troubleshooting

### Connection Timeout
- Check your internet connection
- Verify IP address is whitelisted in Atlas
- Try "Allow Access from Anywhere" temporarily

### Authentication Failed
- Verify username and password are correct
- Check if password has special characters (may need URL encoding)
- Ensure database user has proper permissions

### Cannot Connect
- Verify connection string format is correct
- Check cluster status in Atlas dashboard
- Ensure cluster is not paused (free tier may pause after inactivity)

## 📝 Example .env File

```env
# MongoDB Atlas Connection (Cloud)
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/FDP?retryWrites=true&w=majority

# Server Port
PORT=3001

# Environment
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🎯 Benefits of Cloud Database

- ✅ No local MongoDB installation required
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Free tier available (512MB storage)
- ✅ Easy to scale
- ✅ Multiple team members can access
- ✅ Secure and reliable

Your application is now ready to use with MongoDB Atlas! 🚀
