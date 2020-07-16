"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

const { User } = require("./js/User");
let { flights } = require("./test-data/flightSeating");
const { users } = require("./test-data/users");
const { formatFlightNumber, validateFlightNumber } = require("./js/helpers");

let flightNumber = "";

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

    //Look for existing user in DB
    let user = users.find(
      (user) =>
        user.email === email &&
        user.surname === surname &&
        user.givenName === givenName
    );

    // if user doesn't exist, create new
    if (!user) {
      user = new User(givenName, surname, email, uuidv4());
      users.push(user);
    }

    const index = users.indexOf(user);

    // if user already has a seat in the plane, get seat number to cancel reservation
    const existingSeatNumber = users[index].reservations[flightNumber];
    // add new reservation to user
    users[index].reservations[flightNumber] = seatNumber;
    //update seat map
    flights[flightNumber] = flights[flightNumber].map((seat) => {
      if (seat.id === existingSeatNumber) seat.isAvailable = true; // cancel existing reservation
      if (seat.id === seatNumber) seat.isAvailable = false; // add new reservation
      return seat
    });

    res.status(200).send(user);
  })

  .get("/confirmed", (req, res) => {
    res.status(200).send("ok");
  })

  .listen(8000, () => console.log(`Listening on port 8000`));
