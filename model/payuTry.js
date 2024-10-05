// import dotenv from "dotenv";
// import crypto from "crypto";
// import fetch from "node-fetch";
// import zlib from "zlib";
// dotenv.config();

// const merchantKey = process.env.PAYU_MERCHANT_KEY;
// const salt = process.env.PAYU_MERCHANT_SALT;
// const authorization = process.env.PAYU_AUTHORIZATION;

// if (!merchantKey || !salt || !authorization) {
//   throw new Error(
//     "Missing PAYU_MERCHANT_KEY, PAYU_MERCHANT_SALT, or PAYU_AUTHORIZATION"
//   );
// }

// const apiEndpoint = "https://test.payu.in/_payment";

// // Generate hash for PayU payment
// function generateHash(params, salt) {
//   let hashString =
//     params["key"] +
//     "|" +
//     params["txnid"] +
//     "|" +
//     params["amount"] +
//     "|" +
//     params["productinfo"] +
//     "|" +
//     params["firstname"] +
//     "|" +
//     params["email"] +
//     "||||||" + // user-defined fields (udf1-udf5) if required by PayU API
//     salt;

//   return sha512(hashString);
// }

// // Hashing function
// function sha512(str) {
//   return crypto.createHash("sha512").update(str).digest("hex");
// }

// // POST request to PayU API
// export const payuRequest = async (req, res) => {
//   const amount = "100.00";
//   const productInfo = "Test Product";
//   const firstName = "John";
//   const email = "john@example.com";
//   const phone = "9999999999";
//   const txnId = "TXN" + Date.now();
//   const surl = "https://yourwebsite.com/payment-success";
//   const furl = "https://yourwebsite.com/payment-failure";

//   const params = {
//     key: merchantKey,
//     txnid: txnId,
//     amount: amount,
//     productinfo: productInfo,
//     firstname: firstName,
//     email: email,
//     phone: phone,
//     surl: surl,
//     furl: furl,
//   };

//   const hash = generateHash(params, salt);
//   params["hash"] = hash;

//   try {
//     const payuResponse = await fetch(apiEndpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization: `Bearer ${process.env.PAYU_AUTHORIZATION}`,
//       },
//       body: new URLSearchParams(params),
//     });

//     console.log("PayU Response Status:", payuResponse.status);
//     console.log("Response Headers:", payuResponse.headers.raw());

//     if (!payuResponse.ok) {
//       const errorResponse = await payuResponse.text();
//       return res
//         .status(payuResponse.status)
//         .json({ message: "PayU request failed", error: errorResponse });
//     }

//     const arrayBuffer = await payuResponse.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Log the raw buffer as hex
//     console.log("Raw Response Buffer:", buffer.toString("hex"));

//     // Check if the response is gzip compressed
//     const contentEncoding = payuResponse.headers.get("content-encoding");
//     let responseBody;

//     if (contentEncoding && contentEncoding.includes("gzip")) {
//       // Use gunzip to handle decompression asynchronously
//       zlib.gunzip(buffer, (err, result) => {
//         if (err) {
//           console.error("Error decompressing response:", err);
//           return res
//             .status(500)
//             .json({
//               message: "Failed to decompress response",
//               error: err.message,
//             });
//         }
//         responseBody = result.toString("utf-8");
//         console.log("Decompressed Response Body:", responseBody);
//         res.status(200).send(responseBody);
//       });
//     } else {
//       responseBody = buffer.toString("utf-8");
//       console.log("Response Body:", responseBody);
//       res.status(200).send(responseBody);
//     }
//   } catch (error) {
//     console.error("Error in payuRequest:", error); // Log the error for debugging
//     if (res) {
//       res
//         .status(500)
//         .json({ message: "Internal Server Error", error: error.message });
//     } else {
//       console.error(
//         "Response object is undefined, cannot send error response."
//       );
//     }
//   }
// };
