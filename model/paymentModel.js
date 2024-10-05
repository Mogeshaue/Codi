// const crypto = require("crypto");

// function sha512(str) {
//   return crypto.createHash("sha512").update(str).digest("hex");
// }

// module.exports = {
//   generatePayUHash: (params) => {
//     const salt = process.env.PAYU_MERCHANT_SALT;
//     let hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;
//     return sha512(hashString);
//   },
// };
