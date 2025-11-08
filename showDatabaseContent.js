// showDatabaseContent.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/onhand', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {

  const collections = await mongoose.connection.db.listCollections().toArray();
  
  for (let coll of collections) {
    console.log(`\n=== ${coll.name} ===`);
    const data = await mongoose.connection.db.collection(coll.name).find({}).toArray();
    console.log(data);
  }

  mongoose.connection.close();
}).catch(err => console.error(err));
