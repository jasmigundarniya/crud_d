const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://0.0.0.0:27017/crud', { useNewUrlParser: true, useUnifiedTopology: true });
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
  address: String
});

const crud = mongoose.model('crud', crudSchema);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    const users = await crud.find();
    res.render('show', { crud: users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.sendStatus(500);
  }
});

app.post('/show', async (req, res) => {
  try {
    const newcrud = new crud({
      username: req.body.username,
      usermail: req.body.usermail,
      password: req.body.password,
      resume: req.body.resume,
      hobbies: req.body.hobbies,
      gender: req.body.gender,
      city: req.body.city,
      address: req.body.address
    });

    await newcrud.save();
    res.send('User saved successfully!');
  } catch (err) {
    console.error('Failed to save user:', err);
    res.sendStatus(500);
  }
});

// ...

app.post('/update/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Find the user document by their name
    const user = await crud.findOne({ username: name });

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Update the user's information
    user.username = req.body.username;
    user.usermail = req.body.usermail;
    user.password = req.body.password;
    user.resume = req.body.resume;
    user.hobbies = req.body.hobbies;
    user.gender = req.body.gender;
    user.city = req.body.city;
    user.address = req.body.address;

    await user.save();

    res.send('User updated successfully!');
  } catch (err) {
    console.error('Failed to update user:', err);
    res.sendStatus(500);
  }
});

app.post('/delete/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Find the user document by their name and remove it
    const result = await crud.deleteOne({ username: name });

    if (!result.deletedCount) {
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
