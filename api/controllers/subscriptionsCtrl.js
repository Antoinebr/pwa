const Subscription = require('../models/Subscription');


exports.createSub = (req, res) => {

    if (req.body.endpoint === null || req.body.p256dh === null || req.body.auth === null) {
        return res.status(400).send('400 : Missformed request you sent : ' + JSON.parse(req.body));
    }

    const data = {
        endpoint: req.body.endpoint,
        p256dh: req.body.keys.p256dh,
        auth: req.body.keys.auth,
    };

    Subscription.create(data);

    res.json(data);

}


exports.getSubs = async (req, res) => {

    const subs = await Subscription.findAll();

    res.json(subs);
}


exports.deleteSubById = (req, res) => {

    if (!req.body.id) {
        return res.status(400).send('400 : Missformed request');
    }

    Subscription.destroy({
        where: {
            id: req.body.id,
        }
    });

    res.json({
        ok: `${req.body.id} deleted`
    });

};