const Koa = require("koa");
const App = new Koa();
const parser = require("koa-bodyparser");
const cors = require("@koa/cors");
const router = require("./router");
const port = 8000;

App.use(parser())
  .use(cors())
  .use(router.routes());

App.listen(port, () => {
  console.log(`🚀 Server listening http://127.0.0.1:${port}/ 🚀`);
});
