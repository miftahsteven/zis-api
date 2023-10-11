const jwt = require("jsonwebtoken");
const secret_key = "8888insyaAllahSukses";

const generate = (payload, expired) => {
  let token = null;
  if (expired !== null) {
    token = jwt.sign(payload, secret_key, {
      expiresIn: '1h',
      algorithm: "HS256",
      issuer: "z3r0bytes",
      audience: [payload.username],
    });
  } else {
    token = jwt.sign(payload, secret_key, {
      expiresIn: '1h',
      algorithm: "HS256",
      issuer: "z3r0bytes",
      audience: [payload.username],
    });
  }
  return token;
};

const verify = (token) => {
  return jwt.verify(token, secret_key);
};

module.exports = {
  generate,
  verify,
};
