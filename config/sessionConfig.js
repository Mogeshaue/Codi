// const session = require("express-session");
// const connectPgSimple = require("connect-pg-simple");
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();
// const PgSession = connectPgSimple(session);

// module.exports = session({
//   store: new PgSession({
//     prisma: prisma,
//     tableName: "Session",
//   }),
//   secret: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 24 * 60 * 60 * 1000 * 10,
//     httpOnly: false,
//   },
// });
