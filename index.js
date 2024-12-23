const express = require("express");
const app = express();
const db = require("./database");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/status", (req, res) => {
    return res.status(200).json({
        status: "ok"
    })
});

app.post("/signup", async (req, res) => {
    return require ("./endpoints/signup").signup(req, res);
});

app.post("/login", async (req, res) => {
    return require ("./endpoints/login").login(req, res);
});

app.get("/games", async (req, res) => {
    return res.json([{name: "Minecraft", image: "images/minecraft.jpg"}]);
});

app.get("/plans", (req, res) => {
    return require("./endpoints/plans").plans(req, res);
});

app.get("/servers", async (req, res) => {
    return require("./endpoints/servers").servers(req, res);
});

app.post("/verify", async (req, res) => {
    return require("./endpoints/verify").verify(req, res);
});

app.post("/purchase", async (req, res) => {
    return require("./endpoints/purchase").purchase(req, res);
});

app.post("/reinstall", async (req, res) => {
    return require("./endpoints/reinstall").reinstalll(req, res);
});

app.post("/changeegg", async (req, res) => {
    return require("./endpoints/changeegg").changeegg(req, res);
});


app.get("/success", async (req, res) => {
    return require("./endpoints/purchase").success(req, res);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000")
});