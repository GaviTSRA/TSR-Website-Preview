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

    if(util.login_method == "none") res.redirect('/?goto=translate');
    else if(util.login_method == "guest") res.redirect('/?err=notDiscord');
    else if(!util.has_joined) res.redirect("/?err=joinDiscord");
    fs.readFile(__dirname + '/../html/translate.html', 'utf8', function (err,data) {
        if (err) return console.log(err);
        var $ = cheerio.load(data);
        $('#dcname').prop("value", `${util.user_data.username}#${util.user_data.discriminator}`);
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send($.html());
    })
}));

router.get("/submit", catchAsync(async (req,res) => {
    util = new utils(req, false);
    await util.init();

    if(util.login_method == "none") res.redirect('/?goto=translate');
    else if(util.login_method == "guest") res.redirect('/?err=notDiscord');
    else if(!util.has_joined) res.redirect("/?err=joinDiscord");
    await fetch(process.env.TRANSLATE_WEBHOOK, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username": "TSR Website | Translate", "avatar_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQHSjXLtyEEcZjGhUu6V3WRo7MxhGKN-i9KzLhQCV_T2sfxVYr-&usqp=CAU","content": "","embeds": [{
                "title": "**Translation by "+req.query.dcname+"**",
                "fields": [
                    {
                    "name": "In what language are you translating?",
                    "value": req.query.lang
                    },
                    {"name": "tsr.reconnect","value": req.query.tsr_reconnect},
                    {"name": "tsr.settings","value": req.query.tsr_settings},
                    {"name": "setting.resetupdateurl.name","value": req.query.setting_resetupdateurl_name},
                    {"name": "setting.vanillasettings.name","value": req.query.setting_vanillasettings_name},
                    {"name": "setting.clientsettings.name","value": req.query.setting_clientsettings_name},
                    {"name": "setting.name.name","value": req.query.setting_name_name},
                    {"name": "setting.uuid.name","value": req.query.setting_uuid_name},
                    {"name": "setting.runclientsidejs.name","value": req.query.setting_runclientsidejs_name},
                    {"name": "setting.showallblocks.name","value": req.query.setting_showallblocks_name},
                    {"name": "setting.manage.profiles.name","value": req.query.setting_manage_profiles_name},
                    {"name": "tsr.profiles.title","value": req.query.tsr_profiles_title},
                    {"name": "tsr.profile.name","value": req.query.tsr_profile_name},
                    {"name": "tsr.profile.uuid","value": req.query.tsr_profile_uuid},
                    {"name": "tsr.profile.add","value": req.query.tsr_profile_add},
                    {"name": "tsr.add.profile.title","value": req.query.tsr_add_profile_title},
                ]
                }]
            })
    });
    res.redirect("/?msg=apSend");
})); 

module.exports = router;