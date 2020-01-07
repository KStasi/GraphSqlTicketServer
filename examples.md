mutation {
  createUser(firstName: "Kate", 
    lastName: "Some", 
    email: "dsds", 
    phone: "+380996756543") {
    id
  }
}

mutation {
  createTicket(theatre: "Great theatre", 
    place: 12, 
    price: 1000) {
    id
  }
}

mutation {
  createBooking(user: 1, 
    ticket: 2, 
    bought: 0) {
    id
  }
}

TODO:
- add booked for ticket,
- reject booking for booked
