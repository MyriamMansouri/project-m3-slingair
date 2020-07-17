"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const request = require("request-promise");

const API = "https://journeyedu.herokuapp.com";

let flightNumber = "";
let currentId = "";
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
  .get("/seat-select", async (req, res) => {
    try {
      const flightList = await request(`${API}/slingair/flights`);
      res.status(200).render("./pages/seat-select-page", {
        status: 200,
        flightList: JSON.parse(flightList).flights,
      });
    } catch (err) {
      res.status(err.statusCode).json({ err });
    }
  })

  .get("/flights/:number", async (req, res) => {
    flightNumber = req.params.number;
    try {
      const flight = await request(`${API}/slingair/flights/${flightNumber}`);
      res
        .status(200)
        .json({ status: 200, flight: JSON.parse(flight)[flightNumber] });
    } catch (err) {
      res.status(err.statusCode).json({ err });
    }
  })

  .post("/users", async (req, res) => {
    const { givenName, surname, email, seatNumber } = req.body;
    try {
      const user = await request({
        method: "POST",
        uri: `${API}/slingair/users`,
        body: {
          givenName,
          surname,
          email,
          flight: flightNumber,
          seat: seatNumber,
        },
        json: true,
      });
      // store current user's id
      currentId = user.reservation.id;
      res.status(201).json({
        status: 201,
        givenName,
        surname,
        email,
        flight: flightNumber,
        seat: seatNumber,
      });
    } catch (err) {
      res.status(err.statusCode).json({ err });
    }
  })

  .get("/confirmed", (req, res) => {
    res.status(200).redirect(`/users/${currentId}`);
  })

  .get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const reservation = await request(`${API}/slingair/users/${id}`);
    res.status(200).render("./pages/reservation-page", { reservation: JSON.parse(reservation).data });
  })

  .listen(8000, () => console.log(`Listening on port 8000`));
