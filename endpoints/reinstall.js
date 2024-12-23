const db = require("../database");
const {getSession, getServers, reinstall } = require("../shared");

async function reinstalll(req, res) {
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

    const { server_id } = req.body;
    if(!server_id) {
        return res.status(400).json({
            error: "Invalid payload"
        });
    }

    const servers = await getServers(session.userId);
    console.log(servers);
    if(servers.find(s => s.string_id === server_id)) {
        await reinstall(server_id);
        return res.json({
            success: true
        });
    } else {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }
}

module.exports = { reinstalll };

