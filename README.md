# KOA relational SQL Server

In this part, we'll be starting from where we left off in part 1.

We'll be creating another SQL database server, but this database will be have relational data.

Let's make sure we have [**Postgres**](https://postgresapp.com/downloads.html) installed before we continue:

```bash
psql --version
```

## Setup

To create our relational database, we'll be using **Prisma** with **Postgres**. So let's start by installing **prisma** using the following command:

```bash
npm install prisma --save-dev
```

Now that we've installed prisma, let's initiate it by running the following command:

```bash
npx prisma init
```

This should create the following:

1. A **_prisma_** folder containing a **_schema.prisma_** file
2. A **_.env_** file containing the following code:

```env
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

To connect to our postgres server we will need to update the link in the **.env** file. So let's replace it with the following:

```env
DATABASE_URL="postgresql://USER:PASSWORD@@localhost:5432/koa_prisma_tutorial?schema=public"
```

The credentials are as follows:

1. **USER**:**PASSWORD** should be your credentials.
2. **@localhost:5432** is the default port for postgres, if you are using another port, you can edit this accordingly.
3. **koa_prisma_tutorial** is the database we'll be creating to store our data, but feel free to name it whatever you want.

Let's now move onto creating our models.

## Models

Now navigate to your **schema.prisma** file in the **prisma** folder and add the following code:

```javascript
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Event {
  name            String
  description     String
  total_attendees Int        @default(0)
  adultsOnly      Boolean    @default(false)
  eventId         String     @unique
  attendee        Attendee[]
}

model Attendee {
  attendeeId String @unique
  name       String
  eventId    String
  event      Event? @relation(fields: [eventId], references: [eventId])
}
```

### What did we just do?

We added two models to our prisma an **event** model and an **attendee** model which are relational.

Note, each object in a given model must have a unique value.

Let's break down each model:

### Event

Each event in our database will follow this template.

- **name** - name of our event represented by a string.
- **description** - description of our event represented by a string.
- **total_attendees** - this field is an integer representing the number of event attendees. The default value will be 0.
- **adultsOnly** - boolean field representing if it's an adults only event, The default value will be false.
- **eventId** - this string value represnting our event Id, this will be our unique value for our event model.
- **attendee** - this will be our relational field which returns all corresponding attendees related to given event.

### Attendee

Each attendee in our database will follow this template.

- **attendeeId** - this string value represnting our attendee's Id, this will be the unique value for our attendee model.
- **name** - name of an attendee represented by a string.
- **eventId** - this field must contain the value of an existing model which will use to reference our other model, in our case it's the eventId from our event model.
- **event** - this represents our relation to another model. The **fields** refers to the field from this model and **references** is field that matches the **fields** from this model. This field will not be displayed when our data is rendered.

Now we've added our models!

Next, we need to migrate our changes. Each migration will need a unique name, we'll call this migration **init**,

Let's start our migration by running the following command:

```bash
npx prisma migrate dev --name init
```

Now we've migrated our changes, we can connect to our **prisma studio**.

## Prisma Studio and Client

**Prisma Studio** is an interface that allows you to add data manually without using your endpoints or SQL commands.

Try it out by running the following command via your terminal:

```bash
npx prisma studio
```

Let's now create a prisma client for our Koa server to access by running the following commands:

```bash
npx prisma generate
touch prisma/index.js
```

These commands will create an **index.js** file inside your **prisma** folder.

Now let's add the following code to the that **index.js** file.

```javascript
const { PrismaClient } = require("@prisma/client");

const Prisma = new PrismaClient();

module.exports = Prisma;
```

Our prisma client is now up and running, it's time to start making full use of it.

## Helpers

To avoid clutter in our controllers, we'll be creating helper functions.

Let's run the following commands:

```bash
mkdir helpers
touch helpers/attendee.helpers.js helpers/event.helpers.js
```

This should create a folder named **helpers** with two files named **attendee.helpers.js** and **event.helpers.js**.

### Attendee Helpers

Let's first edit the **attendee.helpers.js** file, add the following code:

```javascript
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
      data: { total_attendees: count.length },
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
```

What have we just done?

1. We've imported **event** and **attendee** from our Prisma client
2. Added three attendee helper functions (**createAttendee**, **updateAttendees** and **findAttendee**),
3. Made functions async. So if any errors arise, our code will detect the error.
4. Exported the helper functions we've just made.

So what functions did we create?

### createAttende

This function creates an attendee and update the corresponding event. Here's how it works:

1. Firstly, we call our attendee prisma model and use the create function to create an attendee based on the input body (which will later be our post request).
2. Next, We'll use the eventId (from the object in our post request) and our **updateAttendees** function (which we will discuss next) to update our event accordingly.
3. Finally, We'll use the attendeeId (from the object in our post request) and our findAttendee function (which we'll later discuss) to find our new attendee and return them.

### findAttendee

This function will find return the correct attendee. Here's how it works:

1. We'll call our attendee prisma model
2. Use the findUnique function to find and return the correct attendee.

Note: The findUnique only works on values marked **@unique** in our model, in this case it'll only work on our **attendeeId**.

### updateAttendees

This function will update our total_attendees in a given event. Here's what happens:

1. Firstly, given an **eventId** (which will passed down to this function from the request body), We'll use the findMany function from our attendees model and find all attendees who match the **eventId**.
2. Next we'll call the **update** function from the attendees model to find the event with the **eventId**.
3. Finally, We'll pass the field we'd like to update (in this case is **total_attendees**) and we'll update it with the length of our attendee results array.

### Event Helpers

Now let's edit the **event.helpers.js** file by adding the following code.

```javascript
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
```

What have we just done? We've added two event helper functions **createEvent** and **findEvent**.

### findEvent

This helper finds an event based on eventId. Here's how it works:

1. First we'll pass an eventId through the params or body of our request
2. Next, we'll call our prisma event model and find the unique event based on the eventId
3. Lastly, we'll declare an **include**. Include enables us to return all values which match our eventId from another model. In this case, it's our attendee model so we set this to true.

### createEvent

This helper creates a new event and returns the new event to us.

1. First we'll take the request body from a post request and pass it through our the create function of our prisma event model.
2. Next we'll take the eventId from the request body and find the event we just created.
3. Lastly, we'll return the event we just created.

That's all of our controllers!

Now we've created our helper functions, let's update our controllers.

## Controllers

Before we continue, let's first create a controllers file for our attendees:

```bash
touch controllers/attendee.controllers.js
```

Now let's add the following code to our **attendee.controllers.js** file:

```javascript
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
```

This controller will be used to add new attendees by passing data through the request body.

Now let's edit the code in our **event.controllers.js** file

```javascript
const { createEvent, findEvent } = require("../helpers/event.helpers");

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
```

These update will enable us to:

1. **addEvent** - add new events by passing data through the request body.
2. **getEvent** - get existing events by passing the eventId through our request params (url).

Finally, we need to update our router:

```javascript
const Router = require("koa-router");
const router = new Router();
const { addAttendee } = require("./controllers/attendee.controllers");
const { getEvent, addEvent } = require("./controllers/events.controllers");

router.get("/event=:eventId", getEvent);
router.post("/add_event", addEvent);
router.post("/add_attendee", addAttendee);

module.exports = router;
```

We've renamed some of our enpdpoints and controllers. We've also introduced a params into our url.

Params are arguments that can be passed through a url by following "**:**", in our case we're using **:eventId**. We can access the params from our controller using **ctx.request.params**, in our case we'll it's **ctx.request.params.eventId**.

### Request

Let's run our server and test all of our endpoints. Due to the way database is designed, we will need to follow this order:

1. Firstly add an event
2. Then add an event attendee / get an event

Without an Event, we can't add an attendee as they require an **eventId**.

Needless to say we also can't get an event if it hasn't been added.

Time to test our endpoints, let's start our server:

```bash
node index.js
```

Now let's add our first event using our endpoint.

Let's add this data using a post request to the following endpoint [**http://127.0.0.1:8000/add_event**](http://127.0.0.1:8000/add_event):

```json
{
  "name": "Test Event",
  "description": "Test Event Description",
  "eventId": "id:12345"
}
```

A successful **request** should return the following **response**:

```json
{
  "name": "Test Event",
  "description": "Test Event Description",
  "total_attendees": 0,
  "adultsOnly": false,
  "eventId": "id:12345",
  "attendee": []
}
```

Now let's add an attendee through a post request to [**http://127.0.0.1:8000/add_attendee**](http://127.0.0.1:8000/add_attendee):

```json
{
  "attendeeId": "id:98756",
  "name": "New User",
  "eventId": "id:12345"
}
```

A successful **request** should return the data you just passed through the body.

Now let's get the event we've just created [**http://127.0.0.1:8000/event=id:12345**](http://127.0.0.1:8000/event=id:12345):

```json
{
  "name": "Test Event",
  "description": "Test Event Description",
  "total_attendees": 1,
  "adultsOnly": false,
  "eventId": "id:12345",
  "attendee": [
    {
      "attendeeId": "id:98756",
      "name": "New User",
      "eventId": "id:12345"
    }
  ]
}
```

And there we have it! A relational prisma database!

## Prisma Tips

Each time you add or remove fields from your models remember to run the following command:

```bash
npx prisma migrate dev --name UPDATENAME
```

You can also add data to your database using prisma studio by running the following command:

```bash
npx prisma studio
```
