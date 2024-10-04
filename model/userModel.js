const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUser = async (userData) => {
  try {
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      console.log("User already exists");
      return existingUser;
    }
    console.log("Creating new user...");
    const result = await prisma.User.create({
      data: {
        name: userData?.name,
        email: userData?.email,
        gender: userData?.gender || "MALE",
        contactNumber: userData?.contactNumber || "01",
        seating: "SEATING",
        transportNeed: userData?.transportNeeded ? true : false,
      },
    });
    console.log("User created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("User creation failed");
  }
};



const updateUser = async (userEmail, userData,bayReq) => {
  const existingUser = await findUserByEmail(userEmail.email);

  if (!existingUser) {
      throw new Error("User not found.");
  }

  const updatedUser = await prisma.User.update({
      where: {
          email: userEmail.email,
      },
      data: {
          name: userData.name || existingUser.name,
          email: userData.email || existingUser.email,
          gender: userData.gender || existingUser.gender,
          contactNumber: userData.contactNumber || existingUser.contactNumber,
          seating: userData.seating || existingUser.seating,
          transportNeed: typeof userData.transportNeeded !== 'undefined' ? userData.transportNeeded : existingUser.transportNeed,
          bay_id:bayReq || existingUser.bay_id
      },
  });

  return updatedUser;
};





// const updateUser = async (userEmail, updatedUserData) => {
//   const updatedUser = await prisma.User.update({
//     where: {
//       email: userEmail,
//     },
//     data :{
//       name: updatedUserData?.name,
//       email: updatedUserData?.email,
//       gender: updatedUserData?.gender || "MALE",
//       contactNumber: updatedUserData?.contactNumber ,
//       seating: updatedUserData?.seating || "SEATING",
//       transportNeed: updatedUserData?.transportNeeded? true : false,
//     }
//   });

//   console.log(user);
//   return updatedUser;
// };





const getAllUsers = async () => {
  return await prisma.User.findMany();
};

const getUserById = async (userId) => {
  return await prisma.User.findUnique({
    where: {
      user_id: userId,
    },
  });
};
const   findUserByEmail = async (email) => {
 
  console.log(email,"function of finding the user using this email");
  const user = await prisma.User.findFirst({
      where: {
          email: email, 
      },
  });
  console.log(user,"before return the user after finded the user in db")

  return user;
};

const getUserDetailsByEmail = async (email) => {
  const userDetails = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      Tickets: true, // Include the related tickets
    },
  });

  if (!userDetails) {
    throw new Error("User not found");
  }

  return userDetails;
};

module.exports = { createUser, findUserByEmail, getUserById, getAllUsers ,updateUser,getUserDetailsByEmail};
