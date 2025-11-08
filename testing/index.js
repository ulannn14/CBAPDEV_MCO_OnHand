const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/', // folder where files will be saved
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('myFile'); // 'myFile' is the name of the input field

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  else cb('Error: Images only!');
}

// Public folder
app.use(express.static('./public'));

// Upload endpoint
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) res.send(`Error: ${err}`);
    else if (req.file == undefined)
      res.send('Error: No file selected!');
    else
      res.send(`File uploaded successfully: ${req.file.filename}`);
  });
});

app.listen(3000, () => console.log('Server started on port 3000'));
