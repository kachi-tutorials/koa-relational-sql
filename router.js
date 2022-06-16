const Router = require("koa-router");
const router = new Router();
const { addAttendee } = require("./controllers/attendee.controllers");
const { getEvent, addEvent } = require("./controllers/events.controllers");

router.get("/event=:eventId", getEvent);
router.post("/add_event", addEvent);
router.post("/add_attendee", addAttendee);

module.exports = router;
