//import { PrismaClient} from '@prisma/client';
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createBay = async (data) => {
  const bay = await prisma.bay.create({
    data: {
      total_count: data.total_count,
      available: data.available,
      amount_of_ticket: data.amount_of_ticket,
      bay_type: data.bay_type,
      bay_name: data.bay_name,
    },
  });
  console.log(bay,"after cereating the user");

  return bay;
};

const getAllBay = async () => {
  const bay = await prisma.bay.findMany();
  return bay;
};

const getBayIdByAmountAndGender = async (amount, gender) => {
  console.log(amount,gender)
  const bay = await prisma.bay.findFirst({
    where: {
      amount_of_ticket: amount,
      bay_name: gender === "MALE" ? { in: ["MALE"] } : { in: ["FEMALE"] }, // Use enum values
    }
  });
  console.log(bay,"bay ater updating the gender and amt in fun get ammtnad gen")

  if (bay) {
    return bay.bay_id;
  } else {
    throw new Error("Bay not found for the given amount and gender");
  }
};

const getBayIdByGender = async (gender) => {

  const bay = await prisma.bay.findMany({
    where: {
      gender: gender,
    },
  });
};

const updateBayAvailability = async (bayId, availableCount) => {
  const newAvailableCount = availableCount - 1;

  if (newAvailableCount < 0) {
    throw new Error("New available count cannot be negative");
  }

  // const previousAvailableCount = await

  const bay = await prisma.bay.update({
    where: { bay_id: parseInt(bayId) },
    data: { available: newAvailableCount },
  });
  return bay;
};

const getIndividualBayById = async (bayId) => {
  const bay = await prisma.bay.findFirst({
    where: {
      bay_id: parseInt(bayId),
    },
  });

  return bay;
};

const getBayByType = async (bayType) => {
  const bay = await prisma.bay.findMany({
    where: {
      bay_type: bayType,
    },
  });

  return bay;
};

module.exports = {
  createBay,
  getAllBay,
  getIndividualBayById,
  getBayByType,
  updateBayAvailability,
  getBayIdByAmountAndGender,
  getBayIdByGender
};
