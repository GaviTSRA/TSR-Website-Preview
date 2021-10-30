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
    res.cookie("goto", req.query.goto).redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
});

router.get('/discord/callback', catchAsync(async (req, res) => {
    var goto = req.cookies.goto
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
    if (goto != "" && goto != undefined && goto != "undefined") {
        res.cookie('token', json.access_token, {maxAge: 60000 * 60 * 24 * 7}).clearCookie("goto", "").redirect("/" + goto);
    } else res.cookie('token', json.access_token, {maxAge: 60000 * 60 * 24 * 7}).redirect("/");
}));

router.get('/guest', (req, res) => {
    console.info("Guest login done")
    if (req.query.goto != "" && req.query.goto != undefined) {
        res.cookie('token', 'guest').redirect("/" + req.query.goto)
    } else res.cookie('token', 'guest').redirect("/");
});

module.exports = router;