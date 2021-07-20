const { response } = require('express');
const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cookieParser = require('cookie-parser');
const { getUserData, getHighestUserRole, getUserGuilds, getToken, isLoggedIn } = require('./utils');

const app = express();
require('dotenv').config();
app.use(cookieParser());

app.get('/', async (req, res) => {
    if(!isLoggedIn(req)) {
        res.status(200).sendFile(path.join(__dirname, 'html/index.html'));
    } else {
        if(req.query.logout == "true") {
            console.info("Logging out!")
            res.clearCookie("token").redirect("/");
        } else {
            user_data = await getUserData(req);
            user_guilds = await getUserGuilds(req);

            joined = false;
            user_guilds.forEach(guild => { if(guild.id == "818951190721200158") joined = true; }); 
            if(joined) highest_role = await getHighestUserRole(req);
            else highest_role = ""; 
            fs.readFile(__dirname + '/html/logged-in.html', 'utf8', function (err,data) {
                if (err) return console.log(err);
                var $ = cheerio.load(data)
                $('p.title').text(`Welcome to the TSR Website, ${highest_role} ${user_data.username}!`)
                $('img.avatar').prop("src", `https://cdn.discordapp.com/avatars/${user_data.id}/${user_data.avatar}`)
                if(joined) $('#discordinv').prop("style", "display:none")
                if(highest_role != "User" || !joined) $('#staffapp').prop("style", "display:none")
                res.set('Content-Type', 'text/html; charset=utf-8');
                res.send($.html());
            })
        }
    }
});

app.get('/css/index.css', function(req, res) {
    res.sendFile(__dirname + "/css/index.css");
});

app.get('/staffapplication', async (req, res) => {
    if(!isLoggedIn(req)) res.redirect('/');
    user_data = await getUserData(req);
    fs.readFile(__dirname + '/html/staffapplication.html', 'utf8', function (err,data) {
        if (err) return console.log(err);
        var $ = cheerio.load(data)
        $('#dcname').prop("value", `${user_data.username}#${user_data.discriminator}`)
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send($.html());
    })
});

app.get('/css/staffapplication.css', function(req, res) {
    res.sendFile(__dirname + "/css/staffapplication.css");
});

app.get('/plugindoc', function(req, res) {
    res.sendFile(__dirname + "/html/plugindoc.html")
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

app.listen(process.env.PORT || 8080, () => {
    console.info('Running on port 8080');
});

app.use('/api/discord', require('./api/discord'));