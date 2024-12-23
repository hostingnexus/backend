const { getSession, getServers, changeEgg } = require("../shared");

async function changeegg(req, res) {
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

    const { server_id, string_id, egg, nest} = req.body;
    if(!server_id) {
        return res.status(400).json({
            error: "Invalid payload"
        });
    }

    const servers = await getServers(session.userId);
    console.log(servers);
    if(servers.find(s => s.id === server_id)) {
        await changeEgg(server_id, string_id, nest, egg);
        return res.json({
            success: true
        });
    } else {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }
}

module.exports = { changeegg };