class User {
  constructor(givenName, surname, email, id) {
    this.id = id;
    this.givenName = givenName;
    this.surname = surname;
    this.email = email;
    this.reservations = {};
  }
}

module.exports = { User };
