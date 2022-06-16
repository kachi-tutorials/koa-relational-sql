const { createAttendee } = require("../helpers/attendee.helpers");

const addAttendee = async (ctx) => {
  try {
    ctx.body = await createAttendee(ctx.request.body);
    ctx.status = 201;
  } catch (err) {
    console.log(err);
    ctx.body = "Error!";
    ctx.status = 500;
  }
};

module.exports = {
  addAttendee,
};
