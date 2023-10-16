const { MongoClient } = require("mongodb");

let dbConnection;

module.exports = {
  connection: (cb) => {
    MongoClient.connect("mongodb+srv://mayur68:" + encodeURIComponent("IF8QYZLtEzm7kR6") + "@cluster0.bpkmyqk.mongodb.net/?retryWrites=true&w=majority")
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
