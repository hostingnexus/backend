const db = require("../database");
const {getPteroApp} = require("../shared");
const bcrypt = require("bcrypt");

async function signup(req, res) {
    const {email, username, password} = req.body;

    if(!email || !username || !password) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (missing data)"
        });
    }

    if(password.length < 8 || username.length < 3 || username.length > 30) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (password, username)"
        });
    }

    if(email.length > 100 || !email.includes("@") || !email.includes(".")) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (email)"
        });
    }


    // Do stuff

    try {
        const [result] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
        if(result.length > 0) {
            return res.status(409).json({
                success: false,
                error: "User already exists"
            });
        } else {
            // Continue with registration
            getPteroApp().users.create({
                email: email,
                username: username + Math.floor(Math.random() * 1000),
                firstname: "Change this",
                lastname: "Change this",
                password: password
            }).then(async (u) => {
                const hashed = await bcrypt.hash(password, 10);
                await db.query("INSERT INTO accounts (created_at, email, username, password, ptero_account_id) VALUES (?, ?, ?, ?, ?)", [new Date().toISOString().split("T")[0], email, username, hashed, u.id]);
                
                return res.status(201).json({
                    success: true
                });
            }).catch((err) => {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    error: "Something went wrong"
                });
            });
        }
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: "Something went wrong"
        });
    }
}

module.exports = {signup};