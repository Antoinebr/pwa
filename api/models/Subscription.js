const Sequelize = require('sequelize');

let Subscription = null;


Subscription = sequelize.define('subscriptions', {
    endpoint: {
        type: Sequelize.TEXT,
        allowNull: false 
    },
    p256dh: {
        type: Sequelize.TEXT,
        allowNull: false 
    },
    auth: {
        type: Sequelize.TEXT,
        allowNull: false 
    }
});

module.exports = Subscription;