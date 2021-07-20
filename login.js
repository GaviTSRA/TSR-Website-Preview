const express = require("express");
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('./utils');
const querystring = require("querystring");
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = process.env.REDIRECT_URI;

router.use(cookieParser());

router.get('/discord', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
});

router.get('/discord/callback', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    payload = querystring.stringify({
        grant_type: 'authorization_code', 
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: redirect
    })
    const response = await fetch("https://discordapp.com/api/oauth2/token", {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
    });
    const json = await response.json();
    console.info("Discord login done")
    res.cookie('token', json.access_token, {maxAge: 60000 * 60 * 24 * 7}).redirect("/");
}));

router.get('/guest', (req, res) => {
    console.info("Guest login done")
    res.cookie('token', 'guest').redirect("/");
});

module.exports = router;