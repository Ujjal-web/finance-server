const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const admin = require("firebase-admin");

require("dotenv").config()

const serviceAccount = require("./serviceKey.json");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iyiq1ye.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyToken = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized: Token not found!" });
    }

    const token = authorization.split(" ")[1];
    try {
        await admin.auth().verifyIdToken(token);
        next(); // Allow access to protected route
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).send({ message: "Unauthorized: Invalid token." });
    }
};

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("FinEase Server is running with mongodb");
});


app.listen(port, () => {
    console.log(`FinEase Server is running on port ${port}`);
});
