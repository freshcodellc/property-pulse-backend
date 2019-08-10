const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

const mongoOpts = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true
}

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  return mongoose.connect(process.env.DB, mongoOpts).then(db => {
    isConnected = db.connections[0].readyState;
  });
};
