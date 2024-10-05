// const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
// const userModel = require("../models/userModel");

// module.exports = (passport) => {
//   const tenant = process.env.SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_TENANT_ID;

//   passport.use(
//     new OIDCStrategy(
//       {
//         identityMetadata: `https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`,
//         clientID: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_KEY,
//         clientSecret: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET,
//         responseType: "code",
//         responseMode: "form_post",
//         redirectUrl: "http://localhost:8000/",
//         allowHttpForRedirectUrl: true,
//         scope: ["profile", "email", "openid"],
//         loggingLevel: "info",
//       },
//       function (iss, sub, profile, accessToken, refreshToken, done) {
//         return done(null, profile);
//       }
//     )
//   );

//   passport.serializeUser(function (user, done) {
//     done(null, user);
//   });

//   passport.deserializeUser(function (obj, done) {
//     done(null, obj);
//   });
// };
