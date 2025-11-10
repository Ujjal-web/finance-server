const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("./serviceKey.json");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iyiq1ye.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const verifyToken = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized: Token not found!" });
    }
    const token = authorization.split(" ")[1];
    try {
        await admin.auth().verifyIdToken(token);
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).send({ message: "Unauthorized: Invalid token." });
    }
};


async function run() {
    try {
        await client.connect();
        const db = client.db("finEaseDB");
        const transactionsCollection = db.collection("transactions");

        app.post("/transactions", async (req, res) => {
            const data = req.body;
            if (!data.userEmail) {
                return res
                    .status(400)
                    .send({ success: false, message: "Missing userEmail field!" });
            }

            const result = await transactionsCollection.insertOne(data);
            res.send({
                success: true,
                insertedId: result.insertedId,
            });
        });

        app.get("/transactions", async (req, res) => {
            const { email } = req.query;
            let query = {};
            if (email) query = { userEmail: email };

            const transactions = await transactionsCollection
                .find(query)
                .sort({ createdAt: -1 })
                .toArray();

            res.send({
                success: true,
                count: transactions.length,
                transactions,
            });
        });

        app.get("/transactions/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const transaction = await transactionsCollection.findOne({ _id: new ObjectId(id) });

                if (!transaction) {
                    return res.status(404).send({ success: false, message: "Transaction not found" });
                }

                // Calculate total of same category for same user and type
                const totalCategoryAmount = await transactionsCollection
                    .aggregate([
                        {
                            $match: {
                                userEmail: transaction.userEmail,
                                category: transaction.category,
                                type: transaction.type,
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $toDouble: "$amount" } },
                            },
                        },
                    ])
                    .toArray();

                const totalAmount = totalCategoryAmount[0]?.total || 0;

                res.send({
                    success: true,
                    transaction,
                    totalAmount,
                });
            } catch (error) {
                res.status(500).send({ success: false, message: "Error fetching transaction" });
            }
        });

        app.get("/summary", async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ success: false, message: "Email is required" });
            }

            try {
                const transactions = await transactionsCollection.find({ userEmail: email }).toArray();

                const income = transactions
                    .filter((t) => t.type === "Income")
                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

                const expense = transactions
                    .filter((t) => t.type === "Expense")
                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

                const balance = income - expense;

                res.send({
                    success: true,
                    summary: {
                        income,
                        expense,
                        balance,
                        count: transactions.length,
                    },
                });
            } catch (error) {
                console.error("Error fetching summary:", error);
                res.status(500).send({ success: false, message: "Server error" });
            }
        });


        app.delete("/transactions/:id", async (req, res) => {
            const { id } = req.params;
            const result = await transactionsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        app.put("/transactions/:id", async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $set: updatedData };
            const result = await transactionsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB Connected Successfully!");
    } finally {

    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("FinEase Server is running with MongoDB");
});

app.get("/secure", verifyToken, (req, res) => {
    res.send("Access granted! Token verified successfully.");
});


app.listen(port, () => {
    console.log(`FinEase Server running on http://localhost:${port}`);
});
