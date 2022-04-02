const express = require("express");
const { catchAsync } = require('./utils');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch')
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

router.get('/', catchAsync(async (req, res) => {
    res.sendStatus(403)
}));

router.get('/earn', catchAsync(async (req, res) => {
    if (req.query.dcname != null) {
        await fetch(process.env.EARNED_WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"username": "Coins earned", "avatar_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQHSjXLtyEEcZjGhUu6V3WRo7MxhGKN-i9KzLhQCV_T2sfxVYr-&usqp=CAU","content": "","embeds": [{
                    "title": req.query.dcname,
                    "fields": [
                        {
                        "name": "Earned 0.05 coins!",
                        "value": "Thank you!"
                        },
                    ]
                    }]
                })
        });
        res.sendStatus(200)
    } else {
        res.send({"code": 400, "err": "You need to provide a discord user name as dcname in the query"})
    }

}));

router.get('/info', catchAsync(async (req, res) => {
    coins = await fetch("https://my.optikservers.com/api/miner/getuserinfo?userid=600352709106991106")
    coins = await coins.json()
    coins = coins.coins
    res.send({"code": 200, "coins": coins, "goal": process.env.GOAL})
}));

router.use("/bct", require("./bct"))

module.exports = router;