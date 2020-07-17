class Reservation {
  constructor(givenName, surname, email, flight, seat, id) {
    this.id = id;
    this.givenName = givenName;
    this.surname = surname;
    this.email = email;
    this.flight = flight;
    this.seat = seat;
  }
}

module.exports = { Reservation };
