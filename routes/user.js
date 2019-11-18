module.exports = (router, db, mongojs, config, jwt) => {

    let decoded = "";

    router.use('/', (req, res, next) => {

        console.log("User logged in from " + req.ip);

        let authorization = req.get('Authorization');
        if (authorization) {
            jwt.verify(authorization, config.JWT_SECRET || process.env.JWT_SECRET, (error, dec) => {
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
        let limit = Number(req.query.limit) || 5;
        let skip = Number(req.query.skip) || 0;
        let srt = Number(req.query.sort) || 1;

        if (req.query.start != null && req.query.end != null) {
            let start = req.query.start;
            let end = req.query.end;
            let toTimestampStart = Date.parse(start) / 1000
            let toTimestampEnd = Date.parse(end) / 1000
            console.log(toTimestampStart);

            db.hour.find({
                $and: [
                    { userId: mongojs.ObjectID(decoded.id) },
                    { createdAt: { $gte: toTimestampStart } },
                    { createdAt: { $lte: toTimestampEnd } }
                ]
            }).sort({ createdAt: srt }).skip(skip).limit(limit, (error, docs) => {
                console.log("OPA");

                if (error)
                    res.send("Error while fetching documents")
                console.log(docs);

                res.json(docs);

            });

        } else {
            db.hour.find({ userId: mongojs.ObjectID(decoded.id) }).sort({ createdAt: srt }).skip(skip).limit(limit, (error, docs) => {
                if (error)
                    res.status(404).send("Error while fetching");
                else
                    res.json(docs);
            });
        }
    });

    router.post('/hours', (req, res) => {
        db.hour.find({ userId: mongojs.ObjectID(decoded.userId) }, (error, docs) => {
            if (error) {
                res.status(404).send("Record not found");
            }
            req.body.userId = mongojs.ObjectID(decoded.id);
            let d = req.body.createdAt;
            req.body.createdAt = Date.parse(d) / 1000

            db.hour.insert(req.body, (error, doc) => {
                if (error) {
                    res.send("Error");
                } else {
                    db.hour.find({ userId: mongojs.ObjectID(decoded.userId) }).sort({ createdAt: -1 }, (error, docs) => {
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