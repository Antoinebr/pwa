const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/postsCtrl');
const subscriptionsCtrl = require('../controllers/subscriptionsCtrl');
const pushCtrl = require('../controllers/pushCtrl');

const {
    catchErrors
} = require('../handlers/errorHandlers');


router.get("/posts", catchErrors(postCtrl.getPosts));

router.post("/posts", postCtrl.upload, postCtrl.resize, catchErrors(postCtrl.createPost));

router.delete("/posts", catchErrors(postCtrl.deletePostById));


router.get('/subscriptions', catchErrors(subscriptionsCtrl.getSubs));
router.post('/subscriptions', catchErrors(subscriptionsCtrl.createSub));
router.delete('/subscriptions', catchErrors(subscriptionsCtrl.deleteSubById));


router.post('/sendPush',pushCtrl.sendPush);


module.exports = router;