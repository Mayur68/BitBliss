

const uri = "mongodb+srv://<username>:<password>@<cluster-url>/test?retryWrites=true&w=majority";
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
  if (err) throw err;
  const db = client.db("test");
  console.log("Connected to MongoDB Atlas");
  client.close();
});