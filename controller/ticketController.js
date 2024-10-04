const ticketModel = require("../model/ticketModel");

const createTicket = async (req, res) => {
    try {
        const { numberOfTickets, ticketStatus, userId, bayId } = req.body;
        console.log(numberOfTickets, ticketStatus, userId, bayId,"data for create ticket,no of ticket,status,userid,bayid")

        // Create tickets in a loop
        const tickets = [];
        for (let i = 0; i < numberOfTickets; i++) {
            const newTicket = await ticketModel.createTicket(userId, bayId, ticketStatus);
            tickets.push(newTicket);
        }

        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({
            error: "Error occurred in creating tickets",
            details: error.message,
        });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const { newStatus } = req.body;
        const updatedTicket = await ticketModel.updateTicketStatus(ticketId, newStatus);
        return res.status(200).json(updatedTicket);
    } catch (error) {
        return res.status(500).json({
            error: "Error occurred in updating a ticket",
            details: error.message,
        });
    }
};




module.exports = { createTicket, updateTicketStatus, };