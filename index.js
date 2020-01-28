const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { User } = require('./models/user');

mongoose.connect(config.mongoURI,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DB connected"))
    .catch(err => {
        console.log("DB connecting failed");
        console.error(err);
    });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);
    user.save((err, userData) => {
        console.log("In callback!");
        if (err) {
            return res.json({ success: false, err });
        }

        return res.status(200).json({
            success: true
        });
    })
});

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(5000);