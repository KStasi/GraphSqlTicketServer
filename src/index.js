const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const ServiceAPI = require('./datasources/database');
const internalEngineDemo = require('./engine');
const isEmail = require('isemail');

const dataSources = () => ({
    serviceAPI: new ServiceAPI(),
});

// the function that sets up the global context for each resolver, using the req
const context = async ({ req }) => {
     // simple auth check on every request
     const email = (req.headers && req.headers.authorization) || '';
    
     // if the email isn't formatted validly, return null for user
     if (!isEmail.validate(email)) return { user: null };
     // find a user by their email
     const users = await dataSources().serviceAPI.store.users.findOrCreate({ where: { email } });
     const user = users && users[0] ? users[0] : null;
    
     return { user: { ...user.dataValues } };
};

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context,
    engine: {
        apiKey: process.env.ENGINE_API_KEY,
        ...internalEngineDemo,
    },
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
