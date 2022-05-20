var dbCon = require("../database/database-con.js");

// Convert dotted IP to number IP
dot2num = function(dot) {
  console.log(dot);
  var d = dot.split('.');
  let result = 0;
  return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
}

module.exports.getData = function(req, res) {
  // let table_name = req.table_name;
  let query = "Select * from email_logs"
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);

}
// search data
module.exports.searchData = function(req,res){
  console.log(req.body);
  let query = "Select * from email_logs ";
  let where = "";
  let value_arr = [];
  let obj_keys = Object.keys(req.body);
  if (obj_keys.length != 0) {
    let key = obj_keys[0];
    where = "where email_logs." + key + " like \"%?%\" ";
    value_arr.push(req.body[key]);
    for (var x = 1; x < obj_keys.length; x++) {
      key = obj_keys[x];
      where += " AND " + key  + " like \"%?%\" ";
      value_arr.push(req.body[key]);
    }
    query += where;
  }
  query += " LIMIT 250 ";
  dbCon.query(query, value_arr, res);
  }

  // search data by any keyword
module.exports.searchByAnyKeywords = function(req, res) {
  console.log(req.body);
  let query = "Select * from email_logs ";
  let keyword = req.body.keyword;
  let from = req.body.from;
  let to = req.body.to;
  query += " where ";
  let columns = ['uuid', 'mailfrom', 'mailto', 'subject', 'filename', 'sip', 'sport', 'dip', 'dport', 'body'];

for (x in columns) {
    if (columns[x] == "sip" || columns[x] == "dip") {
      query += "email_logs." + columns[x] + " like \"%" + dot2num(keyword) + "%\" OR "
    } else {
      query += "email_logs." + columns[x] + " like \"%" + keyword + "%\" OR "
    }
  }
  query += "email_logs.dport like \"%" + keyword + "%\""

  query += " LIMIT 250 ";
  dbCon.query(query, [], res);
}
// no send time in table
