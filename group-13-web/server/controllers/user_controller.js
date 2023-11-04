const User = require("../modules/user")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const cookieParser = require('cookie-parser');

// Middleware to decode JWT and get the user's ID
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    // Check if the token exists and is valid
    if (token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if (err) {
                console.log(err);
                res.locals.user = null;
                next();
            } else {
                // Attach user's ID to the request object
                req.userId = decodedToken.userId;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ userId: id }, 'secret', {
    expiresIn: maxAge
  });
}



const post_user = async (request, response) => {
  try {
    const userData = request.body;

    const saltRounds = 10;
    userData.password = await bcrypt.hash(userData.password, saltRounds);

    const user = new User(userData);
    await user.save();
    
    const token = createToken(user._id);
    response.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    // Return user's ID along with success status
    response.json({ success: true, userId: user._id });

  } catch (error) {
    if (error.code === 11000) {
      response.status(400).send('Email or username has already been registered.');
    } else {
      console.error('Error while registering user:', error);
      response.status(500).send(error);
    }
  }
}



const get_user = async (request, response) => {
  try {
    const searchQuery = request.query.searchQuery;

    if (searchQuery) {
      // Search for an exact match with the provided user_name.
      const user = await User.findOne({ user_name: searchQuery });
      console.log('Found user:', user);
      if (user) {
        response.send([user]);  // Returning an array for consistency
      } else {
        response.status(404).send({ message: "User not found" });
      }
    } else {
      // No search query provided, return all users
      response.status(400).send({ message: "Bad Request: Search query not provided" });
    }

  } catch (error) {
    response.status(500).send(error);
  }
}

const get_all_users = async (request, response) => {
  try {
    const users = await User.find({});
    response.send(users);
  } catch (error) {
    response.status(500).send(error);
  }
}

const patch_username = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User not found");
    }
    const new_username = req.body.username;
    user.user_name = new_username;
    user.save()
    res.status(200).send("ok")
  } catch (err) {
    res.status(500).send(err)
  }
}

const patch_password = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User not found");
    }
    const new_password = await bcrypt.hash(req.body.password, 10);
    user.password = new_password;
    user.save()
    res.status(200).send("ok")
  } catch (err) {
    res.status(500).send(err)
  }
}



const get_user_id = async (request, response) => {
  try {
    const userId = request.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).send("User not found");
    }
    response.send(user);
  } catch (error) {
    response.status(500).send(error);
  }
}


const update_user = async (request, response) => {
  try {
    const userId = request.params.id;
    const userData = request.body;
    const user = await User.findByIdAndUpdate(userId, {
      user_name: request.body.user_name,
      password: await bcrypt.hash(request.body.password, 10),
      email: request.body.email
    }, { new: true });
    if (!user) {
      return response.status(404).send("User not found");
    }
    response.send(user);
  } catch (error) {
    response.status(500).send(error);
  }
}

const delete_user = async (request, response) => {
  try {
    const userId = request.params.id;
    const user = await User.findByIdAndRemove(userId);
    if (!user) {
      return response.status(404).send("User not found");
    }
    response.send(user);
  } catch (error) {
    response.status(500).send(error);
  }
}


const login_user = async (request, response) => {
  try {
    const { user_name, password } = request.body;

    // we find the user with the provided user_name
    const user = await User.findOne({ user_name });

    if (!user) {
      return response.status(400).json({ success: false, message: 'User not found' });
    }

    const codeMatch = await bcrypt.compare(password, user.password)
    // compare the passwords
    if (!codeMatch) {
      return response.status(400).json({ success: false, message: 'Incorrect password' });
    }
    
    const token = createToken(user._id);
    response.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000})

    // Include the user's ID in the response
    response.json({ success: true, userId: user._id });

  } catch (error) {
    console.error('Error during login:', error);
    response.status(500).send(error);
  }
}
const logout_user = (request, response) => {
  // Clear the jwt cookie
  response.clearCookie('jwt');
  response.json({ success: true, message: 'Successfully logged out' });

};

const currentUser = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ userId: req.userId, isAdmin: user.isAdmin });
}

module.exports = {
  post_user,
  get_user,
  get_all_users,
  get_user_id,
  update_user,
  delete_user,
  login_user,
  patch_username,
  patch_password,
  checkUser,
  currentUser,
  logout_user
}
