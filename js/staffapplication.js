const express = require("express");
const { catchAsync, utils } = require('./utils');
const cookieParser = require('cookie-parser');
const fs = require("fs");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

const router = express.Router();
require('dotenv').config();
router.use(cookieParser());

router.get('/', catchAsync(async (req, res) => {
    util = new utils(req, false);
    await util.init();
    if(util.login_method == "none") res.redirect('/');
    else if(util.login_method == "guest") res.redirect('/?err=notDiscord');
    else if(!util.has_joined) res.redirect("/?err=joinDiscord");
    else if(util.highest_role != "User") res.redirect("/?err=notUser");
    else if(req.query.submit != "true") {
        fs.readFile(__dirname + '/../html/staffapplication.html', 'utf8', function (err,data) {
            if (err) return console.log(err);
            var $ = cheerio.load(data);
            $('#dcname').prop("value", `${util.user_data.username}#${util.user_data.discriminator}`);
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.send($.html());
        })
    } else {
        await fetch(process.env.WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"username": "TSR Website | Staff Application", "avatar_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQHSjXLtyEEcZjGhUu6V3WRo7MxhGKN-i9KzLhQCV_T2sfxVYr-&usqp=CAU","content": "","embeds": [{
                    "title": "**Staffapplication of "+req.query.dcname+"**",
                    "fields": [
                        {
                        "name": "What is your mindustry name?",
                        "value": req.query.mdname
                        },
                        {
                        "name": "Why do you want to become staff?",
                        "value": req.query.reason
                        },
                        {
                        "name": "How long have you been playing mindustry?",
                        "value": req.query.playtime
                        },
                        {
                        "name": "Have you got any experience in being staff on discord / in mindustry?",
                        "value": req.query.experience
                        }
                    ]
                    }]
                })
        });
        res.redirect("/?msg=apSend");
    }
}));

module.exports = router;