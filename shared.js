const { PteroApp, PteroClient } = require('@devnote-dev/pterojs');
require("dotenv").config();
const app = new PteroApp(process.env.PANEL_URL, process.env.PANEL_APP_KEY);
const client = new PteroClient(process.env.PANEL_URL, process.env.PANEL_CLIENT_KEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("./database");
const { gameToNestAndEgg, generateVariables, possibleNestAndEggs } = require("./pteroutils");
const sessions = [];

function getPteroApp() {
    return app;
}

function generateSession(length = 64) {
    let session = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < length; i++) {
        session += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return session;
}

function getSession(key) {
    return sessions.find(s => s.key === key);
}

function createSession(email, username, userId) {
    const key = generateSession();
    sessions.push({
        key: key,
        email: email,
        username: username,
        userId: userId
    });
    return key;
}

async function findPlanData(planId) {
    const d = await db.query("SELECT * FROM plans WHERE id = ?", [planId]);
    return d[0][0];
}

async function eggInfo(egg) {
    const e = await app.nests.eggs.fetch(egg.nest, egg.egg);
    return {docker: e.dockerImage, startup: e.startup};
}


async function getServers(owner_id) {
    const servers = await db.query("SELECT * FROM servers WHERE owner_id = ?", [owner_id]);
    const data = servers[0];

    const responding = [];
    for(const server of data) {
        console.warn(server);
        try {
            s = await client.servers.fetchResources(server.ptero_string_id); 
        } catch (error) {
            s = { currentState: "unknown" };
        }
        const v = await app.servers.fetch(server.id);
        responding.push({
            id: server.id,
            string_id: server.ptero_string_id,
            game: server.game,
            cpu: (v.limits.cpu === 0 ? "unmetered" : `${v.limits.cpu}%`),
            memory: (v.limits.memory / 1024).toFixed(2),
            egg: server.egg,
            possible: possibleNestAndEggs(server.game),
            state: s.currentState,
        })
        console.log(s);
    }

    return responding;
}

async function changeEgg(server_id, string_id, nest, egg) {
    const eggi = await eggInfo({nest: nest, egg: egg});
    await app.servers.updateStartup(server_id, {
        egg: egg,
        image: eggi.docker,
        startup: eggi.startup,
        environment: generateVariables({nest: nest, egg: egg}),
    });
    await reinstall(string_id);
}

async function reinstall(server_string_id) {
    await client.servers.reinstall(server_string_id);
}

async function createServer(email, plan) {
    const user = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
    if(user[0].length === 0) {
        return false;
    }

    const u = user[0][0];

    const numericalEgg = gameToNestAndEgg(plan.game);
    const egg = await eggInfo(numericalEgg);

    const allocations = await app.allocations.fetchAvailable(2);
    let allocation = null;

    for (const [key, value] of allocations) {
        if (value.ip !== "127.0.0.1") {
            allocation = value;
            break;
        }
    }

    console.log(numericalEgg, egg);

    const server = await app.servers.create({
        name: `#NX Server ${generateSession(5)}`,
        user: u.ptero_account_id,
        egg: numericalEgg.egg,
        dockerImage: egg.docker,
        startup: egg.startup,
        environment: generateVariables(numericalEgg),
        limits: {
            cpu: plan.cores * 100,
            memory: plan.ram * 1024,
            disk: plan.storage * 1024,
        },
        allocation: {
            default: allocation.id,
        }

    });

    await db.query("INSERT INTO servers (created_at, id, ptero_string_id, owner_id, game, egg, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [new Date().toISOString().split("T")[0], server.id, server.identifier, u.id, plan.game, numericalEgg.egg, plan.id]);
}

module.exports = { getPteroApp, getSession, createSession, stripe, findPlanData, createServer, getServers, reinstall, changeEgg };