require('dotenv').load();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bugsnag = require('@bugsnag/js')
const bugsnagExpress = require('@bugsnag/plugin-express')

const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY)
bugsnagClient.use(bugsnagExpress)

const canVote = require('./canVote');

const domains = ['http://localhost:3000', process.env.PROD_URL];
const app = express();
const corsOptions = {
    origin: domains,
    optionsSuccessStatus: 200,
};

const bugsnagMiddleware = bugsnagClient.getPlugin('express');
app.use(bugsnagMiddleware.requestHandler);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/ping', (req, res) => res.send('pong'));
app.get('/can-vote', (req, res) => canVote(req, res));

app.use('/users', require('./routes/users_router'));
app.use('/vote', require('./routes/vote_router'));

app.use(bugsnagMiddleware.errorHandler);

module.exports = app;
