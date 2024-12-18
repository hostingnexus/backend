const {getSession} = require("../shared");

async function verify(req, res) {
    const {
        token
    } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload (missing data)"
        });
    }

    const session = getSession(token);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: "Invalid session"
        });
    } else {
        return res.status(200).json({success: true});
    }
}

module.exports = { verify };