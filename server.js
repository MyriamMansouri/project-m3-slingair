'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { flights } = require('./test-data/flightSeating');

express()
  .use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  })
  .use(morgan('dev'))
  .use(express.static('public'))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))


  // endpoints
.get('/flights/:id', (req, res)=> {
  const flightNumber = req.params.id
  console.log(flightNumber)
  res.status(200).json({
    status:200,
    message: 'ok'
  })
})

  .listen(8000, () => console.log(`Listening on port 8000`));
