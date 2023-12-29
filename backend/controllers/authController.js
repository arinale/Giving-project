const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");
const { emit } = require("nodemon");

/***--------------------------------
 * @description Register New User
 * @router     /api/auth/register
 * @method     POST
 * @access     public
 ----------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  console.log("register");
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ Message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "email already exist" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();
  res
    .status(201)
    .json({ message: "you registered succesfully, please log in" });
});

/***--------------------------------
 * @description Login New User
 * @router     /api/auth/login
 * @method     POST
 * @access     public
 ----------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ Message: error.details[0].message });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid email or password" });
  }
  const token = user.generateAuthToken();
  res.status(200).json({
    _id: user.id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
  });
});
