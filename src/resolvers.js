module.exports = {
    Query: {
        users: (_, __ , { dataSources }) =>
            dataSources.serviceAPI.getUsers(),
        bookings: (_, __ , { dataSources }) =>
            dataSources.serviceAPI.getBookings(),
        tickets: (_, __ , { dataSources }) =>
            dataSources.serviceAPI.getTickets(),
        userBooking: (_, {firstName, lastName}, { dataSources }) => 
            dataSources.serviceAPI.getUserBookings({ firstName, lastName }),
        ticketBooking: (_, {theatre, place}, { dataSources }) => 
            dataSources.serviceAPI.getTicketBookings({ theatre, place }),
        theatreTickets: (_, {theatre}, { dataSources }) => 
            dataSources.serviceAPI.getTicketsByTheatre({ theatre }),
        userTickets: (_, {id}, { dataSources }) => 
            dataSources.serviceAPI.getTicketsByUser({ id }),
    },
    Mutation: {
        cancelBooking: (_, {id} , { dataSources }) => 
            dataSources.serviceAPI.cancelBooking({ id }),
        createTicket: (_, {theatre, place, price} , { dataSources }) => 
            dataSources.serviceAPI.createTicket({ theatre, place, price }),
        createUser: (_, {firstName, lastName, email, phone} , { dataSources }) => 
            dataSources.serviceAPI.createUser({ firstName, lastName, email, phone }),
        createBooking: (_, { ticket, bought } , { dataSources }) => 
            dataSources.serviceAPI.createBooking({ ticket, bought }),
        login: (_, { email } , { dataSources }) => 
            dataSources.serviceAPI.login({ email }),
      },
};
