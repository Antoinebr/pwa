const Subscription = require('../models/Subscription');
const webpush = require('web-push');

webpush.setVapidDetails(`mailto:${process.env.VAPID_EMAIL}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);


exports.sendPush = async (req, res) => {


    if (!req.body.title && !req.body.content) {
        return res.status(400).send('400 : Missformed request you sent : ' + JSON.parse(req.body));
    }


    const subs = await Subscription.findAll();

    subs.forEach(sub => {

        const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
                auth: sub.auth,
                p256dh: sub.p256dh
            }
        }

        webpush.sendNotification(pushConfig, JSON.stringify({
                title: req.body.title,
                content: `${req.body.content} ${(new Date()).getHours()}:${(new Date()).getMinutes()}`
            }))
            .catch(e => {


                Subscription.destroy({
                        where: {
                            id: sub.id,
                        }
                    })
                    .then(r => console.log(r))
                    .catch(e => console.log(e))


            });

    });


    res.json(subs);
}