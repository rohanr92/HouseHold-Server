const express = require('express')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://rohan92:IlovemymotheR92@node-test-server.wj9hxsb.mongodb.net/?appName=Node-Test-Server";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})


async function run() {
  try {
    
    await client.connect();

const serviceDB = client.db("serviceDB");
const serviceColl = serviceDB.collection("serviceColl");

const usersDB = client.db('usersDB');
const usersColl = usersDB.collection('usersColl');

const bookingDB = client.db('bookingDB');
const bookingColl = bookingDB.collection('bookingColl');

app.post('/all-services', async (req, res) => {
    const getUser = req.body;
        console.log('user info', getUser);
        const result = await serviceColl.insertOne(getUser);
        res.send(result)
})

app.get('/all-services', async(req, res) => {
      const cursor = serviceColl.find({});
      const allValues = await cursor.toArray();
      res.send(allValues);
})

app.get('/my-services', async (req, res) => {
    const email = req.query.email; 
    let query = {};

    if (email) {
        query = { ProviderEmail: email };
    }

    const cursor = serviceColl.find(query);
    const allValues = await cursor.toArray();
    res.send(allValues);
});


app.post('/users', async (req, res) => {
  const getUsers = req.body;
  console.log('user info', getUsers);
  const result = await usersColl.insertOne(getUsers);
  res.send(result);
});

app.get('/users', async(req, res) => {
      const cursor = usersColl.find({});
      const allValues = await cursor.toArray();
      res.send(allValues);
})

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const filter = { _id: new ObjectId(userId) };
  const result = await usersColl.findOne(filter);
  if (!result) return res.status(404).send({ message: 'User not found' });
  res.send(result);
});


app.patch('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  const filter = { _id: new ObjectId(userId) };
  const result = await usersColl.updateOne(filter, { $set: updatedData });
  if (result.matchedCount === 0) return res.status(404).send({ message: 'User not found' });
  res.send(result);
});





app.get('/all-services/:id', async (req, res) => {
  const pageId = req.params.id;
  let filter;
  if (ObjectId.isValid(pageId)) {
    filter = { _id: new ObjectId(pageId) };
  } else if (!isNaN(pageId)) {
    filter = { _id: parseInt(pageId) };
  } else {
    return res.status(400).send({ message: "Invalid service ID" });
  }
  const result = await serviceColl.findOne(filter);
  if (!result) {
    return res.status(404).send({ message: "Service not found" });
  }
  res.send(result);
});





app.patch('/all-services/:id', async (req, res) => {
  const idParam = req.params.id;
  const updatedData = req.body;

  let filter;

  if (ObjectId.isValid(idParam)) {
    filter = { _id: new ObjectId(idParam) };
  } else if (!isNaN(idParam)) {
    filter = { _id: parseInt(idParam) };
  } else {
    return res.status(400).send({ message: "Invalid service ID" });
  }

  const updateDoc = { $set: updatedData };
  const result = await serviceColl.updateOne(filter, updateDoc);

  if (result.matchedCount === 0) {
    return res.status(404).send({ message: "Service not found" });
  }

  res.send(result);
});



app.delete('/all-services/:id', async (req, res) => {
  const idParam = req.params.id;

  let filter;


  if (ObjectId.isValid(idParam)) {
    filter = { _id: new ObjectId(idParam) };
  } 

  else if (!isNaN(idParam)) {
    filter = { _id: parseInt(idParam) };
  } 
  else {
    return res.status(400).send({ message: "Invalid service ID" });
  }

  try {
    const result = await serviceColl.deleteOne(filter);

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Service not found" });
    }

    res.send({ message: "Service deleted successfully", result });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});






app.post('/bookings', async (req, res) => {
  const getUsers = req.body;
  console.log('user info', getUsers);
  const result = await bookingColl.insertOne(getUsers);
  res.send(result);
});

app.get('/bookings', async(req, res) => {
      const cursor = bookingColl.find({});
      const allValues = await cursor.toArray();
      res.send(allValues);
})

app.get('/bookings/:id', async (req, res) => {
  const serviceId = req.params.id;
  let filter;
  if (ObjectId.isValid(serviceId)) {
    filter = { _id: new ObjectId(serviceId) };
  } else if (!isNaN(serviceId)) {
    filter = { _id: parseInt(serviceId) };
  } else {
    return res.status(400).send({ message: "Invalid service ID" });
  }
  const result = await bookingColl.findOne(filter);
  if (!result) {
    return res.status(404).send({ message: "Service not found" });
  }
  res.send(result);
});



app.get('/user-bookings', async (req, res) => {
  const email = req.query.email;
  let query = {};

  if (email) {
    query = { userEmail: email };
  }

  const cursor = bookingColl.find(query);
  const allValues = await cursor.toArray();
  res.send(allValues);
});




app.delete('/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;

  let filter;

  if (ObjectId.isValid(bookingId)) {
    filter = { _id: new ObjectId(bookingId) };
  } else if (!isNaN(bookingId)) {
    filter = { _id: parseInt(bookingId) };
  } else {
    return res.status(400).send({ message: "Invalid booking ID" });
  }

  const result = await bookingColl.deleteOne(filter);

  if (result.deletedCount === 0) {
    return res.status(404).send({ message: "Booking not found" });
  }

  res.send({ message: "Booking deleted successfully", result });
});




    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  
  finally {
    
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})