const { response, query } = require('express');
const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cookieParser = require('cookie-parser');
const { utils } = require('./utils');

const app = express();
require('dotenv').config();
app.use(cookieParser());

app.get('/', async (req, res) => {
    util = new utils(req, false);
    await util.init();
    if(!util.is_logged_in) {
        res.status(200).sendFile(path.join(__dirname, 'html/index.html'));
    } else {
        if(req.query.logout == "true") {
            res.clearCookie("token").redirect("/");
        } else {
            if(util.has_joined) highest_role = util.highest_role;
            else highest_role = ""; 

            fs.readFile(__dirname + '/html/logged-in.html', 'utf8', function (err,data) {
                if (err) return console.log(err);
                var $ = cheerio.load(data)

                switch(req.query.err) {
                    case "notUser":
                        err = "You already have a higher role than 'User', so you can't apply!"
                        break;
                    case "notJoined":
                        err = "You need to join the TSR Network Discord to apply as staff!"
                        break;
                    default:
                        err = "";
                }

                $('p.title').text(`Welcome to the TSR Website, ${highest_role} ${util.user_data.username}!`);
                $('img.avatar').prop("src", `https://cdn.discordapp.com/avatars/${util.user_data.id}/${util.user_data.avatar}`);
                if(joined) $('#discordinv').prop("style", "display:none");
                if(highest_role != "User" || !util.has_joined) $('#staffapp').prop("style", "display:none");
                if(err != "") $("#err").text(err);
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
    util = new utils(req, false);
    await util.init();
    if(!util.is_logged_in) res.redirect('/');
    else if (!util.has_joined) res.redirect("/?err=joinDiscord")
    else {
        if(util.highest_role != "User") res.redirect("/?err=notUser")
        else {
            fs.readFile(__dirname + '/html/staffapplication.html', 'utf8', function (err,data) {
                if (err) return console.log(err);
                var $ = cheerio.load(data)
                $('#dcname').prop("value", `${util.user_data.username}#${util.user_data.discriminator}`)
                res.set('Content-Type', 'text/html; charset=utf-8');
                res.send($.html());
            })
        }
    }
});

app.get('/css/staffapplication.css', function(req, res) {
    res.sendFile(__dirname + "/css/staffapplication.css");
});

app.get('/plugindoc', async function(req, res) {
    util = new utils(req, false);
    await util.init();
    if(!util.is_logged_in) res.redirect("/");
    else res.sendFile(__dirname + "/html/plugindoc.html");
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