var dbCon = require("../database/database-con.js");

module.exports.getData = function(req, res) {
    let table_name = req.table_name;
    let query = "Select * from log";
    query += " order by time desc  LIMIT 250 ";
    dbCon.query(query, [], res);
  }
  module.exports.getDataByRange = function(req, res) {
    let query_type = req.body.query_type;
    let start_time = req.body.start_time;
    let end_time = req.body.end_time;
    let query = "Select * from log ";

    // if (query_type == "commulative") {
    //   query = commulative_query;
    // } else if (query_type == "bandwidth_util"){
    //   query = bandwidth_util;
    // } else if (query_type == "bandwidth_protocol"){
    //   query = bandwidth_protocol;
    // }

    query += " where Start_time >= " + start_time;
    query += " AND End_time <= " + end_time;
    query += " LIMIT 250";
    dbCon.query(query, [], res);
  }

// search data
module.exports.searchData = function(req,res){
  let query="Select * from log ";
 let username=req.body.username;
 let action=req.body.action;
 query+="where username like \"%?%\" AND action like \"%?%\" ";
 query+= "LIMIT 250";
  dbCon.query(query, [username,action], res)
}
module.exports.getusername = function(req,res){
  let query= "Select user_username from users";
  dbCon.query(query, [], res);
   }
// insert data
module.exports.addData = function(req, res) {
  let obj = {};
  obj.username = req.body.username;
  obj.user_role = req.body.user_role;
  obj.action = req.body.action;
  obj.time = new Date();
  console.log(obj);
  dbCon.addLog(obj)

}
