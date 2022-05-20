var dbCon = require("../database/database-con.js");

module.exports.getData = function(req, res) {
  let table_name = req.table_name;
  let query = "Select * from " + table_name
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);
}

module.exports.getDataByRange = function(req, res) {
  let table_name = req.table_name;
  console.log(req.body);
  let start_time = req.body.start_time;
  let end_time = req.body.end_time;

  let query = "Select * from " + table_name;
  query += " where Start_time >= " + start_time;
  query += " AND End_time <= " + end_time;
  query += " LIMIT 250";
  dbCon.query(query, [], res);

}

module.exports.testData = async function(req, res) {
  let res_obj = {
    categories: {},
    applications: {},
    l4: {},
    l3: {"0": "IPV4", "1":"IPV6"}
  };
  var p1 = Promise.resolve(3);
  Promise.all([dbCon.getCategories(), dbCon.getApplications(), dbCon.getL4()]).then(values => {
    console.log("test1");
    res_obj.categories = values[0];
    res_obj.applications = values[1];
    res_obj.l4 = values[2];
    res.status(200).json(res_obj)
      //console.log(values);
  }).catch(function(err) {
  res.status(400).json("Error! cannot connect to database");
  return;
});

console.log(res_obj);

}
