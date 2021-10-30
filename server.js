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
        fs.readFile(__dirname + '/html/index.html', 'utf8', function (er,data) {
            if (er) return console.log(er);
            var $ = cheerio.load(data)
            if (req.query.goto != "" && req.query.goto != undefined) {
                $("#discord").prop("href", "/login/discord?goto=" + req.query.goto)
                $("#guest").prop("href", "/login/guest?goto=" + req.query.goto)
            }
            res.send($.html());
        })
    } else {
        if(req.query.logout == "true") {
            res.clearCookie("token").redirect("/");
        } 
        else {
            if(util.login_method == "discord") {
                if(util.has_joined) highest_role = util.highest_role;
                else highest_role = ""; 
            }

            fs.readFile(__dirname + '/html/logged-in.html', 'utf8', function (er,data) {
                if (er) return console.log(er);
                var $ = cheerio.load(data)

                err = ""
                msg = ""

                switch(req.query.err) {
                    case "notUser":
                        err = "You already have a higher role than 'User', so you can't apply!";
                        break;
                    case "notJoined":
                        err = "You need to join the TSR Network Discord!";
                        break;
                    case "notDiscord":
                        err = "You need to use a discord account!";
                        break;
                    default:
                        err = "";
                }

                switch(req.query.msg) {
                    case "apSend": 
                        msg = "Your application has been send!"
                    break;
                    case "trSend":
                        msg = "Thanks for translating! Your translation was send!"
                    break;
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

                $("body").prop("class", req.cookies.bg);
                $("#switchBg").prop("src", "/resources/"+req.cookies.bg+".png")

                if(err != "") $("#err").text(err);
                if(msg != "") $("#msg").text(msg);
                //res.set('Content-Type', 'text/html; charset=utf-8');
                if(req.cookies.bg==undefined){
                    res.cookie("bg", "gradient").send($.html())
                } else res.send($.html());
            })
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
app.use("/resources", express.static(path.join(__dirname, "resources")))
app.use('/login', require('./js/login'));
app.use("/software", require('./js/software'))
app.use("/staffapplication", require("./js/staffapplication"))
app.use("/translate", require("./js/translate"))

app.listen(process.env.PORT || 8080, () => {
    console.info('Running on port 8080');
});