const { createEvent, findEvent } = require("../helpers/events.helpers");

const getEvent = async (ctx) => {
  try {
    ctx.body = await findEvent(ctx.request.params.eventId);

    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = "Error!";
  }
};

const addEvent = async (ctx) => {
  try {
    ctx.body = await createEvent(ctx.request.body);

    ctx.status = 201;
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = "Error!";
  }
};

module.exports = {
  getEvent,
  addEvent,
};
