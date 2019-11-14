const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const mongojs = require('mongojs');
const config = require('./config.js');
const db = mongojs(config.MONGODB_URL);
const bcrypt = require('bcryptjs');

app.use(bodyParser.json());
app.use('/', express.static('public'));

app.get('/users', (req, res) => {
    db.user.find({}, (error, docs) => {
        res.send(docs);
    })
});

app.post('/registration', (req, res) => {
    let password = req.body.password;
    bcrypt.hash(password, config.SALT, (err, hash) => {
        req.body.password = hash;
    })
    db.user.insert(req.body, (error, doc) => {
        res.send(doc);
    })
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    
    db.user.findOne({ email: email }, (error, doc) => {
        if(error) {
            res.json("No such user");
        } else {
            let hash = doc.password;
            bcrypt.compare(password, hash, (err, success) => {
                if(success) {
                    res.redirect('http://localhost:5000/#my');
                } else {
                    res.json(err);
                }
            })
        }
    })
    
});

app.get('/hours/:id', (req, res) => {
    let userId = req.params.id;
    db.hour.find({ userId: mongojs.ObjectID(userId) }, (error, docs) => {
        res.json(docs);
    })
});

app.post('/hours', (req, res) => {
    let userId = req.body.userId;
    req.body.userId = mongojs.ObjectID(userId);
    db.hour.insert(req.body, (error, doc) => {
        res.json(doc);
    });
});

app.delete('/hours/:id', (req, res) => {
    let id = req.params.id;
    db.hour.remove({ _id: mongojs.ObjectID(id) }, (error, docs) => {
        res.json(docs);
    })
});

app.listen(port, () => console.log('Listening on port ' + port));