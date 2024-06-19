
const express = require('express');
const {config} = require('dotenv');
config({path: './config/dev.config.env'});

const { startApp } =  require('./src/start-app.js');

const app = express();

startApp(app, express);