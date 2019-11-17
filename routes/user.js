module.exports = (router, db, mongojs, config, jwt) => {

    let decoded = "";

    router.use('/', (req, res, next) => {
        
        console.log("User logged in from " + req.ip);

        let authorization = req.get('Authorization');
        if (authorization) {
            jwt.verify(authorization, config.JWT_SECRET, (error, dec) => {
                if (error) {
                    res.status(401).send('Unauthorized access');
                } else {
                    decoded = dec;
                    next();
                }
            });
        } else {
            res.status(401).send('Unauthorized access');
        }
    });

    router.get('/hours', (req, res) => {
        let limit = Number(req.query.limit) || 1;
        let skip = Number(req.query.skip) || 0;
        let srt = Number(req.query.sort) || 1;

        db.hour.find({ userId: mongojs.ObjectID(decoded.id) }).sort({ createdAt: srt }).skip(skip).limit(limit, (error, docs) => {
            if (error)
                res.status(404).send("Error while fetching");
            else
                res.json(docs);
        });
    });

    router.post('/hours/interval', (req, res) => {
        let start = req.body.start;
        let end = req.body.end;
        let toTimestampStart = Date.parse(start) / 1000
        let toTimestampEnd = Date.parse(end) / 1000

        db.hour.find({ createdAt: { $gte: toTimestampStart, $lte: toTimestampEnd } }, (error, docs) => {
            if (error)
                res.json("Error while fetching");
            else
                res.json(docs);
        });
    });

    router.post('/hours', (req, res) => {
        db.hour.find({ userId: mongojs.ObjectID(decoded.userId) }, (error, docs) => {
            if (error) {
                res.status(404).send("Record not found");
            }
            req.body.userId = mongojs.ObjectID(decoded.id);
            req.body.createdAt = Date.now() / 1000 | 0
        
            db.hour.insert(req.body, (error, doc) => {
                if(error) {
                    res.send("Error");
                } else {
                    db.hour.find({ userId: mongojs.ObjectID(decoded.userId)}).sort({ createdAt: -1 }, (error, docs) => {
                        res.send(docs);
                    })
                }
            });
        })
    });

    router.delete("/hours/:id", (req, res) => {
        db.hour.find({ userId: mongojs.ObjectID(decoded.userId) }, (error, docs) => {
            if (error) {
                res.status(404).send("Record not found");
            }
            let id = req.params.id;
            db.hour.remove({ _id: mongojs.ObjectID(id) }, (error, doc) => {
                res.json(doc);
            });
        })
    });
}