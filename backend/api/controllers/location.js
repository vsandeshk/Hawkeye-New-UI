var dbCon = require("../database/database-con.js");

// get data
module.exports.getData = function(req, res) {
  // let table_name = req.table_name;
  let query = "Select * from location_analysis"
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);

}
// search data
module.exports.searchData = function(req, res) {
  console.log(req.body);
  let query = "Select * from location_analysis ";
  let where = "";
  let value_arr = [];
  let obj_keys = Object.keys(req.body);
  if (obj_keys.length != 0) {
    let key = obj_keys[0];
    where = "where location_analysis." + key + " like \"%?%\" ";
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
// Convert dotted IP to number IP
dot2num = function(dot) {
  console.log(dot);
  var d = dot.split('.');
  let result = 0;
  return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
}

// search data by any keyword
module.exports.searchByAnyKeyword = function(req, res) {
  console.log(req.body);
  let query = "Select * from location_analysis ";
  let keyword = req.body.keyword;
  let from = req.body.from;
  let to = req.body.to;
  query += " where ";
  let columns = ['public_ip', 'private_ip', 'network_id'];

  for (x in columns) {
    if (columns[x] == "public_ip" || columns[x] == "private_ip") {
      query += "location_analysis." + columns[x] + " like \"%" + dot2num(keyword) + "%\" OR "
    } else {
      query += "location_analysis." + columns[x] + " like \"%" + keyword + "%\" OR "
    }
  }
  query += "location_analysis.customer_id like \"%" + keyword + "%\" limit 250";
  //query += " AND location_analysis.send_time > " + from + " AND location_analysis.send_time < " + to + " order by location_analysis.send_time LIMIT 250 ";
  dbCon.query(query, [], res);
}
