const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');

const app = express();

app.use(cors());

app.use(express.static('public'));
// Takes the raw requests and turns them into usable properties on req.body
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));


app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}))



// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);



module.exports = app;






