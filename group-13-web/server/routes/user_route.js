const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { checkUser } = require("../controllers/user_controller");
const {
  post_user,
  get_user,
  get_all_users,
  get_user_id,
  update_user,
  delete_user,
  login_user,
  patch_username,
  patch_password,
  currentUser,
  logout_user
} = require("../controllers/user_controller");

router.use(cookieParser());
router.use(checkUser);

router.post("/users", post_user);

router.get("/users", get_user);

router.get("/users/all", get_all_users);

router.get("/users/:id", get_user_id);

router.put("/users/:id", update_user);

router.delete("/users/:id", delete_user);

router.post("/login", login_user);

router.patch("/username/:id", patch_username);

router.patch("/password/:id", patch_password);

router.get("/current-user", currentUser);

router.post("/logout", logout_user);

router.get("/debug-decode-token", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    const decodedToken = jwt.verify(token, "secret");
    return res.json(decodedToken);
  }
  res.json({ error: "No token provided" });
});

module.exports = router;
