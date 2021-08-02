const express = require("express");
const { catchAsync } = require('./utils');
const cookieParser = require('cookie-parser');

const router = express.Router();
router.use(cookieParser());

router.get('/', catchAsync(async (req, res) => {
    if(req.query.download == undefined) res.status(400);
    else {
        switch(req.query.download) {
            case "discordrp":
                res.download("./software/discordrp.py");
                break;
            default:
                res.status(404);
                break;
        }
    }
}));

module.exports = router;