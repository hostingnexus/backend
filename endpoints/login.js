const db = require("../database");
const {app, createSession} = require("../shared");
const bcrypt = require("bcrypt");

async function login(req, res) {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (missing data)"
        });
    }

    const [result] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
    if (result.length === 0) {
        return res.status(404).json({
            success: false,
            error: "Invalid credentials"
        });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({
            success: false,
            error: "Invalid credentials"
        });
    }

    const key = createSession(email, user.username, user.id);
    await db.query("UPDATE accounts SET last_logon = ? WHERE id = ?", [new Date(), user.id]);
    return res.status(200).json({
        success: true,
        session: key
    });
}

module.exports = { login };