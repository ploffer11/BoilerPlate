const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://ploffer11:1234@react-node-nm2xs.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("DB connected")).catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(5000);