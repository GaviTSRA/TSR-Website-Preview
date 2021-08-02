const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cookieParser = require('cookie-parser');
const { utils } = require('./js/utils');

const app = express();
require('dotenv').config();
app.use(cookieParser());

app.get('/', async (req, res) => {
    util = new utils(req, false);
    await util.init();

    if(util.login_method == "none") {
        res.sendFile(path.join(__dirname, 'html/index.html'));
    } 
    else {
        if(req.query.logout == "true") {
            res.clearCookie("token").redirect("/");
        } 
        else {
            if(util.login_method == "discord") {
                if(util.has_joined) highest_role = util.highest_role;
                else highest_role = ""; 
            }

            fs.readFile(__dirname + '/html/logged-in.html', 'utf8', function (err,data) {
                if (err) return console.log(err);
                var $ = cheerio.load(data)

                switch(req.query.err) {
                    case "notUser":
                        err = "You already have a higher role than 'User', so you can't apply!";
                        break;
                    case "notJoined":
                        err = "You need to join the TSR Network Discord to apply as staff!";
                        break;
                    case "notDiscord":
                        err = "You need to use a discord account to apply!";
                        break;
                    default:
                        err = "";
                }

                if(util.login_method == "discord") {
                    $('p.title').text(`Welcome to the TSR Website, ${highest_role} ${util.user_data.username}!`);
                    $('img.avatar').prop("src", `https://cdn.discordapp.com/avatars/${util.user_data.id}/${util.user_data.avatar}`);
                    if(util.has_joined) $('#discordinv').prop("style", "display:none");
                    if(highest_role != "User" || !util.has_joined) $('#staffapp').prop("style", "display:none");
                }

                else {
                    $('p.title').text("Welcome to the TSR Website, Guest!")
                    $('#discordinv').prop("style", "display:none");
                    $('#staffapp').prop("style", "display:none");
                }

                if(err != "") $("#err").text(err);
                res.set('Content-Type', 'text/html; charset=utf-8');
                res.send($.html());
            })
        }
    }
});

app.get('/staffapplication', async (req, res) => {
    util = new utils(req, false);
    await util.init();
    if(util.login_method == "none") res.redirect('/');
    if(util.login_method == "guest") res.redirect('/?err=notDiscord')
    else if (!util.has_joined) res.redirect("/?err=joinDiscord")
    else {
        if(util.highest_role != "User") res.redirect("/?err=notUser")
        else {
            fs.readFile(__dirname + '/html/staffapplication.html', 'utf8', function (err,data) {
                if (err) return console.log(err);
                var $ = cheerio.load(data);
                $('#dcname').prop("value", `${util.user_data.username}#${util.user_data.discriminator}`);
                res.set('Content-Type', 'text/html; charset=utf-8');
                res.send($.html());
            });
        }
    }
});

app.get('/plugindoc', async function(req, res) {
    util = new utils(req, false);
    await util.init();
    if(util.login_method == "none") res.redirect("/"); 
    else {
        fs.readFile(__dirname + "/html/plugindoc.html", "utf8", function (err,data) {
            if(err) return console.log(err);
            var $ = cheerio.load(data);
            if(util.login_method == "guest") role = "User";
            else role = util.highest_role;
            switch(role) {
                case "Admin":
                    $('.owner').empty();
                    break;
                case "Mod":
                    $('.owner').remove();
                    $('.admin').remove();
                    break;
                case "Trial Mod":
                    $('.owner').remove();
                    $('.admin').remove();
                    $('.mod').remove();
                    break;
                case "User":
                    $('.owner').remove();
                    $('.admin').remove();
                    $('.mod').remove();
                    $('.trialmod').remove()
                    break;
            }
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.send($.html());
        });
    }
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

app.use("/css", express.static(path.join(__dirname, "css")));
app.use('/login', require('./js/login'));
app.use("/software", require('./js/software'))
//app.use("/db", require("./js/database"))

app.listen(process.env.PORT || 8080, () => {
    console.info('Running on port 8080');
});