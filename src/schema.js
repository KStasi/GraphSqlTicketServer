
const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        users: [User]
        bookings: [Booking]
        tickets: [Ticket]
        userBooking(firstName: String, lastName: String): [Booking]
        ticketBooking(theatre: String, place: Int): [Booking]
        userTickets(id: ID): [Ticket]
        theatreTickets(theatre: String): [Ticket]
    }

    type Mutation {
      createTicket(theatre: String!, place: Int!, price: Int!): Ticket
      createUser(firstName: String!, lastName: String!, email: String, phone: String): User
      createBooking(user: ID!, ticket: ID!, bought: Int): Booking
      bookTicket(TicketId: ID!): BookingUpdateResponse!
      cancelBooking(bookingId: ID!): BookingUpdateResponse!
    }

    type User {
      id: ID!
      firstName: String!
      lastName: String!
      email: String
      phone: String
    }

    type Booking {
      id: ID!
      user: User!
      ticket: Ticket!
      bought: Int
    }

    type Ticket {
      id: ID!
      theatre: String!
      place: Int!
      price: Int!
    }

    type BookingUpdateResponse {
      success: Boolean!
      message: String
      booking: [Booking]
    }
`;

module.exports = typeDefs;