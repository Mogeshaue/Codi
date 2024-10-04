const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createTransaction = async (data) => {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        transaction_status: data.transactionStatus,
        transaction_amount: parseFloat(data.amount),
        transaction_id: data.txnId,
        mode: data.mode || "ONLINE",
        date: new Date(),
        user: {
          connect: {
            user_id: data.userId,
          },
        },
      },
    });

    
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
};

const updateTransaction = async (txnid, status) => {
  try {
    const updatedTransaction = await prisma.transaction.update({
      where: {
        transaction_id: txnid,
      },
      data: {
        transaction_status: status,
      },
    });
    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Failed to complete(update) transaction");
  }
};

const getTransactionByTxnId = async (txnId) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      transaction_id: txnId,
    },
  });
  return transaction;
};

module.exports = {
  createTransaction,
  getTransactionByTxnId,
  updateTransaction,
};
