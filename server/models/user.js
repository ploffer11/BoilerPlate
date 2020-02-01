const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxlength: 200
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    },
});

// save하기 전에 전처리 (post - 후처리)
userSchema.pre('save', function (next) {
    let user = this;

    // 만약 user의 password가 수정된 적이 있다면 
    if (user.isModified('password')) {
        // bcrypt가 salt를 만든다 (saltRounds - cost of processing data)
        bcrypt.genSalt(saltRounds, function (err, salt) {
            // err가 있으면 다음 미들웨어로 넘김
            if (err)
                return next(err);
            // 만들어진 salt로 user의 password를 hash함 
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err)
                    return next(err);
                // hash된 password를 저장 
                user.password = hash;
                next();
            })
        });
    } else {
        next();
    }
});

// userSchema에 comparePassword라는 메소드 정의 
userSchema.methods.comparePassword = function (plainPassword, cb) {
    // plainPassword와 이미 hash된 password를 비교함 
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};

// token 만들기 
userSchema.methods.generateToken = function (cb) {
    let user = this;
    // mongodb에 저장되는 _id를 HexString으로 바꾸는데, 부호화 키가 'secret'임 
    let token = jwt.sign(user._id.toHexString(), 'secret');
    user.token = token;

    // user에 save함 
    user.save(function (err, user) {
        if (err)
            return cb(err);
        cb(null, user);
    });
};

// token으로 찾기?
userSchema.statics.findByToken = function (token, cb) {
    let user = this;

    jwt.verify(token, 'secret', function (err, decode) {
        user.findOne({ _id: decode, token: token }, function (err, user) {
            if (err)
                return cb(err);
            cb(null, user);
        });
    });
}

const User = mongoose.model('User', userSchema);

module.exports = { User };