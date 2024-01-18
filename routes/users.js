const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  bio: String,
  //only post id will be stored, not the whole post 
  posts: [{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
});

userSchema.plugin(plm)

//can create,update, read and delete; exports: can be done through another file 
module.exports = mongoose.model("user", userSchema);