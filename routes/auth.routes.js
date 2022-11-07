const controller = require("../controllers/auth.controller");
const bodyParser = require('body-parser');
const authJwt = require("../middlewares/authJwt");
var jsonParser = bodyParser.json()

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signin", jsonParser, controller.signin);

  app.get("/api/auth/checkToken", [authJwt.verifyToken], controller.checkToken);
};