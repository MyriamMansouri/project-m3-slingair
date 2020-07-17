"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

const { Reservation } = require("./js/Reservation");
let { flights } = require("./test-data/flightSeating");
const { reservations } = require("./test-data/Reservations");

let flightNumber = "";
let currentReservation = {};

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
    const flightList = Object.keys(flights);
    const error = req.query.error;
    const errorMessage =
      error && error === "invalid-format"
        ? "Invalid format. Should be SA###"
        : "Flight doesn't exist";
    res.status(200).render("./pages/seat-select-page", {
      status: 200,
      message: "ok",
      flightList: flightList,
      error: error,
    });
  })

  .get("/flights/:number", (req, res) => {
    flightNumber = req.params.number;
    try {
      const isValid = flightNumber;

      if (isValid) {
        const flight = flights[flightNumber];
        res.status(200).json({ status: 200, flight: flight });
      }
    } catch (err) {
      res.status(400).json({ status: 400, error: err });
    }
  })

  .post("/users", (req, res) => {
    const { givenName, surname, email, seatNumber } = req.body;

    currentReservation = new Reservation(
      givenName,
      surname,
      email,
      flightNumber,
      seatNumber,
      uuidv4()
    );
    reservations.push(currentReservation);

    //update seat map
    flights[flightNumber] = flights[flightNumber].map((seat) => {
      if (seat.id === seatNumber) seat.isAvailable = false; // add new reservation
      return seat;
    });
    res.status(201).json({
      status: 201,
      currentReservation,
    });
  })

  .get("/confirmed", (req, res) => {
    res.status(200).render("./pages/reservation-page", { reservation : currentReservation });
  })

  .get("/users/:id", (req, res) => {
    const id = req.params.id
    const reservation = reservations.find( reservation => reservation.id === id)
    res.status(200).render("./pages/reservation-page", { reservation });
  })


  .listen(8000, () => console.log(`Listening on port 8000`));
