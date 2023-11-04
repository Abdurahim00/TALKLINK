const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
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

app.use(bodyParser.json());
app.use(cookieParser());
app.use(checkUser);

app.post("/users", post_user);

app.get("/users", get_user);

app.get("/users/all", get_all_users);

app.get("/users/:id", get_user_id);

app.put("/users/:id", update_user);

app.delete("/users/:id", delete_user);

app.post("/login", login_user);

app.patch("/username/:id", patch_username);

app.patch("/password/:id", patch_password);

app.get("/current-user", currentUser);

app.post("/logout", logout_user);

app.get("/debug-decode-token", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    const decodedToken = jwt.verify(token, "secret");
    return res.json(decodedToken);
  }
  res.json({ error: "No token provided" });
});

module.exports = app;
