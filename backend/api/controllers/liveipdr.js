var dbCon = require("../database/database-con.js");


module.exports.getData = function(req, res) {
//    let query = "Select ipdr_live.Source_ip, ipdr_live.Source_port, ipdr_live.Destination_ip, ipdr_live.Destination_port , protocoll4_ids.l4_name as protocol_l4, protocol_ids.protocol_name as Protocol_l7, category_ids.category_name as Category, ipdr_live.calling_number, ipdr_live.called_number, ipdr_live.Packets_sent, ipdr_live.Bytes_sent, ipdr_live.Packets_received, ipdr_live.Bytes_received, ipdr_live.Start_time, ipdr_live.End_time, ipdr_live.subscriber_id, areas.area_name as area_id,operator_ids.operator_name as operator_id from ipdr_live"


// //query += " inner join protocol_ids on protocol_ids.protocol_id = ipdr_live.protocol_l3";
//   query += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr_live.protocol_l4";
//   query += " inner join protocol_ids on protocol_ids.protocol_id = ipdr_live.Protocol_l7";
//   query += " inner join category_ids on category_ids.category_id=ipdr_live.Category ";
//   query += " inner join  areas on areas.area_id=ipdr_live.area_id";
//   query += " inner join operator_ids on operator_ids.operator_id=ipdr_live.operator_id ";
//   query += " LIMIT 250 ";
//   dbCon.query(query, [], res);
let query = "Select Source_ip,Source_port,Destination_ip,Destination_port ,protocol_l3, protocol_l4 as protocol_l4, Protocol_l7 as Protocol_l7, Category as Category, calling_number, called_number, Packets_sent, Bytes_sent, Packets_received, Bytes_received, Start_time, End_time, subscriber_id, area_id as area_id,operator_id as operator_id from ipdr_live"
let res_obj = {
    categories: {},
    l7: {},
    l4: {},
    operator:{},
    area:{},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    },

  };
  Promise.all([dbCon.getCategories("category_ids"), dbCon.getApplications(), dbCon.getL4(), dbCon.getOperator(),dbCon.getArea(),dbCon.queryData(query, [])]).then(values => {
    res_obj.categories = values[0];
    res_obj.l7 = values[1];
    res_obj.l4 = values[2];
    res_obj.operator = values[3];
    res_obj.area = values[4];
    let result = values[5];
    for (var x in result) {
      let l3_index = result[x].protocol_l3;
      result[x].protocol_l3 = res_obj.l3[l3_index];
      let l4_index = result[x].protocol_l4;
      result[x].protocol_l4 = res_obj.l4[l4_index];
      let l7_index = result[x].Protocol_l7;
      result[x].Protocol_l7 = res_obj.l7[l7_index];
      let cat_index = result[x].Category;
      result[x].Category = res_obj.categories[cat_index];
      let operator_index = result[x].operator_id;
      result[x].operator_id = res_obj.operator[operator_index];
      let area_index = result[x].area_id;
      result[x].area_id = res_obj.area[area_index];
    }


    res.status(200).json(result)

    //console.log(values);
  }).catch(function (err) {
    res.status(400).json("Error! cannot connect to database");
    return;
  });
  console.log("check ipdr api ");

}


// Convert dotted IP to number IP
dot2num = function(dot) {
  console.log(dot);
  var d = dot.split('.');
  let result = 0;
  return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
}

  // search data by any keyword
  module.exports.searchByAnyKeywords = function(req, res) {
    console.log(req.body);
   // let query = "Select * from ipdr_live ";
   let query = "Select Source_ip,Source_port,Destination_ip,Destination_port , protocol_l4 as protocol_l4, Protocol_l7 as Protocol_l7, Category as Category, calling_number, called_number, Packets_sent, Bytes_sent, Packets_received, Bytes_received, Start_time, End_time, subscriber_id, area_id as area_id,operator_id as operator_id from ipdr_live"


   //query += " inner join protocol_ids on protocol_ids.protocol_id = ipdr_live.protocol_l3";
    //  query += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr_live.protocol_l4";
    //  query += " inner join protocol_ids on protocol_ids.protocol_id = ipdr_live.Protocol_l7";
    //  query += " inner join category_ids on category_ids.category_id=ipdr_live.Category ";
    //  query += " inner join  areas on areas.area_id=ipdr_live.area_id";
    //  query += " inner join operator_ids on operator_ids.operator_id=ipdr_live.operator_id ";
    let keyword = req.body.keyword;
    let obj_keys = Object.keys(keyword);
    // if (obj_keys.length != 0) {
      let key = obj_keys[0];
    // }

    // let from = req.body.from;
    // let to = req.body.to;
    query += " where ";
    let columns = [ 'Source_ip','Source_port','Destination_ip','Destination_port','protocol_l4','Protocol_l7', 'Category', 'calling_number', 'called_number', 'Packets_sent', 'Bytes_sent', 'Packets_received', 'Bytes_received', 'Start_time', 'End_time', 'subscriber_id', 'area_id', 'operator_id'];

  for (x in columns) {
      if (columns[x] == "Source_ip" || columns[x] == "Destination_ip") {
        query += "ipdr_live." + columns[x] + " like \"%" + dot2num(keyword) + "%\" OR "
      } else {
        query += "ipdr_live." + columns[x] + " like \"%" + keyword + "%\" OR "
      }
    }
    query += "ipdr_live.Destination_port like \"%" + keyword + "%\""

    query += " LIMIT 250 ";
    dbCon.query(query, [], res);
    console.log("query",query)
  }

  // Source_ip: 2334789,
  // Source_port: 8080,
  // Destination_ip: 551011,
  // Destination_port: 65,
  // protocol_l3: 0,
  // protocol_l4: 22,
  // Protocol_l7: 36,
  // Application: 2,
  // Category: 3,
  // calling_number: 923083456,
  // called_number: 923089773,
  // Packets_sent: 34,
  // Bytes_sent: 56,
  // Packets_received: 66,
  // Bytes_received: 77,
  // Start_time: 1652211935,
  // End_time: 1652211980,
  // subscriber_id: '1',
  // operator_id: 1,
  // area_id: 1,
  // l4: 'IDP',
  // l7: 'MODBUS',
  // area: 'Karachi Central',
  // operator: 'Jazz',
  // category_name: 'DOWNLOAD_FT'
