const userModel = require("../model/userModel");

const createUser = async (req, res) => {
  try {
    if (req.isAuthenticated() && req.session.user) {
      const name = req.session.user._json.name;
      const email = req.session.user._json.email;
      const userData = { ...req.body, name, email };

      console.log("User Data for Ticket Creation:", userData);

      const newUser = await userModel.createUser(userData);
      console.log(newUser,"usercontroler for creating user");
      return res.status(200).json(newUser);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error in createuser:", error);
    return res.status(500).json({
      error: "Error occurred in creating a user or ticket",
      details: error.message,
    });
  }
};

const getAllUSers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      error: "Error occurred in fetching all users",
      details: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: "Error occurred in fetching user by id",
      details: error.message,
    });
  }
};

const findUserByEmail = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(req.bodyemail ,"email to find user",req.body,"req.body")
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found by find userbyemail in user controller" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: "Error occurred in fetching user by email",
      details: error.message,
    });
  }
};

const getUserDetailsByEmail = async (req, res) => {
  try {
    console.log(req.body.email);
      const { email } = req.body; 

      const userDetails = await ticketModel.getUserDetailsByEmail(email); 

      return res.status(200).json(userDetails); 
  } catch (error) {
      return res.status(500).json({
          error: "Error occurred in fetching user details",
          details: error.message,
      });
  }
};

module.exports = { createUser, findUserByEmail, getAllUSers, getUserById,getUserDetailsByEmail };
