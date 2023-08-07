const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://0.0.0.0:27017/crud');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const crudSchema = new mongoose.Schema({
  username: String,
  usermail: String,
  password: String,
  resume: String,
  hobbies: [String],
  gender: String,
  city: String,
  address: String,
  image: String
});

const crud = mongoose.model('crud', crudSchema);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

app.get('/', async (req, res) => {
  try {
    const users = await crud.find();
    res.render('show', { crud: users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.sendStatus(500);
  }
});

app.post('/insert', upload.single('resume'), async (req, res) => {
  try {
    const newcrud = new crud({
      username: req.body.username,
      usermail: req.body.usermail,
      password: req.body.password,
      resume: req.file ? req.file.filename : '',
      hobbies: req.body.hobbies || [],
      gender: req.body.gender,
      city: req.body.city,
      address: req.body.address,
      image: req.file ? req.file.filename : ''
    });

    await newcrud.save();
    res.send('User inserted successfully!');
  } catch (err) {
    console.error('Failed to insert user:', err);
    res.sendStatus(500);
  }
});

app.post('/update', upload.single('resume'), async (req, res) => {
  try {
    const { username, usermail, password, hobbies, gender, city, address } = req.body;

    // Find the user document by their name
    const user = await crud.findOne({ username });

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Update the user's information
    user.username = username;
    user.usermail = usermail;
    user.password = password;
    user.resume = req.file ? req.file.filename : user.resume;
    user.hobbies = Array.isArray(hobbies) ? hobbies : [hobbies];
    user.gender = gender;
    user.city = city;
    user.address = address;

    await user.save();

    res.send('User updated successfully!');
  } catch (err) {
    console.error('Failed to update user:', err);
    res.sendStatus(500);
  }
});

app.post('/delete', async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user document by their name and remove it
    const result = await crud.findOneAndDelete({ username });

    if (!result) {
      res.status(404).send('User not found');
      return;
    }

    res.send('User deleted successfully!');
  } catch (err) {
    console.error('Failed to delete user:', err);
    res.sendStatus(500);
  }
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
