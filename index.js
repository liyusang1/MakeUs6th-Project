const express = require('./config/express');
const {logger} = require('./config/winston');

const port = 4000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

//test
