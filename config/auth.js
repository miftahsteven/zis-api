const { verify } = require("../app/helper/auth-jwt");
const ApiError = require("../app/helper/api-error");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

const authentication = (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (headerToken) {
      const token = headerToken.split(" ")[1];
      const payload = verify(token);
      req.user = payload;
      req.user_id = payload.user_id;
      return next();
    }
    //throw ApiError.badRequest("Login Ulang !");
    return res.status(401).send({
      success: false,
      message: "ERROR : ANDA HARUS LOGIN ULANG",
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).send({
        success: false,
        code: 101,
        message: "ERROR : LOGIN EXPIRED",
      });
    }
    if (error instanceof JsonWebTokenError) {
      console.log("error", error.message);
      // res.send({
      //   success: false,
      //   code: 101,
      //   message: "ERROR : LOGIN EXPIRED",
      // });
    }
  }
};

const authorization =
  (...roles) =>
  (req, res, next) => {
    // console.log(req.user.role);
    // console.log(roles);
    const userRoles = req.user.role.split(",");
    const userRolesArray = [];
    for (i = 0; i < userRoles.length; i++) {
      userRolesArray.push(userRoles[i]);
      // console.log(userRoles[i]);
    }
    const intersection = roles.filter((element) => userRolesArray.includes(element));
    // console.log(intersection);
    // if (roles.includes(intersection)) {
    if (intersection.length > 0) {
      next();
    } else {
      next(ApiError.forbidden("forbidden !"));
    }
  };

module.exports = {
  authentication,
  authorization,
};
