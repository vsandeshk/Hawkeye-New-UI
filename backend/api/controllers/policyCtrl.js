var dbCon = require("../database/database-con.js");

module.exports.getData = function(req, res) {
  let query = "Select * from policies "
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);
}

module.exports.getExistingPolicyData = function(req, res) {
  let policy_type = req.params.policy_type;
  let query = "Select * from policies";
  if (policy_type == "all") {
    query += "";
  } else if (policy_type == "all_active") {
    query += " where active = 1";
  } else if (policy_type == "all_inactive") {
    query += " where active = 0";
  } else if (policy_type == "all_inactive") {
    query += " where active = 0";
  } else if (policy_type == "category_expanded") {
    query = " Select url,access_count,last_accessed,category1,category2,category3 from dns where blocked = 1 order by access_count desc";
  } else {
    query += ` where type = '${policy_type}'`;
  }
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);
}

module.exports.getPolicyData = function(req, res) {
  let policy_type = req.params.policy_type;
  let query = "Select * from policies"
  query += " where policy_category = " + policy_type;
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);
}

module.exports.getDropdownValues = async function(req, res) {
  let res_obj = {
    categories: {},
    applications: {},
    l4: {},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    },
    policy_types: []
  };
  Promise.all([dbCon.getCategories(), dbCon.getApplications(), dbCon.getL4(), dbCon.policyTypes()]).then(values => {
    res_obj.categories = values[0];
    res_obj.applications = values[1];
    res_obj.l4 = values[2];
    res_obj.policy_types = values[3];
    res.status(200).json(res_obj)
    //console.log(values);
  }).catch(function(err) {
    res.status(400).json("Error! cannot connect to database");
    return;
  });

}
module.exports.deactivateData = function(req, res) {

  let source_id = req.body.source_id;
  let active = 0;
  var query = "UPDATE policies set active=? WHERE  source_id= ?";
  var valuesArr = [active, source_id];
  let obj = {};
  // deactivate data on three conditions like name , start_time, type
  obj.name = req.body.name;
  obj.type = req.body.type;
  obj.start_time = req.body.start_time;
  obj.action = "Deactivated Data in Policy Management";
  obj.time = new Date();
  dbCon.updateData(query, valuesArr, res, obj)

}

module.exports.addData = function(req, res) {

  let name = req.body.name;
  let type = req.body.type;
  let bytes_sent = 0;
  let bytes_rcvd = 0;
  let packets_sent = 0;
  let packets_rcvd = 0;
  let start_time = req.body.start_time;
  let end_time = req.body.end_time;
  let violation = req.body.violation;
  let description = req.body.description;
  let sessions_to_skip = req.body.sessions_to_skip; //threshold
  let active = req.body.active;
  let inserted = 0;
  let throttle = req.body.throttle;
  let policy_category = req.body.policy_category;

  if (end_time <= start_time) {
    end_time = 0;
  }
  //set data for log
  let obj = {};
  obj.username = req.body.username;
  obj.user_role = req.body.user_role;
  obj.action = "Added Data in Policy Managment.";
  obj.time = new Date();
  let query = "INSERT INTO policies ";
  query += "(name, type, bytes_sent, bytes_rcvd, packets_sent, packets_rcvd, start_time, end_time, violation, description, sessions_to_skip, active, inserted, throttle, policy_category)";
  query += "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let valuesArr = [name, type, bytes_sent, bytes_rcvd, packets_sent, packets_rcvd, start_time, end_time, violation, description, sessions_to_skip, active, inserted, throttle, policy_category];
  dbCon.addData(query, valuesArr, res, obj)
}
module.exports.searchData = function(req, res) {
  // let name = req.body.name;
  // let type = req.body.type;
  // let bytes_sent = 0;
  // let bytes_rcvd = 0;
  // let packets_sent = 0;
  // let packets_rcvd = 0;
  // let start_time = req.body.start_time;
  // let end_time = req.body.end_time;
  // let violation = req.body.violation;
  // let description = req.body.description;
  // let sessions_to_skip = req.body.sessions_to_skip; //threshold
  // let active = req.body.active;
  // let inserted = 0;
  // let throttle = req.body.throttle;
  // let policy_category = req.body.policy_category;
  // console.log(req.body);
  let query = "Select * from policies ";
  let where = "";
  // if(name != ""){
  //   where += "name = ?";
  // }
  // if(type != ""){
  //   where += "type = ?";

  // }
  console.log(req.body);
  let value_arr = [];
  let req_data = {
    ...req.body
  };
  if (req.body.add_policy) {
    req_data.policy_category = req.body.add_policy;
    delete req_data.add_policy;
  }
  if (req.body.ip_range) {
    delete req_data.ip_range;
  }
  if (req.body.source_ip) {
    delete req_data.source_ip;
  }
  if (req.body.source_port) {
    delete req_data.source_port;
  }
  if (req.body.ip_range) {
    delete req_data.ip_range;
  }
  if (req.body.ip_range) {
    delete req_data.ip_range;
  }
  
  if (req.body.threshold) {
    req_data.sessions_to_skip = req.body.threshold;
    delete req_data.threshold;
  }


  let obj_keys = Object.keys(req_data);

  if (obj_keys.length != 0) {
    let key = obj_keys[0];
    where = "where " + key + " like \"%?%\" ";
    value_arr.push(req_data[key]);
    for (var x = 1; x < obj_keys.length; x++) {
      key = obj_keys[x];
      where += " AND " + key + " like \"%?%\" ";
      value_arr.push(req_data[key]);
    }
    query += where;
  }
  query += " LIMIT 250 ";
  dbCon.query(query, value_arr, res);
}
module.exports.updateData = function(req, res) {
  let violation = req.body.violation;
  let description = req.body.description;
  let sessions_to_skip = req.body.sessions_to_skip; //threshold
  let active = req.body.active;
  let throttle = req.body.throttle;
  let source_id = req.body.source_id;
  var query = "UPDATE policies set violation=? , description=?, active=?"
  let valuesArr = [violation, description, active];
  
if(sessions_to_skip!= null){
query+= ",sessions_to_skip=?"
valuesArr.push( sessions_to_skip);
}
  if (throttle!=null){
query+= ",throttle=?"
valuesArr.push(throttle);
  }
  query+="WHERE  source_id= ?";
  valuesArr.push(source_id);
  let obj = {};
  obj.action = "Updated Data in Policy Management";
  obj.time = new Date();
  console.log("source", throttle);
  dbCon.updateData(query, valuesArr, res, obj)

}
