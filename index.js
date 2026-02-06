 const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force Google + Cloudflare DNS
require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q7eeory.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //book api

    const bookCollection=client.db("bookStoreDB").collection("books");
    const authorCollection=client.db("bookStoreDB").collection("authors");
    const cartCollection=client.db("bookStoreDB").collection("cart");

        // authors related APIs

        app.get('/authors',async(req,res)=>{
          const authors=await authorCollection.find().toArray();
          res.send(authors);
        })

        // author detail

app.get("/authors/:id", async (req, res) => {
  const id = req.params.id; // string
  const result = await authorCollection.findOne({ _id: id });      // match string
 

  // console.log("Found author:", result);
  res.send(result);
});

        

        // books related APIs

app.get("/allBooks", async (req, res) => {
  const { category } = req.query;

  console.log("Category:", category); // debug

  let query = {};

  if (category) {
    query = { category: category.toLowerCase() };
  }

  const result = await bookCollection.find(query).toArray();
  res.send(result);
});

//book detail

app.get("/allBooks/:id",async(req,res)=>{
  const id=req.params.id;
  const result = await bookCollection.findOne({_id: new ObjectId(id) });
  res.send(result)
})

// cart data

app.post("/cart",async(req,res)=>{
const cartItem=req.body;
 console.log("Received:", cartItem);
const result=await cartCollection.insertOne(cartItem);
res.send(result);
})

app.get("/cart",async(req,res)=>{
  const email=req.query.email;

  const query={email:email};

  const result=await cartCollection.find(query).toArray();
  res.send(result)
})

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})