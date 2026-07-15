const mongoose = require('mongoose');

async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(process.env.MONGO_URI);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  return mongoose.connection;
}

module.exports = connectDB;
