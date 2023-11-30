const user = require("./controller-user");
const home = require("./controller-home");
const bank = require("./controller-bank");
const proposal = require("./controller-proposal");
const refData = require("./controller-reference");
const usererp = require("./controller-user-erp");
const programerp = require("./controller-program-erp");

module.exports = {
  user,
  home,
  bank,
  usererp,
  programerp,
  refData,
  proposal
};
