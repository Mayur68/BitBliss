const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
  connection: (cb) => {
    MongoClient.connect('mongodb://127.0.0.1:27017/webapp')
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
