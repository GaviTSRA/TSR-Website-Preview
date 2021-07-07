const express = require("express");
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../utils');
const querystring = require("querystring");

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = 'http://localhost:8080/api/discord/callback'

router.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
  });

router.get('/callback', catchAsync(async (req, res) => {
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
    res.redirect(`/?token=${json.access_token}`);
  }));

module.exports = router;