const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
  connectiondb: (cb) => {
    MongoClient.connect('mongodb://localhost:27017/webapp')
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getdb: () => dbConnection,
};
