const Sequelize = require('sequelize');

let Post = null;


Post = sequelize.define('posts', {
    title: {
        type: Sequelize.TEXT,
        allowNull: false 
    },
    location: {
        type: Sequelize.TEXT,
        allowNull: false 
    },
    image: {
        type: Sequelize.TEXT,
        allowNull: false 
    }
});


module.exports = Post;