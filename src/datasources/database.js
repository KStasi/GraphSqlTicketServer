const { DataSource } = require('apollo-datasource');
const Sequelize = require('sequelize');

class ServiceAPI extends DataSource {
  constructor() {
    super();
    this.store = createDb();
  }
  initialize(config) {
    this.context = config.context;
  }

  async bookingReducer(booking) {
    booking.user = await this.store.users.findById(booking.user);
    booking.ticket = await this.store.tickets.findById(booking.ticket);
    return {
      id: booking.id || 0,
      bought: booking.bought,
      user: {
        id: booking.user.id,
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
        email: booking.user.email,
        phone: booking.user.phone,
      },
      ticket: {
        id: booking.ticket.id,
        theatre: booking.ticket.theatre,
        place: booking.ticket.place,
        price: booking.ticket.price,
      },
    };
  }

  async getBookings() {
    const response = await this.store.bookings.findAll();
    return await Array.isArray(response) ? response.map(booking => this.bookingReducer(booking)) : [];
  }

  async getUsers() {
    return await this.store.users.findAll();
  }

  async getTickets() {
    return await this.store.tickets.findAll();
  }

  async getUserBookings({ user }) {
    return await this.store.bookings.findAll({ where: { user } });
  }

  async getTicketBookings({ ticket }) {
    return await this.store.bookings.findAll({ where: { ticket } });
  }

  async getTicketsByUser({ id }) {
    const bookings = await this.store.bookings.find({ where: { user: id } });
    return await Array.isArray(bookings) ? response.map(booking => booking.ticket) : [];
  }

  async createUser({ firstName, lastName, email, phone }) {
    const users = await this.store.users.findOrCreate({ where: { firstName, lastName, email, phone } });
    return users && users[0] ? users[0] : null;
  }

  async createTicket({ theatre, place, price }) {
    const tickets = await this.store.tickets.findOrCreate({ where: { theatre, place, price, booked: 0 } });
    return tickets && tickets[0] ? tickets[0] : null;
  }

  async createBooking({ ticket }) {
    if (!this.context.user) return false;
    const user = this.context.user.id;
    const ticketUnit = await this.store.tickets.findById(ticket);
    if (!ticketUnit || ticketUnit.booked) return false;
    const bookings = await this.store.bookings.findOrCreate({ where: { user, ticket, bought: 0 } });
    await this.store.tickets.update({booked: 1}, { where: { id: ticket }});
    return bookings && bookings[0] ? bookings[0] : null;
  }

  async buyTicket({ ticket }) {
    if (!this.context.user) return false;
    const user = this.context.user.id;
    const ticketUnit = await this.store.tickets.findById(ticket);
    if (!ticketUnit || !ticketUnit.booked) return false;
    const bookings = await this.store.bookings.findOne( { user, ticket, bought: 0 });
    if (!bookings) return null;
    // const booking = this.bookingReducer(bookings.dataValues);
    await this.store.tickets.update({booked: 1}, { where: { id: ticket }});
    return !!await this.store.bookings.update({bought: 1}, { where: { id: bookings.dataValues.id }});
  }

  async login({ email }) {
    const user = this.store.users.findOrCreateUser({ email });
    if (user) return new Buffer(email).toString('base64');
}

  async cancelBooking({ id }) {
    if (!this.context.user) return false;
    const user = this.context.user.id;
    const bookings = await this.store.bookings.findOne({ id, user });
    if (!bookings || bookings.dataValues.bought) return false;
    const booking = await this.bookingReducer(bookings.dataValues);
    const ticketUnit = await this.store.tickets.findById(booking.ticket.id);
    if (!ticketUnit || !ticketUnit.dataValues.booked) return false;
    await this.store.tickets.update({booked: 0}, { where: { id: booking.ticket.id }});
    return !!await this.store.bookings.destroy({ where: { id } });
  }
}

const createDb = () => {
  const Op = Sequelize.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    logging: false,
    storage: './.store.sqlite',
    operatorsAliases
  });


  const CREATE_TICKETS_QUERY = `CREATE TABLE IF NOT EXISTS tickets(
    id INTEGER PRIMARY KEY,
    theatre STRING,
    place INTEGER,
    price INTEGER,
    booked INTEGER,
    createdAt DATE,
    updatedAt DATE
  )`;

  const CREATE_USERS_QUERY = `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY,
    firstName STRING,
    lastName STRING,
    email STRING,
    phone STRING,
    createdAt DATE,
    updatedAt DATE
  )`;

  const CREATE_BOOKING_QUERY = `CREATE TABLE IF NOT EXISTS bookings(
    id INTEGER PRIMARY KEY,
    user INTEGER NOT NULL,
    ticket INTEGER NOT NULL,
    bought INTEGER,
    createdAt DATE,
    updatedAt DATE,
    FOREIGN KEY (user)
       REFERENCES users (id),
    FOREIGN KEY (ticket)
      REFERENCES tickets (id)
  )`;

  sequelize.query(CREATE_TICKETS_QUERY);
  sequelize.query(CREATE_USERS_QUERY);
  sequelize.query(CREATE_BOOKING_QUERY);

  const tickets = sequelize.define('ticket', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    theatre: Sequelize.STRING,
    place: Sequelize.INTEGER,
    price: Sequelize.INTEGER,
    booked: Sequelize.INTEGER,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  const users = sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  const bookings = sequelize.define('booking', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bought: Sequelize.INTEGER,
    user: Sequelize.INTEGER,
    ticket: Sequelize.INTEGER,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
  return { tickets, users, bookings };
};

module.exports = ServiceAPI;
