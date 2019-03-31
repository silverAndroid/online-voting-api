require('dotenv').load();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dayjs = require('dayjs');

const domains = ['http://localhost:3000', 'https://vote.ieeeuottawa.ca'];
const app = express();
const corsOptions = {
    origin: domains,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/ping', (req, res) => res.send('pong'));
app.get('/can-vote', (req, res) => {
    const currentTime = dayjs();
    const startTime = dayjs(process.env.START_TIME, 'YYYY-MM-DD HH:mmZZ');
    const endTime = dayjs(process.env.END_TIME, 'YYYY-MM-DD HH:mmZZ');

    if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
        res.status(200).send(null);
    } else {
        res.status(412).json({
            notStarted: currentTime.isBefore(startTime),
            isClosed: currentTime.isAfter(endTime),
        });
    }
});

app.use('/users', require('./routes/users_router'));
app.use('/vote', require('./routes/vote_router'));

module.exports = app;
