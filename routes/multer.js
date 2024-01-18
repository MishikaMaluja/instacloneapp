const multer = require('multer');
//for unique name to image 
const {v4: uuidv4} = require('uuid');
 const path = require('path');

 //set up to store files on the disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //defining image path
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        const unique = uuidv4();
      cb(null, unique + path.extname(file.originalname));
    }
  })
  
  const upload = multer({ storage: storage })
  module.exports = upload;