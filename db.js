const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://rahul:Yg6i3prvrBgSF4ay@cluster0.io54nr3.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);



module.exports = client;
  
 