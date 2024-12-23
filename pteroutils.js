function generateVariables(game) {
    if(game.nest === 1 && game.egg === 1) {
        // Paper
        return {
            "SERVER_JARFILE": "server.jar",
            "BUILD_NUMBER": "latest",
        }
    } else if(game.nest === 1 && game.egg === 3) {
        // Vanilla
        return {
            "SERVER_JARFILE": "server.jar",
            "VANILLA_VERSION": "latest",
        }
    } else if(game.nest === 1 && game.egg === 5) {
        // BungeeCord
        return {
            "SERVER_JARFILE": "server.jar",
            "BUNGEE_VERSION": "latest",
        }
    }
}

function gameToNestAndEgg(game) {
    if(game === "Minecraft") {
        return {nest: 1, egg: 1};
    }

    return {};
}

function possibleNestAndEggs(game) {
    if(game === "Minecraft") {
        return [
            {nest: 1, egg: 1, name: "Paper"},
            {nest: 1, egg: 3, name: "Vanilla"},
            {nest: 1, egg: 5, name: "BungeeCord"},
        ]
    }
}


module.exports = {generateVariables, gameToNestAndEgg, possibleNestAndEggs};