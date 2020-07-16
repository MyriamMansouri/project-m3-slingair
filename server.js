"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { flights } = require("./test-data/flightSeating");
const { formatFlightNumber, validateFlightNumber } = require("./js/helpers");

express()
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("dev"))
  .use(express.static("public"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set("view engine", "ejs")

  // endpoints
  .get("/seat-select", (req, res) => {
    const error = req.query.error
    const errorMessage = error && error==="invalid-format" ? "Invalid format. Should be SA###" : "Flight doesn't exist"
    res.status(200).render("./pages/seat-select", {
      status: 200,
      message: "ok",
      error: error,
    });
  })

  .get("/flights/:number", (req, res) => {
    const flightNumber = formatFlightNumber(req.params.number);
    try {
      const isValid = validateFlightNumber(flightNumber);
      
      if (isValid) {

        const flight = flights[flightNumber];
        
        if (!!flight) {
          res.status(200).json({status:200, flight: flight});
        } else {
          throw {
            code: 404,
            type: "do-not-exist",
          };
        }
      } else {
        throw {
          code: 400,
          type: "invalid-format",
        };
      }
    } catch (err) {
      res.status(err.code).json({status: err.code, error: err.type})
    }
  })

  .listen(8000, () => console.log(`Listening on port 8000`));
