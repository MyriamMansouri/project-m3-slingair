const flightInput = document.getElementById("flight");
const flightSelect= document.getElementById("flight-select");
const seatsDiv = document.getElementById("seats-section");
const confirmButton = document.getElementById("confirm-button");

let selection = "";

const errorMessages = {
  "do-not-exist": "Flight number doesn't exist",
  "invalid-format": "Invalid flight format. Should be SA###",
};

const renderSeats = (flightSeats) => {
  document.querySelector(".form-container").style.display = "block";

  const alpha = ["A", "B", "C", "D", "E", "F"];
  for (let r = 1; r < 11; r++) {
    const row = document.createElement("ol");
    row.classList.add("row");
    row.classList.add("fuselage");
    seatsDiv.appendChild(row);
    for (let s = 1; s < 7; s++) {
      const seatNumber = `${r}${alpha[s - 1]}`;
      const isAvailable = flightSeats.find((seat) => seat.id === seatNumber)
        .isAvailable;

      const seat = document.createElement("li");

      const seatOccupied = `<li><label class="seat"><span id="${seatNumber}" class="occupied">${seatNumber}</span></label></li>`;
      const seatAvailable = `<li><label class="seat"><input type="radio" name="seat" value="${seatNumber}" /><span id="${seatNumber}" class="avail">${seatNumber}</span></label></li>`;

      seat.innerHTML = isAvailable ? seatAvailable : seatOccupied;
      row.appendChild(seat);
    }
  }

  let seatMap = document.forms["seats"].elements["seat"];
  seatMap.forEach((seat) => {
    seat.onclick = () => {
      selection = seat.value;
      seatMap.forEach((x) => {
        if (x.value !== seat.value) {
          document.getElementById(x.value).classList.remove("selected");
        }
      });
      document.getElementById(seat.value).classList.add("selected");
      document.getElementById("seat-number").innerText = `(${selection})`;
      confirmButton.disabled = false;
    };
  });
};

const toggleFormContent = (event) => {
  const flightNumber = flightInput.value;

  fetch(`/flights/${flightNumber}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status = 200) {
        
        renderSeats(data.flight);
        flightSelect.style.display="none"
      } else {
        console.log(data)
      }
    });
};

const handleConfirmSeat = async (event) => {
  event.preventDefault();

  await fetch("/users", {
    method: "POST",
    body: JSON.stringify({
      givenName: document.getElementById("givenName").value,
      surname: document.getElementById("surname").value,
      email: document.getElementById("email").value,
      seatNumber: selection,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if ((data.status === 201)) {
        window.location.href = `/confirmed`;
      } else {
        console.log(data)
      }
    });
};

flightInput.addEventListener("change", toggleFormContent);
confirmButton.addEventListener("click", handleConfirmSeat);
