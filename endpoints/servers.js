const db = require("../database");
const {getSession, getServers } = require("../shared");

async function servers(req, res) {
    const auth = req.headers.authorization;
    if(!auth) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const session = getSession(auth);
    if(!session) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    console.log(session);
    const servers = await getServers(session.userId);
    return res.json(servers);
}

module.exports = { servers };

