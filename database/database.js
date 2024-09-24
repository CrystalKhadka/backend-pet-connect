const mongoose = require('mongoose');

const connectDatabase = () => {
  mongoose.connect(process.env.MONGODB_LOCAL).then(() => {
    console.log('Database connected');
  });
};

const connectDatabaseTest = () => {
  mongoose.connect(process.env.MONGODB_LOCAL_TEST).then(() => {
    console.log('Database connected');
  });
};

module.exports = { connectDatabase, connectDatabaseTest };
