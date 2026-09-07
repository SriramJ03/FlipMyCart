require('dotenv').config();

const app = require('./app');
const { testMySQLConnection } = require('./config/mysql');
const { connectMongo } = require('./config/mongodb');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testMySQLConnection();
  } catch (err) {
    console.error('[startup] MySQL connection failed:', err.message);
    console.error('[startup] Check backend/.env DB_* values and that MySQL is running. See README.md.');
    process.exit(1);
  }

  try {
    await connectMongo();
  } catch (err) {
    console.error('[startup] MongoDB connection failed:', err.message);
    console.error('[startup] Check backend/.env MONGO_URI and that MongoDB is running. See README.md.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[startup] FlipMyCart API listening on http://localhost:${PORT}`);
  });
}

start();
