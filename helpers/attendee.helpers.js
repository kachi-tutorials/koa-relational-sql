const { event, attendee } = require("../prisma");

const createAttendee = async (input) => {
  const { attendeeId, eventId } = input;
  try {
    await attendee.create({ data: input });

    updateAttendees(eventId);

    const newAttendee = await findAttendee(attendeeId);

    return newAttendee;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const findAttendee = async (input) => {
  try {
    const correctAttendee = await attendee.findUnique({
      where: { attendeeId: input },
    });

    return correctAttendee;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateAttendees = async (eventId) => {
  try {
    const count = await attendee.findMany({
      where: { eventId },
    });

    await event.update({
      where: { eventId },
      data: { totalAttendees: count.length },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  createAttendee,
  updateAttendees,
  findAttendee,
};
