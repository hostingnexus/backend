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
            error: "Either username or password is too short, or username is too long"
        });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if(username.includes(" ") || !usernameRegex.test(username)) {
        return res.status(400).json({
            success: false,
            error: "Username cannot contain spaces or special characters"
        });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email) || email.length > 254) {
        return res.status(400).json({
            success: false,
            error: "Incorrect email format"
        });
    }


    // Do stuff

    try {
        const [result] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
        if(result.length > 0) {
            return res.status(409).json({
                success: false,
                error: "An account with this email already exists"
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