var dbCon = require("../database/database-con.js");

module.exports.getData = function(req, res) {
  let query = "Select lea_target.*, operator_ids.operator_name as network_name from lea_target ";
  query += "left join operator_ids on operator_ids.operator_id = lea_target.network_id "
  query += " WHERE type='" + req.params.target_type + "' LIMIT 250 ";
  dbCon.query(query, [], res);

}

module.exports.getDropdownValues = async function(req, res) {
  let res_obj = {
    operators: {},
    usernames: {}
  };
  Promise.all([dbCon.getOperator(), dbCon.queryData("Select user_username from users", [])]).then(values => {
    res_obj.operators = values[0];
    res_obj.usernames = values[1];
    res.status(200).json(res_obj)
    //console.log(values);
  }).catch(function(err) {
    res.status(400).json("Error! cannot connect to database");
    return;
  });
}

module.exports.addData = async function(req, res) {

  let target_type = req.body.target_type;
  let subtype = req.body.subtype;
  let policy = req.body.policy;
  let subscriber_id = req.body.subscriber_id;
  let network_id = req.body.network_id;
  let active = req.body.active;
  let start_time = req.body.start_time;
  let end_time = req.body.end_time;
  let assigned_to = req.body.assigned_to;
  if (target_type == "Live Location Analysis" && subtype == "IP Address" && active == 1) {
    let query_location = "Insert into location_analysis ";
    query_location += "(public_ip)";
    query_location += " VALUES (?)";
    policy = dot2num(policy);
    let results = await dbCon.queryData(query_location, [policy]).then(function(value) {
      console.log("location analysis data added");
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
      return;
    });


  }

  //set data for log
  let obj = {};
  obj.username = req.body.username;
  obj.user_role = req.body.user_role;
  obj.action = "Added Data in Target Creation";
  obj.time = new Date();
  let query = "INSERT INTO lea_target ";
  query += "(type, subtype, policy, subscriber_id, network_id, active, start_time, end_time, assigned_to)";
  query += "VALUES (?,?,?,?,?,?,?,?,?)";
  let valuesArr = [target_type, subtype, policy, subscriber_id, network_id, active, start_time, end_time, assigned_to];

  dbCon.addData(query, valuesArr, res, obj)

}

function dot2num(dot) {
  var d = dot.split('.');
  return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
}
module.exports.updateData = function(req, res) {
  console.log(req.body);
  let target_id = req.body.target_id;
  let target_type = req.body.target_type;
  let subtype = req.body.subtype;
  let policy = req.body.policy;
  let subscriber_id = req.body.subscriber_id;
  let network_id = req.body.network_id;
  let active = req.body.active;
  let start_time = req.body.start_time;
  let end_time = req.body.end_time;
  let assigned_to = req.body.assigned_to;
  //set data for log
  let obj = {};
  obj.username = req.body.username;
  obj.user_role = req.body.user_role;
  obj.action = "Updated Data in Target Creation";
  obj.time = new Date();
  var query = "UPDATE lea_target set subtype=?, policy=?, subscriber_id=?, network_id=?, active=?, start_time=?, end_time=?, assigned_to=? WHERE  target_id= ?";
  var valuesArr = [subtype, policy, subscriber_id, network_id, active, start_time, end_time, assigned_to, target_id];
  dbCon.updateData(query, valuesArr, res, obj)
}
module.exports.addLocationAnalysisData = function(req, res) {
  let target_type = req.body.target_type;
  let subtype = req.body.subtype;
  let policy = req.body.policy;
  let active = req.body.active;
  let valuesArrLoc = [policy];
  console.log("test loc data", target_type, subtype, policy, active, valuesArrLoc)

  // if(active == 1 && subtype == "IP Address" && target_type == "Live Location Analysis"){
  //   let query_location = "Insert into location_analysis ";
  //   query += " (public_ip)";
  //   query_location += " VALUES (?)";

  //    dbCon.addLocationAnalysisData(query_location,valuesArrLoc,res , obj);


}


//}

module.exports.deactivateData = function(req, res) {

  let target_id = req.body.target_id;
  let active = 0;
  var query = "UPDATE lea_target set active=? WHERE  target_id= ?";
  var valuesArr = [active, target_id];
  let obj = {};
  obj.username = req.body.username;
  obj.user_role = req.body.user_role;
  obj.action = "Deactivated Data in Target Creation";
  obj.time = new Date();
  dbCon.updateData(query, valuesArr, res, obj)

}
// search data
module.exports.searchData = function(req, res) {
  console.log(req.body);
  let query = "Select * from lea_target ";
  //query+= "Select `source_ip from lea_target where send_time <='"+to_time+"' and send_time >= '"+from_time+"'";
  let where = "";
  let value_arr = [];
  let obj_keys = Object.keys(req.body);
  if (obj_keys.length != 0) {
    let key = obj_keys[0];
    where = "where " + key + " like \"%?%\" ";
    value_arr.push(req.body[key]);
    for (var x = 1; x < obj_keys.length; x++) {
      key = obj_keys[x];
      where += " AND " + key + " like \"%?%\" ";
      value_arr.push(req.body[key]);
    }
    query += where;
  }
  query += " LIMIT 250 ";
  dbCon.query(query, value_arr, res);
}
module.exports.assigned_to = function(req, res) {
  let query = "Select user_username from users";
  dbCon.query(query, [], res);
}
// module.exports.getNetworkValues = async function(req, res) {
//   let res_obj = {
//     operators: {}
//
//   };
//   Promise.all([dbCon.getNetworkIDs()]).then(values => {
//     res_obj.operators = values[0];
//     res.status(200).json(res_obj)
//     //console.log(values);
//   }).catch(function(err) {
//     res.status(400).json("Error! cannot connect to database");
//     return;
//   });
//
// }
