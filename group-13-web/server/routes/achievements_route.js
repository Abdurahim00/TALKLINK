const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const Achievements = require("../modules/achievements")


const { get_achievements, get_achievement_by_level, post_achievement } = require("../controllers/achievements_controller");
app.use(bodyParser.json());

app.get("/achievements", get_achievements);
app.get("/achievements/:level", get_achievement_by_level);
app.post("/achievements", post_achievement);





module.exports = app;