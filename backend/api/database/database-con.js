var mysql = require('mysql2'); ///// database connection
var pool = mysql.createPool({
  // connectionLimit: 5,
  host: 'localhost',
  user: 'netrapter',
  password: 'Khizsh18!',
  database: 'hawkeye100',
});

module.exports.query = function(getQuery, valuesArr, res) {
  let query = mysql.format(getQuery, valuesArr);
  if (valuesArr.length > 0) {
    query = query.replace(/\'/g, "");
  }

  let customized = res.customized;
  console.log("query", query);
  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json("Error! cannot connect to database");
      return;
    } else if (customized) {
      res.status(200).json({
        query: query,
        data: data
      });
      return;
    }
    //console.log(data);
    res.status(200).json(data)
  });
}
module.exports.queryData = function(getQuery, valuesArr) {
  return new Promise(function(resolve, reject) {
    let query = mysql.format(getQuery, valuesArr);
    if (valuesArr.length > 0) {
      query = query.replace(/\'/g, "");
    }
    console.log(query);
    pool.query(query, (err, data) => {
      console.log("error: ", err)
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}

//categories function
module.exports.getCategories = function(table_name = "netstar_categories") {
  let query = "select * from " + table_name;
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = {};
      for (x in data) {
        res_obj[data[x].category_id] = data[x].category_name;
      }
      resolve(res_obj);
    });
  });
}

module.exports.getApplications = function() {
  let query = "select * from protocol_ids";
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = {};
      for (x in data) {
        res_obj[data[x].protocol_id] = data[x].protocol_name;
      }
      resolve(res_obj);
    });
  });
}

module.exports.getL4 = function() {
  let query = "select * from protocoll4_ids";
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = {};
      for (x in data) {
        res_obj[data[x].l4_id] = data[x].l4_name;
      }
      resolve(res_obj);
    });
  });
}
module.exports.getOperator = function() {
  let query = "select * from operator_ids";
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = {};
      for (x in data) {
        res_obj[data[x].operator_id] = data[x].operator_name;
      }
      resolve(res_obj);
    });
  });
}
module.exports.getArea = function() {
  let query = "select area_id,area_name from areas";
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = {};
      for (x in data) {
        res_obj[data[x].area_id] = data[x].area_name;
      }
      resolve(res_obj);
    });
  });
}

module.exports.policyTypes = function() {
  let query = "select distinct type from policies;";
  return new Promise(function(resolve, reject) {
    pool.query(query, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let res_obj = [];
      for (x in data) {
        res_obj.push(data[x].type)
      }
      resolve(res_obj);
    });
  });
}




/// add data in target
module.exports.addData = function(insertQuery, valuesArr, res, log_obj) {
  let query = mysql.format(insertQuery, valuesArr);

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json("Error! cannot connect to database");
      return;
    }
    // addLog(log_obj);
    res.status(200).json("Record Added Successfully!");
  });
}

module.exports.addLog = function(obj) {
  addLog(obj);
}

addLog = function(obj) {
  let insertQuery = "INSERT INTO  log ";
  insertQuery += "(username, user_role, action, time)";
  insertQuery += "VALUES (?,?,?,?)";
  let valuesArr = [obj.username, obj.user_role, obj.action, obj.time];
  let log_query = mysql.format(insertQuery, valuesArr);
  pool.query(log_query, (log_err, log_data) => {
    console.log(log_err);
    console.log(log_data);
  });
}

///Update tc data

module.exports.updateData = function(updateQuery, valuesArr, res, log_obj) {
  let query = mysql.format(updateQuery, valuesArr);
  console.log(query);
  pool.query(query, (err, data) => {
    console.log(data);
    if (err) {
      console.log(err);
      res.status(400).json("Error! cannot connect to database");
      return;
    } else if (data.affectedRows > 0) {
      addLog(log_obj);
      res.status(200).json("Record Updated Successfully!");
    } else {
      res.status(404).json("Record Not Found");
    }
  });
}

module.exports.authenticate = function(authenticateQuery, valuesArr, res) {
  let query = mysql.format(authenticateQuery, valuesArr);

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json("Error! Login Fail.");
      return;
    } else if (data.length > 0) {
      console.log(data);
      let obj = {};
      obj.username = data[0].User_UserName;
      obj.user_role = data[0].Role_Name;
      obj.action = "Login";
      obj.time = new Date();
      addLog(obj);
      res.status(200).json({
        message: "success",
        data: data[0]
      });
    } else {
      res.status(400).json("Login Failed");
    }
  });
}
