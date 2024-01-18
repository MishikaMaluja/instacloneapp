var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

//cannot see feed until unless the user is not loggedIn 
router.get("/feed", isLoggedIn, async function(req, res) {
  const user=await userModel.findOne({username:req.session.passport.user})
  const posts = await postModel.find().populate("user");
  res.render("feed", {footer: true, posts,user});
});

router.get("/profile", isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  res.render("profile", {footer: true, user});
});

router.get("/search", isLoggedIn, function(req, res) {
  res.render("search", {footer: true});
});

//through this we will get to know which post are we going to like 
router.get("/like/posts/:id", isLoggedIn, async function(req, res) {
  //fetching user who is liking 
  const user=await userModel.findOne({username:req.session.passport.user});
  //finding post on the basis of post id that the user is gonna like 
  const post=await postModel.findOne({_id:req.params.id});

  //if already liked remove like
  //if not liked, like it
  if(post.likes.indexOf(user._id)===-1){  //checking if id is -1 means the post isn't liked before 
    post.likes.push(user._id);
  }
  //else remove like 
  else{
    //post will remove the last like so splice is used 
    //splice is given two arguments: first is index of the user means which user it is and second 
    //is number of members 
    post.likes.splice(post.likes.indexOf(user._id),1);
  }

  await post.save();
  res.redirect("/feed");
});

router.get("/edit", isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", {footer: true, user});
});

router.get('/upload', isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.get("/username/:username", isLoggedIn, async function(req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await userModel.find({username: regex});
  res.json(users);
});

//creating account
router.post("/register", function(req, res, next){
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email
  });
  
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

//login route, login on the basis of username and password
router.post("/login", passport.authenticate("local", {
  //if data provided(username and password) is correct, redirect to profile page else again to login 
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function(req, res) {
});

router.get("/logout", function (req, res, next) {
  req.logout(function(err){
    if(err) { return next(err); }
    res.redirect('/');
  });
});

router.post("/update", upload.single("image"), async function (req,res) {
  //found the one who wanna edit profile and then updating 
  const user = await userModel.findOneAndUpdate(
    //finding the user on the basis of the username
    {username: req.session.passport.user }, 
    //updating username, name and bio
    {username: req.body.username, name: req.body.name, bio: req.body.bio}, 
    {new: true }
    );

    if(req.file){
      //for updating profile image 
      user.profileImage = req.file.filename;
    }
    //await becz this is async task 
    await user.save();
    res.redirect("/profile");
});

router.post("/upload", isLoggedIn, upload.single("image"), async function(req,res){
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create( { 
    picture: req.file.filename,
    user: user._id,
    caption: req.body.caption
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
});

//if already logged in, user will be able to access that page else will be redirected to login page 
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}

module.exports = router;
