const { PteroApp } = require('@devnote-dev/pterojs');
require("dotenv").config();
const app = new PteroApp(process.env.PANEL_URL, process.env.PANEL_APP_KEY);
const sessions = [];

function generateSession() {
    let session = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < 64; i++) {
        session += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return session;
}

function getSession(key) {
    return sessions.find(s => s.key === key);
}

function createSession(email, username) {
    const key = generateSession();
    sessions.push({
        key: key,
        email: email,
        username: username
    });
    return key;
}

module.exports = { app, getSession, createSession };