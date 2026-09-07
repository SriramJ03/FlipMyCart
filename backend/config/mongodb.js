const mongoose = require('mongoose');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[mongodb] connected:', mongoose.connection.name);
  return mongoose.connection;
}

module.exports = { connectMongo, mongoose };
