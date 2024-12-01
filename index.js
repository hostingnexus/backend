const express = require("express");
const app = express();
const db = require("./database");

app.get("/status", (req, res) => {
    return res.status(200).json({
        status: "ok"
    })
});

app.post("/signup", async (req, res) => {
    return require ("./endpoints/signup").signup(req, res);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000")
});