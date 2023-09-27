const { getdb } = require("../database/database");
db = getdb();

const repositorySchema = new db.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: String, required: true },
});

const Repository = db.model('Repository', repositorySchema);

module.exports = Repository;
