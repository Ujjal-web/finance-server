const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("FinEase Server is running");
});


app.listen(port, () => {
    console.log(`FinEase Server is running on port ${port}`);
});
