const { response } = require('express');
const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
require('dotenv').config();

app.get('/', async (req, res) => {
    const response = await fetch("http://discordapp.com/api/users/@me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${req.query.token}`
        }
    })
    json = await response.json()
    console.info(json)
    if(req.query.token == undefined) {
        res.status(200).sendFile(path.join(__dirname, 'index.html'));
    } else {
        fs.readFile(__dirname + '/logged-in.html', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var $ = cheerio.load(data)
            $('p.title').text(`Welcome to the TSR Website, ${json.username}!`)
            $('img.avatar').prop("src", `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}`)
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.send($.html());
        })
    }
});

app.get('/css/index.css', function(req, res) {
    res.sendFile(__dirname + "/css/index.css");
});

app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NoCodeProvided':
        return res.status(400).send({
            status: 'ERROR',
            error: err.message,
        });
        default:
        return res.status(500).send({
            status: 'ERROR',
            error: err.message,
        });
    }
});

app.listen(8080, () => {
    console.info('Running on port 8080');
});

//Routes
app.use('/api/discord', require('./api/discord'));