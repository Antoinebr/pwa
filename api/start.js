const Sequelize = require('sequelize');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });


// setup a new database
// using database credentials set in .env

global.sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
    host: '0.0.0.0',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: './data/database.sqlite',
    operatorsAliases: Sequelize.Op // https://github.com/sequelize/sequelize/issues/8417
});


(async () => {

    await sequelize.authenticate();

    // Let's create the table if they don't exist yet
    await sequelize.sync(); 
    console.log('Connected to the DB')

})()
.catch((err) => console.log('Something wrong happened with the DB ', err));




// import all of our models.
require('./models/Post');
require('./models/Subscription');

// Start our app!
const app = require('./app');


// listen for requests :)
app.set('port', process.env.PORT || 4590);

const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});