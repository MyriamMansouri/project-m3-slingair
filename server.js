"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

const { Reservation } = require("./js/Reservation");
let { flights } = require("./test-data/flightSeating");
const { reservations } = require("./test-data/Reservations");
const { formatFlightNumber, validateFlightNumber } = require("./js/helpers");

let flightNumber = "";
let reservation = {};

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
    const error = req.query.error;
    const errorMessage =
      error && error === "invalid-format"
        ? "Invalid format. Should be SA###"
        : "Flight doesn't exist";
    res.status(200).render("./pages/seat-select-page", {
      status: 200,
      message: "ok",
      error: error,
    });
  })

  .get("/flights/:number", (req, res) => {
    flightNumber = formatFlightNumber(req.params.number);
    try {
      const isValid = validateFlightNumber(flightNumber);

      if (isValid) {
        const flight = flights[flightNumber];

        if (!!flight) {
          res.status(200).json({ status: 200, flight: flight });
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
      res.status(err.code).json({ status: err.code, error: err.type });
    }
  })

  .post("/users", (req, res) => {
    const { givenName, surname, email, seatNumber } = req.body;

    reservation = new Reservation(
      givenName,
      surname,
      email,
      flightNumber,
      seatNumber,
      uuidv4()
    );
    reservations.push(reservation);

    //update seat map
    flights[flightNumber] = flights[flightNumber].map((seat) => {
      if (seat.id === seatNumber) seat.isAvailable = false; // add new reservation
      return seat;
    });
    res.status(201).json({
      status: 201,
      reservation,
    });
  })

  .get("/confirmed", (req, res) => {
    res.status(200).render("./pages/confirmed-page", { reservation });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));
