var dbCon = require("../database/database-con.js");

module.exports.getData = function(req, res) {
  let table_name = req.table_name;
  let query = "Select * from "+table_name
  query += " LIMIT 250 ";
  dbCon.query(query, [], res);

}
// search data
module.exports.searchData = function(req, res) {
  console.log(req.body);
  let query = "Select * from dns ";

  let where = "";
  let value_arr = [];
  let obj_keys = Object.keys(req.body);
  if (obj_keys.length != 0) {
    let key = obj_keys[0];
    where = "where " + key +  " like \"%?%\" ";
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

// search data by any keyword
module.exports.searchByAnyKeyword = function(req, res) {
  console.log(req.body);
  let query = "Select * from dns ";
  let keyword = req.body.keyword;
  let from = req.body.from;
  let to = req.body.to;
  query += "where last_accessed > "+from+" AND last_accessed < "+to+" AND url like \"%" + keyword + "%\" OR ";
  query += "access_count like \"%" + keyword + "%\" OR ";
  query += "category1 = (select category_id from netstar_categories where category_name like  \"%" + keyword + "%\" limit 1) OR "
  query += "category2 = (select category_id from netstar_categories where category_name like  \"%" + keyword + "%\" limit 1) OR ";
  query += "category3 = (select category_id from netstar_categories where category_name like  \"%" + keyword + "%\" limit 1)"
  query += " LIMIT 250 ";

  dbCon.query(query, [], res);
}

module.exports.accessCount = function(req, res) {
  let query = "Select url as name, access_count as value from dns ";
  query += " order by access_count desc limit 10";
  dbCon.query(query, [], res);
}

module.exports.getCategories = async function(req, res) {
  let results = await dbCon.getCategories().then(function(value) {
  res.status(200).json(value);
  }, function(err) {
    res.status(400).json("Error! cannot connect to database");
  });
}
