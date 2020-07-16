// check if flight number has correct format SA###
// passes letter to uppercase to comply with database format
// and returns flight and validation status
const validateFlightNumber = (flightNumber) => {
  flightNumber = formatFlightNumber(flightNumber);
  if (flightNumber.length === 5 && flightNumber.slice(0, 2) === "SA") {
    return true;
  }

  return false;
};

const formatFlightNumber = (flightNumber) => {
  return flightNumber
    .split("")
    .map((el) => el.toUpperCase())
    .join("");
};

module.exports = { formatFlightNumber, validateFlightNumber };
