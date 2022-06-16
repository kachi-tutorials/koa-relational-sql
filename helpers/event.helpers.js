const { event } = require("../prisma");
const { findUnique, create } = event;

const findEvent = async (eventId) => {
  try {
    const correctEvent = await findUnique({
      where: { eventId },
      include: { attendee: true },
    });

    return correctEvent;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createEvent = async (input) => {
  try {
    await create({ data: input });

    const newEvent = await findEvent(input.eventId);

    return newEvent;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  createEvent,
  findEvent,
};
