var dbCon = require("../database/database-con.js");

module.exports.authenticateUser = function(req, res) {
  let table_name = req.table_name;
  let username = req.body.username;
  let password = req.body.password;
  let query = "Select * from users";
  query += " where User_UserName = ? AND User_Password = ?"
  let valuesArr = [username, password];
  dbCon.authenticate(query, valuesArr, res);
}
