const express = require('express')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json());
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// console.log(process.env);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@node-test-server.wj9hxsb.mongodb.net/?appName=Node-Test-Server`;

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

    const reviewDB = client.db('reviewDB');
    const reviewColl = reviewDB.collection('reviewColl');

    app.post('/all-services', async (req, res) => {
      const getUser = req.body;
      const result = await serviceColl.insertOne(getUser);
      res.send(result)
    })


    app.get('/all-services', async(req, res) => {
      const cursor = serviceColl.find({});
      const allValues = await cursor.toArray();
      res.send(allValues);
    })

 
    app.get('/all-services/filter', async (req, res) => {
      try {
        const { minPrice, maxPrice, category, search } = req.query;
        let query = {};

      
        if (minPrice || maxPrice) {
          query.Price = {};
          if (minPrice) query.Price.$gte = parseFloat(minPrice);
          if (maxPrice) query.Price.$lte = parseFloat(maxPrice);
        }

    
        if (category && category !== 'All') {
          query.Category = category;
        }

   
        if (search) {
          const regex = new RegExp(search, 'i'); 
          query.$or = [
            { ServiceName: regex },
            { ProviderName: regex },
            { Category: regex }
          ];
        }

        const cursor = serviceColl.find(query);
        const services = await cursor.toArray();
        res.send(services);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error", error });
      }
    })

 
    app.get('/my-services', async (req, res) => {
      const email = req.query.email; 
      let query = {};
      if (email) query = { ProviderEmail: email };
      const cursor = serviceColl.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });


    app.get('/all-services/:id', async (req, res) => {
      const pageId = req.params.id;
      let filter;
      if (ObjectId.isValid(pageId)) filter = { _id: new ObjectId(pageId) };
      else if (!isNaN(pageId)) filter = { _id: parseInt(pageId) };
      else return res.status(400).send({ message: "Invalid service ID" });

      const result = await serviceColl.findOne(filter);
      if (!result) return res.status(404).send({ message: "Service not found" });
      res.send(result);
    });

 
    app.patch('/all-services/:id', async (req, res) => {
      const idParam = req.params.id;
      const updatedData = req.body;

      let filter;
      if (ObjectId.isValid(idParam)) filter = { _id: new ObjectId(idParam) };
      else if (!isNaN(idParam)) filter = { _id: parseInt(idParam) };
      else return res.status(400).send({ message: "Invalid service ID" });

      const updateDoc = { $set: updatedData };
      const result = await serviceColl.updateOne(filter, updateDoc);
      if (result.matchedCount === 0) return res.status(404).send({ message: "Service not found" });
      res.send(result);
    });

  
    app.delete('/all-services/:id', async (req, res) => {
      const idParam = req.params.id;
      let filter;
      if (ObjectId.isValid(idParam)) filter = { _id: new ObjectId(idParam) };
      else if (!isNaN(idParam)) filter = { _id: parseInt(idParam) };
      else return res.status(400).send({ message: "Invalid service ID" });

      const result = await serviceColl.deleteOne(filter);
      if (result.deletedCount === 0) return res.status(404).send({ message: "Service not found" });
      res.send({ message: "Service deleted successfully", result });
    });


    app.post('/users', async (req, res) => {
      const getUsers = req.body;
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

 
    app.post('/bookings', async (req, res) => {
      const getUsers = req.body;
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
      if (ObjectId.isValid(serviceId)) filter = { _id: new ObjectId(serviceId) };
      else if (!isNaN(serviceId)) filter = { _id: parseInt(serviceId) };
      else return res.status(400).send({ message: "Invalid service ID" });

      const result = await bookingColl.findOne(filter);
      if (!result) return res.status(404).send({ message: "Service not found" });
      res.send(result);
    });

    app.get('/user-bookings', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) query = { userEmail: email };
      const cursor = bookingColl.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.delete('/bookings/:id', async (req, res) => {
      const bookingId = req.params.id;
      let filter;
      if (ObjectId.isValid(bookingId)) filter = { _id: new ObjectId(bookingId) };
      else if (!isNaN(bookingId)) filter = { _id: parseInt(bookingId) };
      else return res.status(400).send({ message: "Invalid booking ID" });

      const result = await bookingColl.deleteOne(filter);
      if (result.deletedCount === 0) return res.status(404).send({ message: "Booking not found" });
      res.send({ message: "Booking deleted successfully", result });
    });


    app.post('/reviews', async (req, res) => {
      try {
        const reviewData = req.body;
        const { serviceId, rating } = reviewData;
        if (!serviceId || rating === undefined) return res.status(400).send({ message: "serviceId and rating are required" });

        const result = await reviewColl.insertOne(reviewData);

        let filter;
        if (ObjectId.isValid(serviceId)) filter = { _id: new ObjectId(serviceId) };
        else if (!isNaN(serviceId)) filter = { _id: parseInt(serviceId) };
        else return res.status(400).send({ message: "Invalid service ID" });

        const service = await serviceColl.findOne(filter);
        if (!service) return res.status(404).send({ message: "Service not found" });

        const newReviewCount = (service.ReviewCount || 0) + 1;
        const newAvgRating = ((service.Rating || 0) * (service.ReviewCount || 0) + parseFloat(rating)) / newReviewCount;

        const updateResult = await serviceColl.updateOne(
          filter,
          { $set: { Rating: parseFloat(newAvgRating.toFixed(1)) }, $inc: { ReviewCount: 1 } }
        );

        res.send({
          message: "Review added successfully",
          reviewInsert: result,
          serviceUpdate: updateResult
        });

      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error", error });
      }
    });

    app.get('/reviews/:serviceId', async (req, res) => {
      try {
        const serviceId = req.params.serviceId;
        const cursor = reviewColl.find({ serviceId: serviceId });
        const allValues = await cursor.toArray();
        res.send(allValues);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error", error });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally { }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});

module.exports = app;