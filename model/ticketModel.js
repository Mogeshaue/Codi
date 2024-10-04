const { PrismaClient } = require("@prisma/client");
const { getUserById, findUserByEmail } = require("./userModel");
const prisma = new PrismaClient();

const createTicket = async (data) => {
  console.log(data,'data of create ticket')
  console.log(
    "ticket status: " + data.ticketStatus,
    "userId: " + data.userId,
  );
  console.log(data.userId,"user id to find the user");
 
  const user = await getUserById(parseInt(data.userId));
  console.log(user,"after finding the user using the id")
  if (!user) {
    throw new Error("User not found using the id");
  }

  const ticket = await prisma.ticket.create({
    data: {
      ticket_status: data.ticketStatus,
      date: new Date(),
      User: {
        connect: { user_id: user.user_id },
      },
      Bay: {
        connect: { bay_id: user.bay_id },
      },
      Transaction: {
        connect: { transaction_id: data.txnId },
      },
    },
  });

  console.log(ticket);
  return ticket;
};

const updateTicketStatus = async (ticketId, status) => {
  const updatedTicket = await prisma.ticket.update({
    where: {
      ticket_id: ticketId,
    },
    data: {
      ticket_status: status,
    },
  });
  console.log(`Ticket with id ${ticketId} updated to ${status}`);
  return updatedTicket;
};



module.exports = { createTicket, updateTicketStatus,  };
