const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mongojs = require('mongojs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let config;
if (port == 5000) {
    config = require('./config.js');
}
const db = mongojs(process.env.MONGODB_URL || config.MONGODB_URL);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', express.static('public'));

app.get('/users', (req, res) => {
    db.user.find({}, (error, docs) => {
        res.send(docs);
    })
});

// Express Routers
let userRouter = express.Router();
require("./routes/user.js")(userRouter, db, mongojs, config, jwt);
app.use("/user", userRouter);

app.post('/register', (req, res) => {
    let email = req.body.email;
    console.log(email);

    db.user.find({ email: email }, (error, doc) => {
        if (error)
            throw error;
        else {
            if (doc.length != 0) {
                console.log(doc.length);
                res.status(400).send();
            } else {
                let password = req.body.password;
                bcrypt.hash(password, config.SALT || process.env.SALT, (err, hash) => {
                    let data = req.body;
                    data.password = hash;
                    db.user.insert(data, (error, doc) => {
                        if (error) {
                            doc.json("ERROR");
                        } else {
                            res.status(200).send();
                        }
                    })
                })
            }
        }
    })

});

app.post('/login', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;

    db.user.findOne({ email: email }, (error, doc) => {
        if (error) {
            throw error;
        } else {
            if (doc == null)
                res.status(400).send();
            else {
                let hash = doc.password;
                bcrypt.compare(password, hash, (err, success) => {
                    if (success == true) {
                        let jwtToken = jwt.sign({
                            id: doc._id,
                            exp: (Math.floor(Date.now() / 1000) + 3600) // token which lasts for an hour
                        }, process.env.JWT_SECRET || config.JWT_SECRET);
                        res.setHeader("Authorization", jwtToken);
                        res.status(200).send(jwtToken);
                    } else {
                        res.status(401).send("Wrong email or password");
                    }
                })
            }
        }
    })

});

app.listen(port, () => {
    console.log('Listening on port ' + port)
});