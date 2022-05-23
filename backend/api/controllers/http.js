var dbCon = require("../database/database-con.js");

dot2num = function (dot) {
  console.log(dot);
  var d = dot.split('.');
  let result = 0;
  return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
}

module.exports.getData = function (req, res) {
  let query = "SELECT target_id,Source_ip,Source_port,Destination_ip,Destination_port,protocol_l3,protocol_l4,Protocol_l7,Category,Start_time,End_time,subscriber_id,operator_id,area_id FROM https  limit 64";
  let target_query = "select target_id, policy from lea_target where type = 'HTTP Analysis'";
  let res_obj = {
    categories: {},
    l7: {},
    l4: {},
    operator: {},
    area: {},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    },
    target_urls: {}
  };
  Promise.all([dbCon.getCategories("category_ids"), dbCon.getApplications(), dbCon.getL4(), dbCon.getOperator(), dbCon.getArea(), dbCon.queryData(target_query, []), dbCon.queryData(query, [])]).then(values => {
    res_obj.categories = values[0];
    res_obj.l7 = values[1];
    res_obj.l4 = values[2];
    res_obj.operator = values[3];
    res_obj.area = values[4];
    let target_data = values[5];
    for (x in target_data) {
      res_obj.target_urls[target_data[x].target_id] = target_data[x].policy;
    }
    let result = values[6];
    for (var x in result) {
      let url = result[x].target_id;
      result[x].url = res_obj.target_urls[url];
      let l3_index = result[x].protocol_l3;
      result[x].l3 = res_obj.l3[l3_index];
      let l4_index = result[x].protocol_l4;
      result[x].l4 = res_obj.l4[l4_index];
      let l7_index = result[x].Protocol_l7;
      result[x].l7 = res_obj.l7[l7_index];
      let cat_index = result[x].Category;
      result[x].category_name = res_obj.categories[cat_index];
      let operator_index = result[x].operator_id;
      result[x].operator_id = res_obj.operator[operator_index];
      let area_index = result[x].area_id;
      result[x].area_id = res_obj.area[area_index];
    }


    res.status(200).json(result)

    //console.log(values);
  }).catch(function (err) {
    console.log(err);
    res.status(400).json("Error! cannot connect to database");
    return;
  });

}

// search data by any keyword
module.exports.searchByAnyKeyword = function (req, res) {
  console.log(req.body);
  // let query = "Select https.* , protocol_ids.protocol_name as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7 from https "
  let keyword = req.body.keyword;
  let from = req.body.from;
  let to = req.body.to;
  let query = "SELECT target_id,Source_ip,Source_port,Destination_ip,Destination_port,protocol_l3,protocol_l4,Protocol_l7,Category,Start_time,End_time,subscriber_id,operator_id,area_id FROM https ";
  query += " where ";
  let columns = ["target_id", "Source_ip", "source_port", "Destination_ip", "destination_port", "protocol_l3", "protocol_l4", "Protocol_l7", "Category", "calling_number", "called_number", "operator_id", "area_id", "subscriber_id"];

  for (x in columns) {
    if (columns[x] == "Source_ip" || columns[x] == "Destination_ip") {
      query += "https." + columns[x] + " like \"%" + dot2num(keyword) + "%\" OR "
    } else if (columns[x] == "Protocol_l7") {
      query += "https." + columns[x] + " = (Select protocol_id from protocol_ids where protocol_name = '" + keyword + "' limit 1) OR "

    } else if (columns[x] == "target_id") {
      query += "https." + columns[x] + " = (Select target_id from lea_target where policy like \"%" + keyword + "%\" ) OR "

    }
    else if (columns[x] == "protocol_l4") {
      query += "https." + columns[x] + " = (Select l4_id from protocoll4_ids where l4_name = '" + keyword + "' limit 1) OR "

    } else if (columns[x] == "protocol_l3") {
      if (keyword == 'IPV4' || keyword == 'ipv4') {
        query += "https." + columns[x] + " =  0 OR "
      } else if (keyword == 'IPV6' || keyword == 'ipv6') {
        query += "https." + columns[x] + " = 1 OR "
      }
    } else if (columns[x] == "Category") {
      query += "https." + columns[x] + " = (Select category_id from category_ids where category_name = '" + keyword + "' limit 1) OR "

    } else if (columns[x] == "area_id") {
      query += "https." + columns[x] + " = (Select area_id from areas where area_name = '" + keyword + "' limit 1) or "

    } else if (columns[x] == "operator_id") {
      query += "https." + columns[x] + " = (Select operator_id from operator_ids where operator_name = '" + keyword + "' limit 1) OR "

    }

    else if (columns[x] == "subscriber_id") {
      query += "https." + columns[x] + " like \"%" + keyword + "%\" "
    } else {
      query += "https." + columns[x] + " like \"%" + keyword + "%\" OR "
    }

  }
  let target_query = "select target_id, policy from lea_target where type = 'HTTP Analysis'";
  let res_obj = {
    categories: {},
    l7: {},
    l4: {},
    operator: {},
    area: {},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    },
    target_urls: {}
  };
  Promise.all([dbCon.getCategories("category_ids"), dbCon.getApplications(), dbCon.getL4(), dbCon.getOperator(), dbCon.getArea(), dbCon.queryData(target_query, []), dbCon.queryData(query, [])]).then(values => {
    res_obj.categories = values[0];
    res_obj.l7 = values[1];
    res_obj.l4 = values[2];
    res_obj.operator = values[3];
    res_obj.area = values[4];
    let target_data = values[5];
    for (x in target_data) {
      res_obj.target_urls[target_data[x].target_id] = target_data[x].policy;
    }
    let result = values[6];
    for (var x in result) {
      let url = result[x].target_id;
      result[x].url = res_obj.target_urls[url];
      let l3_index = result[x].protocol_l3;
      result[x].l3 = res_obj.l3[l3_index];
      let l4_index = result[x].protocol_l4;
      result[x].l4 = res_obj.l4[l4_index];
      let l7_index = result[x].Protocol_l7;
      result[x].l7 = res_obj.l7[l7_index];
      let cat_index = result[x].Category;
      result[x].category_name = res_obj.categories[cat_index];
      let operator_index = result[x].operator_id;
      result[x].operator_id = res_obj.operator[operator_index];
      let area_index = result[x].area_id;
      result[x].area_id = res_obj.area[area_index];
    }


    res.status(200).json(result)

    //console.log(values);
  }).catch(function (err) {
    console.log(err);
    res.status(400).json("Error! cannot connect to database");
    return;
  });
 
}
