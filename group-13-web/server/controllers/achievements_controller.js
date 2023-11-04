const Achievements = require("../modules/achievements");

const get_achievements = async (request, response) => {
  try {
    const allAchievements = await Achievements.find();
    response.send(allAchievements);
  } catch (error) {
    console.error(error); // log the error for debugging
    response.status(500).send("Internal server error");
  }
};

const get_achievement_by_level = async (request, response) => {
  try {
    const level = parseInt(request.params.level); // Parse the level from the request parameter
    const achievement = await Achievements.findOne({ level }); // Find the achievement by level

    if (!achievement) {
      return response.status(404).send("Achievement not found");
    }

    response.send(achievement.route); // Return the route property of the achievement
  } catch (error) {
    console.error(error); // Log the error for debugging
    response.status(500).send("Internal server error");
  }
};

const post_achievement = async (request, response) => {
  try {
    const achData = request.body;

    const achievement = new Achievements(achData);
    await achievement.save();

    // Return achievement's ID along with success status
    response.status(200).send("ok");

  } catch (error) {
    response.status(500).send(error);
  }
}


module.exports = {
  get_achievements,
  get_achievement_by_level,
  post_achievement
};
