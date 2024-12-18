const db = require("../database");

async function plans(req, res) {
    if(!req.query.id) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (missing data)"
        });
    }

    const [result] = await db.query("SELECT * FROM plans WHERE game = ?", [req.query.id]);
    return res.json(result);
}

module.exports = { plans };