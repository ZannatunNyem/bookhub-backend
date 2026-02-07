const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


// MongoDB Setup (GLOBAL CACHED)//....


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q7eeory.mongodb.net/bookStoreDB?appName=Cluster0`;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  global._mongoClientPromise = client.connect().then(() => {
    console.log("MongoDB connected");
    return client;
  });
}

clientPromise = global._mongoClientPromise;

async function getDB() {
  const client = await clientPromise;
  return client.db("bookStoreDB");
}


// Routes--------------------


app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Authors
app.get('/authors', async (req, res) => {
  try {
    const db = await getDB();
    const authors = await db.collection("authors").find().toArray();
    res.send(authors);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch authors" });
  }
});

app.get('/authors/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const db = await getDB();
    const result = await db.collection("authors")
      .findOne({ _id: new ObjectId(id) });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch author" });
  }
});

// Books
app.get('/allBooks', async (req, res) => {
  try {
    const { category } = req.query;
    const db = await getDB();

    let query = {};
    if (category) {
      query = { category: category.toLowerCase() };
    }

    const result = await db.collection("books")
      .find(query)
      .toArray();

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch books" });
  }
});

app.get('/allBooks/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const db = await getDB();
    const result = await db.collection("books")
      .findOne({ _id: new ObjectId(id) });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch book" });
  }
});

// Cart
app.post('/cart', async (req, res) => {
  try {
    const cartItem = req.body;
    const db = await getDB();

    const result = await db.collection("cart")
      .insertOne(cartItem);

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to add cart item" });
  }
});

app.get('/cart', async (req, res) => {
  try {
    const email = req.query.email;
    const db = await getDB();

    const result = await db.collection("cart")
      .find({ email })
      .toArray();

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch cart" });
  }
});


// Start server--------------------

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
