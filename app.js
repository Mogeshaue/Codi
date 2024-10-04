const express = require("express");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const session = require("express-session");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
const PrismaStore = require("./prismaSessionStore");
const connectPgSimple = require("connect-pg-simple");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();
const bayController = require("./controller/bayController");
const bayModel = require("./model/bayModel");
const bayRoutes = require("./routes/bayRoutes");
const cookieParser = require("cookie-parser");
const userController = require("./controller/userController");
const ticketModel = require("./model/ticketModel");
const userModel = require("./model/userModel");
const paymentController = require("./model/paymentController");
const transactionModel = require("./model/transactionModel");
require("dotenv").config();

const app = express();
const port = 8000;
const prisma = new PrismaClient();
const PgSession = connectPgSimple(session);
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8000"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  store: new PgSession({
    prisma: prisma,
    tableName: "Session",
  }),
  secret: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 * 10,
    priority: "high",
    httpOnly: false,
  },
});

app.use(sessionMiddleware);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
// app.use(
//   session({
//     secret: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: new PrismaStore(prisma),
//     cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
//   })
// );

const tenant = process.env.SOCIAL_AUTH_AZUREAD_TENANT_OAUTH2_TENANT_ID;

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_KEY,
      clientSecret: process.env.SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET,
      responseType: "code",
      responseMode: "form_post",
      redirectUrl: "http://localhost:8000/",
      allowHttpForRedirectUrl: true,
      passReqToCallback: false,
      scope: ["profile", "email", "openid"],
      loggingLevel: "info",
    },
    function (iss, sub, profile, accessToken, refreshToken, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// app.get("/login", passport.authenticate("azuread-openidconnect"));
app.get(
  "/login",
  cors(corsOptions),
  passport.authenticate("azuread-openidconnect")
);

app.get("/getUserDetails", (req, res) => {
  if (req.isAuthenticated() && req.session.user) {
    console.log(req.session.user,"user sessions to get user details");
    return res.status(200).json(req.session.user);
  } else {
    return res.status(401).json({ error: "User not authenticated" });
  }
});

app.post("/", passport.authenticate("azuread-openidconnect", { failureRedirect: "/" }), async (req, res) => {
  if (!req.session) {
    return res.status(500).json({ error: "Session not initialized" });
  }
  req.session.user = req.user;

  const userData = req.user._json;

  // Check if the user exists, and create if not
  let userExistence;
  try {
    userExistence = await userModel.findUserByEmail(userData.email);
    if (!userExistence) {
      const response = await userModel.createUser(userData);
      console.log("User created: ", response);
    } else {
      console.log("User already exists: ", userExistence);
    }
  } catch (error) {
    console.error("Error in user creation flow:", error.message);
    return res.status(500).json({ error: "User creation failed" });
  }

  req.session.save((err) => {
    if (err) {
      console.error("Error saving session:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Session saved:", req.session);
    res.redirect("http://localhost:3000/jananam");
  });
});


app.post("/createTicket", userController.createUser);

app.post("/getUser", async (req, res) => {
  try {
    console.log(req.body.email,"get the user forticket req body.email");
    const email = req.body.email;

    const userDetails = await userModel.getUserDetailsByEmail(email);

    return res.status(200).json(userDetails);
  } catch (error) {
    return res.status(500).json({
      error: "Error occurred in fetching user details",
      details: error.message,
    });
  }
});

app.get("/", async (req, res) => {
  console.log(req,"data to create the user ")
  if (req.isAuthenticated()) { 
    if (req?.user) {
      const userData = req.user._json;
      console.log(userData,"json for create user")
      const userExistence = await userModel.findUserByEmail(
        req.user._json.email
      );
      if (!userExistence) {
        const response = await userModel.createUser(userData);
        console.log(response,"response form user existance");
      }
      // }
      // const response = await userModel.createUser(userData);
      // console.log(response);
    }

    res.redirect("http://localhost:3000/jananam");
    console.log(`displaying the name  ${req.user.displayName}!`);
  } else {
    res.redirect("http://localhost:3000/");
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// seperate for payment

//jskjfk

app.use("/api", bayRoutes);

app.get("/check", (req, res) => {
  if (req.isAuthenticated()) {
    console.log( req.user,"check whether the user is authenticated or not from check endpoint")
    res.json({ user: req.user });
  } else {
    res.json({ error: "Not authenticated" });
  }
});
app.post("/payment-success", async (req, res) => {
  const paymentData = req.body;
  console.log(req,"/payment req body")

  console.log("Payment Data by on click the cnf and book -btn:", paymentData);
  // res.redirect("http://localhost:3000/ticket");

  const result = await paymentController.handlePaymentSuccess(paymentData);
  console.log(result,"result sucess payment data")
  console.log(result.error,"result error")

  if (result.success) {
    res.redirect("http://localhost:3000/ticket",);
    console.log("redirecte to success")
  } else {
    res
      .status(500)
      .json({ message: "Error processing payment", error: result.error });
  }
});

app.post("/payment-failure", async (req, res) => {
  const paymentData = req.body;
  const result = await paymentController.handlePaymentFailure(paymentData);

  if (result.success) {
    res.redirect("http://localhost:3000/Failure");
  } else {
    res.status(500).json({
      message: "Error processing payment failure",
      error: result.error,
    });
  }
});

app.post("/failure", async (req, res) => {
 
  const data = req.body;
  console.log("cnf-to check failure data for failure ",data);
  console.log(data);
  res.json({ message: "Payment" });
});

app.get("/getBays", async (req, res) => {
  try {
    console.log("cheking the bays ");
    const boysBays = await bayModel.getBayByType("MALE");
    const girlsBays = await bayModel.getBayByType("FEMALE");

    res.status(200).json({ boysBays, girlsBays });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching bays", details: error.message });
  }
});

const merchantKey = process.env.PAYU_MERCHANT_KEY;
const merchantSalt = process.env.PAYU_MERCHANT_SALT;
app.post("/createTicket", async (req, res) => {
  const data = await req.body;
});
function sha512(str) {
  return crypto.createHash("sha512").update(str).digest("hex");
}

function generatePayUHash(params) {
  const salt = process.env.PAYU_MERCHANT_SALT;
  let hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;
  return sha512(hashString);
}

app.post("/Message", async (req, res) => {
  const auth = {
    username: process.env.MessageSendusername,
    password: process.env.MessageSendpassword,
  };
  const { email, message } = req.body;

  const messageData = {
    email: email,
    message: message,
    contentType: "html",
  };

  try {
    const response = await axios.post(
      "http://10.1.76.75:20000/send/",
      messageData,
      { auth }
    );

    if (response.status === 200) {
      return res
        .status(200)
        .json({ success: true, message: "email sent successfully!" });
    } else {
      return res
        .status(response.status)
        .json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error forwarding email:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error sending email. Please try again.",
      });
  }
});

app.post("/payment", async (req, res) => {
  console.log(req.body, "after hitting the payment user data");
  const userDataToUpdate = req.body;
  console.log(userDataToUpdate,"user date to update")
  
  const bayReq = await bayModel.getBayIdByAmountAndGender(
    userDataToUpdate.amount,
    userDataToUpdate.gender
  );


  console.log(bayReq, "after getting bay id -form db");

  console.log(req.user._json,"json from when clik payment-btn then upated ");
  const userEmail = req.user._json.email;
  console.log(typeof userEmail,"user email after upt db");
  const user = await userModel.findUserByEmail(userEmail);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const updatedUser = await userModel.updateUser(user, userDataToUpdate,bayReq);
  console.log(updatedUser, "updated user");
  // const transactionResult = await transactionModel.createTransaction()

  const utcNow = new Date();

  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
  let paymentDate = new Date(utcNow.getTime() + istOffset);

  const octoberStart = new Date("2024-10-01T00:00:00Z"); // October 1, 2024, 00:00:00 UTC
  const octoberEnd = new Date("2024-10-03T23:59:59Z"); // October 3, 2024, 23:59:59 UTC

  let ticketAmount = userDataToUpdate.amount;

  if (paymentDate >= octoberStart && paymentDate <= octoberEnd) {
    ticketAmount = ticketAmount - 50;
  }

  console.log("Payment Date (IST):", paymentDate);
  console.log("Ticket Amount:", ticketAmount);

  console.log(ticketAmount, "early bird price");

  const totalAmount = ticketAmount;
  const txnid = new Date().getTime().toString();

  const hash = generatePayUHash({
    key: process.env.PAYU_MERCHANT_KEY,
    txnid,
    amount: totalAmount,
    productinfo: "Test Product",
    firstname: "Anbarasan",
    email: updatedUser.email,
  });
  console.log(hash,"hash using first name email")

  const paymentData = {
    key: process.env.PAYU_MERCHANT_KEY,
    txnid,
    hash,
    amount: totalAmount,
    productinfo: "Test Product",
    firstname: "Anbarasan",
    email:   updatedUser.email,
    phone: "8056901611",
    surl: "http://localhost:8000/payment-success",
    furl: "http://localhost:8000/payment-failure",
  };

  // res.json(paymentData,"payment data ");
  res.status(200).json(paymentData);
});

app.post("/initiate-payment", async (req, res) => {
  console.log(req.body)
  const { paymentData } = req.body;

  console.log(paymentData, "after initaiate payment the payment data rq.body");
  const user = await userModel.findUserByEmail(paymentData.email);
  const txnId = req.body.paymentData.txnid;
  const amount = req.body.paymentData.amount;
  const transactionStatus = "PROCESSED";
  const userId = user.user_id;

  const data = {
    txnId,
    amount,
    transactionStatus,
    userId,
  };
  const transactionResponse = await transactionModel.createTransaction(data);

  console.log(transactionResponse, "Transaction created after retyrn");

  const payUForm = `
    <form method="POST" action="https://test.payu.in/_payment">
        <input type="hidden" name="key" value="${paymentData.key}">
        <input type="hidden" name="txnid" value="${paymentData.txnid}">
        <input type="hidden" name="amount" value="${paymentData.amount}">
        <input type="hidden" name="productinfo" value="${paymentData.productinfo}">
        <input type="hidden" name="firstname" value="${paymentData.firstname}">
        <input type="hidden" name="email" value="${paymentData.email}">
        <input type="hidden" name="phone" value="${paymentData.phone}">
        <input type="hidden" name="surl" value="${paymentData.surl}">
        <input type="hidden" name="furl" value="${paymentData.furl}">
        <input type="hidden" name="hash" value="${paymentData.hash}">
    </form>
    <script>
        document.forms[0].submit();
    </script>
  `;

  res.send(payUForm);
});

app.post("/generate-hash", (req, res) => {
  const { amount, productinfo, firstname, email } = req.body;

  if (!amount || !firstname || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const txnid = new Date().getTime().toString();

  const hash = generatePayUHash({
    txnid,
    amount,
    productinfo,
    firstname,
    email,
  });

  res.json({
    key: merchantKey,
    txnid,
    hash,
    amount,
    productinfo,
    firstname,
    email,
  });
});


app.post("/createBay", (req, res) => {
  const data = req.body;
  console.log(data);
  bayModel.createBay(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
