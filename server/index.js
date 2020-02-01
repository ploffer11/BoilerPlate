const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { User } = require('./models/user');
const { auth } = require('./middleware/auth');

mongoose.connect(config.mongoURI,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DB connected"))
    .catch(err => {
        console.error(err);
    });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// GET /api/user/auth 
app.get('/api/user/auth', auth, (req, res) => {
    console.log(req.user);
    res.status(200).json({
        _id: req._id,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
    });
});

// POST /api/users/register
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);
    user.save((err, doc) => {
        if (err)
            return res.json({ success: false, err });

        return res.status(200).json({
            success: true,
            userData: doc
        });
    })
});

// POST /api/user/login
app.post('/api/user/login', (req, res) => {
    // Email에 해당하는 user를 찾고, 이를 callback함수의 user로 전달 
    User.findOne({ email: req.body.email }, (err, user) => {
        // Email에 해당하는 user가 없다면 false 리턴 
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });
        }

        // comparePassword
        // request로 보내진 password를 comparePassword로 비교, match여부가 isMatch로 전달 
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "wrong password"
                });
            }
        });

        // generateToken
        // user에게 토큰을 부여
        user.generateToken((err, user) => {
            if (err)
                return res.status(400).send(err);
            res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true });
        });
    });
});

app.get('/api/user/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id, }, { token: "" }, (err, doc) => {
        if (err)
            return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

app.get('/', (req, res) => {
    res.json({ Hi: "Hello" });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});