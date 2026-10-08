require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: 'admin@nestease.com',
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await User.create({
      name: 'NestEase Admin',
      email: 'admin@nestease.com',
      password: hashedPassword,
      phone: '12345678',
      role: 'admin',
    });

    console.log('Admin created successfully');
    console.log(admin);

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
