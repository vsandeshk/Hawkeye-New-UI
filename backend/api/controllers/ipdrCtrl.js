const e = require("express");
const {
  query
} = require("express");
var dbCon = require("../database/database-con.js");

// console.log("initial report",report_query);

function setCustomizedData(c_params, value_arr) {
  let where = "";
  let first = true;
  let columns = "";
  let group_by = "";
  console.log(c_params);
  for (var x = 0; x < c_params.length; x++) {
    if (c_params[x].value == "" || c_params[x].value == null) {
      continue;
    }
    if (!first) {
      group_by += ", "
    } else {
      group_by += "group by ";
      first = false;


    }
    where += " AND "
    // where += "" + c_params[x].field + " = \"?\"  ";
    where += "" + c_params[x].field + " = "+c_params[x].value+"  ";

    columns += ", " + c_params[x].field;
    group_by += c_params[x].field;

  }
  return { query: where, columns: columns, group_by: group_by }
}
module.exports.getDropdownValues = async function (req, res) {
  let res_obj = {
    categories: {},
    l7: {},
    l4: {},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    }
  };
  Promise.all([dbCon.getCategories("category_ids"), dbCon.getApplications(), dbCon.getL4()]).then(values => {
    res_obj.categories = values[0];
    res_obj.l7 = values[1];
    res_obj.l4 = values[2];
    res.status(200).json(res_obj)
    //console.log(values);
  }).catch(function (err) {
    res.status(400).json("Error! cannot connect to database");
    return;
  });

}
module.exports.getData = function (req, res) {

  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }
  let query = "Select Source_ip,Source_port,Destination_ip,Destination_port, protocol_l3, protocol_l4, Protocol_l7 , Category, Packets_sent , Packets_received, Bytes_sent, Bytes_received, Start_time, End_time,subscriber_id from ipdr"
  query += " where End_time >= ? and End_time <= ? order by End_time desc  LIMIT 250"
  let res_obj = {
    categories: {},
    l7: {},
    l4: {},
    l3: {
      "0": "IPV4",
      "1": "IPV6"
    },
  };
  Promise.all([dbCon.getCategories("category_ids"), dbCon.getApplications(), dbCon.getL4(), dbCon.queryData(query, [from_time, to_time])]).then(values => {
    res_obj.categories = values[0];
    res_obj.l7 = values[1];
    res_obj.l4 = values[2];
    let result = values[3];
    for (var x in result) {
      let l3_index = result[x].protocol_l3;
      result[x].l3 = res_obj.l3[l3_index];
      let l4_index = result[x].protocol_l4;
      result[x].l4 = res_obj.l4[l4_index];
      let l7_index = result[x].Protocol_l7;
      result[x].l7 = res_obj.l7[l7_index];
      let cat_index = result[x].Category;
      result[x].category_name = res_obj.categories[cat_index];
    }


    res.status(200).json(result)

    //console.log(values);
  }).catch(function (err) {
    res.status(400).json("Error! cannot connect to database");
    return;
  });
  console.log("check ipdr api ");


}
module.exports.getDataByRange = function (req, res) {
  //let query_type = req.body.query_type;
  let from_time = req.body.from_time;
  let to_time = req.body.to_time;
  // let query = "Select * from ipdr";
  let query = "Select ipdr.* , protocoll4_ids.l4_name as l4, application_ids.application_name as l7 from " + table_name
  query += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr.protocol_l4";
  query += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";

  query += " where ipdr.End_time >= " + from_time;
  query += " AND ipdr.End_time <= " + to_time;
  query += " LIMIT 250";
  dbCon.query(query, [], res);
}
module.exports.getCommulativeData = async function (req, res) {
  var report_query = "";
  let c_params = req.body.c_params;
  let c_params_query = "";
  let c_params_columns = "";
  let generate_report_flag = req.body.generate_report_flag;
  let params_obj = { columns: "", query: "", group_by: "" };
  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }

  let commulative_query = "SELECT sum(Packets_sent)AS Pkts_sent,sum(Bytes_sent) AS Mb_sent,sum(Packets_received)AS Pkts_Rcvd,sum(Bytes_received) AS Mb_Rcvd";
  if (c_params.length != 0) {
    console.log(c_params);
    params_obj = setCustomizedData(c_params, []);

    console.log("cparams",params_obj);
  }
  commulative_query += params_obj.columns;
  commulative_query += " From ipdr where End_time >= " + from_time;
  commulative_query += " AND End_time <= " + to_time;
  commulative_query += " " + params_obj.query;
  commulative_query += params_obj.group_by;
  commulative_query += " LIMIT 250";
  //dbCon.query(commulative_query, value_arr, res);
  if(generate_report_flag){
    report_query = commulative_query;
  }

  let results = await dbCon.queryData(commulative_query,[]).then(function(value) {
    let obj = {data:value,query:report_query}
    res.status(200).json(obj);
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
    });
  console.log("commulative flag",generate_report_flag);
  console.log("report query",query);


}
module.exports.getBandwidthUtil = async function (req, res) {
  // // let from_time = req.body.from_time;
  // // let to_time = req.body.to_time;


  // let from_time = req.body.from_time;
  // if (from_time == undefined && from_time == null) {
  //   res.status(400).json("Start Time is invalid");
  //   return;
  // }

  // let to_time = req.body.to_time;

  // if (to_time == undefined && to_time == null) {
  //   res.status(400).json("End Time is invalid");
  //   return;
  // }

  // let time_difference = to_time - from_time;
  // let bandwidth_util = "";
  // if (time_difference <= 0) {
  //   // let bandwidth_util = "select avg(Bytes_sent) as data_rate_ul, avg(Bytes_received) as data_rate_dl from ipdr";
  //   bandwidth_util = "select sum(Bytes_sent) as data_rate_ul, sum(Bytes_received) as data_rate_dl from ipdr";
  // } else {
  //   // if (from_time != undefined) {
  //   bandwidth_util = "select sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " as data_rate_dl from ipdr";
  //   bandwidth_util += " where End_time >= " + from_time;
  //   bandwidth_util += " AND End_time <= " + to_time;
  //   // }
  // }
  // bandwidth_util += " LIMIT 250";
  // dbCon.query(bandwidth_util, [], res);
  let c_params = req.body.c_params;
  let c_params_query = "";
  let c_params_columns = "";
    let generate_report_flag = req.body.generate_report_flag;
    var report_query = "";

  let params_obj = { columns: "", query: "", group_by: "" };
  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }
  let time_difference = to_time - from_time;
  let bandwidth_query = "";
  if (time_difference <= 0) {
    bandwidth_query = "select sum(Bytes_sent) as data_rate_ul, sum(Bytes_received) as data_rate_dl ";
  }
  else {
    bandwidth_query = "select sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " as data_rate_dl ";
  }

  if (c_params.length != 0) {
    console.log(c_params);
    params_obj = setCustomizedData(c_params, []);

    console.log(params_obj);
  }
  bandwidth_query += params_obj.columns;
  bandwidth_query += " From ipdr where End_time >= " + from_time;
  bandwidth_query += " AND End_time <= " + to_time;
  bandwidth_query += " " + params_obj.query;
  bandwidth_query += params_obj.group_by;
  bandwidth_query += " LIMIT 250";

  if(generate_report_flag){
    report_query = bandwidth_query;
  }

  let results = await dbCon.queryData(bandwidth_query, []).then(function(value) {
    let obj = {data:value,query:report_query}
    res.status(200).json(obj);
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
    });
}


module.exports.getBandwidthProtocol = async function (req, res) {

  let c_params = req.body.c_params;
  let c_params_query = "";
  let c_params_columns = "";
  let generate_report_flag = req.body.generate_report_flag;
  var report_query = "";

  let params_obj = { columns: "", query: "", group_by: "" };
  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }
  let time_difference = to_time - from_time;
  let bandwidth_protocol_query = "";

  if (c_params.length != 0) {
    bandwidth_protocol_query = "Select sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " as data_rate_dl";
    console.log(c_params);
    params_obj = setCustomizedData(c_params, []);

    console.log(params_obj);
    bandwidth_protocol_query += params_obj.columns;
  }else{
    bandwidth_protocol_query = "Select protocol_l3 , protocol_l4 , Protocol_l7 ,sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " as data_rate_dl";

  }
 
  bandwidth_protocol_query += " From ipdr where End_time >= " + from_time;
  bandwidth_protocol_query += " AND End_time <= " + to_time;
  bandwidth_protocol_query += " " + params_obj.query;
  if (c_params.length != 0) {
    bandwidth_protocol_query += params_obj.group_by;
  }else{
    bandwidth_protocol_query += " group by protocol_l3 , protocol_l4 , Protocol_l7";

  }
  bandwidth_protocol_query += " LIMIT 250";
  if(generate_report_flag){
    report_query = bandwidth_protocol_query;
  }

  let results = await dbCon.queryData(bandwidth_protocol_query, []).then(function(value) {
    let obj = {data:value,query:report_query}
    res.status(200).json(obj);
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
    });
 
  // let from_time = req.body.from_time;
  // if (from_time == undefined && from_time == null) {
  //   res.status(400).json("Start Time is invalid");
  //   return;
  // }

  // let to_time = req.body.to_time;

  // if (to_time == undefined && to_time == null) {
  //   res.status(400).json("End Time is invalid");
  //   return;
  // }
  // let time_difference = to_time - from_time;

  // let bandwidth_protocol = "Select protocol_l3 , protocol_l4 , Protocol_l7 ,sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " as data_rate_dl from ipdr"
  // // bandwidth_protocol += " where End_time >= ? and End_time <= ? order by End_time desc  LIMIT 250"
  // bandwidth_protocol += " where End_time >= " + from_time;
  // bandwidth_protocol += " AND End_time <= " + to_time;
  // bandwidth_protocol += " group by protocol_l3, protocol_l4, Protocol_l7 LIMIT 250";
  // //  dbCon.query(bandwidth_protocol, [], res);

  // let res_obj = {
  //   l7: {},
  //   l4: {},
  //   l3: {
  //     "0": "IPV4",
  //     "1": "IPV6"
  //   },
  // };
  // Promise.all([dbCon.getApplications(), dbCon.getL4(), dbCon.queryData(bandwidth_protocol, [])]).then(values => {
  //   res_obj.l7 = values[0];
  //   res_obj.l4 = values[1];
  //   let result = values[2];
  //   for (var x in result) {
  //     let l3_index = result[x].protocol_l3;
  //     result[x].l3 = res_obj.l3[l3_index];
  //     let l4_index = result[x].protocol_l4;
  //     result[x].l4 = res_obj.l4[l4_index];
  //     let l7_index = result[x].Protocol_l7;
  //     result[x].l7 = res_obj.l7[l7_index];

  //   }


  //   res.status(200).json(result)

  //   //console.log(values);
  // }).catch(function (err) {
  //   res.status(400).json("Errors! cannot connect to database");
  //   console.log(err);
  //   console.log(bandwidth_protocol)
  //   return;
  // });


  // let from_time = req.body.from_time;
  // let to_time = req.body.to_time;
  // let time_difference = to_time - from_time;
  // let bandwidth_protocol = "select protocol_l3, protocol_l4, Protocol_l7 , avg(Bytes_sent) as data_rate_ul, sum(Bytes_received) as data_rate_dl from ipdr";
  // let bandwidth_protocol = "select ipdr.protocol_l3 as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7 , avg(ipdr.Bytes_sent) as data_rate_ul, sum(ipdr.Bytes_received) as data_rate_dl from ipdr";
  // bandwidth_protocol += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr.protocol_l4";
  // bandwidth_protocol += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
  // if (from_time != undefined) {
  //   bandwidth_protocol = "select ipdr.protocol_l3   as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7, sum(ipdr.Bytes_sent)/" + time_difference + " as data_rate_ul, sum(ipdr.Bytes_received)/" + time_difference + " as data_rate_dl from ipdr";
  //   bandwidth_protocol += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr.protocol_l4";
  //   bandwidth_protocol += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
  //   bandwidth_protocol += " where ipdr.End_time >= " + from_time;
  //   bandwidth_protocol += " AND ipdr.End_time <= " + to_time;
  // }
  // bandwidth_protocol += " group by l3, l4, l7 LIMIT 250";
  // dbCon.query(bandwidth_protocol, [], res);
}
module.exports.getExistingReports = function (req, res) {
  let reports_query = "select * from reports";
  dbCon.query(reports_query, [], res);
}
module.exports.runReportQuery = function (req, res) {
  let reports_query = req.body.query;
  console.log("rest", reports_query);
  reports_query += "";
  dbCon.query(reports_query, [], res);
}
// adding save report function
module.exports.saveReport = function (req, res) {
  console.log("report1");
  let Report_Name = req.body.Report_Name;
  let Report_Created_By = req.body.Report_Created_By;
  let Report_Interface = req.body.Report_Interface;
  let Has_Start_Time = req.body.Has_Start_Time;
  let Has_End_Time = req.body.Has_End_Time;
  let report_query = req.body.Report_Query;

  // console.log("length report query",Report_Query.length);
  let reports_query = "INSERT INTO reports ";
  reports_query += "(Report_Name, Report_Created_By, Report_Interface, Report_Query, Has_Start_Time,Has_End_Time)";
  reports_query += "VALUES (?,?,?,'"+report_query+"',1,1)";
  // let valuesArr = [Report_Name, Report_Created_By, Report_Interface, Report_Query, Has_Start_Time, Has_End_Time];
  let valuesArr = [Report_Name, Report_Created_By, Report_Interface, Has_Start_Time, Has_End_Time];

  dbCon.addData(reports_query, valuesArr, res)
  // console.log("save report",reports_query,"endtime...",Has_End_Time);
  // res.status(200).json(res)
  // alert("Reports of ipdr saved");

}
module.exports.getBandwidthBchart = function (req, res) {
  // let from_time = req.body.from_time;
  // let to_time = req.body.to_time;
  // let time_difference = to_time - from_time;

  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }
  let time_difference = to_time - from_time;

  let barchart = "Select Protocol_l7 ,sum(Bytes_sent)/" + time_difference + " as data_rate_ul, sum(Bytes_received)/" + time_difference + " ,(sum(Bytes_sent)/" + time_difference + "  + sum(Bytes_received)/" + time_difference + ") as aggregate from ipdr"
  // bandwidth_protocol += " where End_time >= ? and End_time <= ? order by End_time desc  LIMIT 250"
  barchart += " where End_time >= " + from_time;
  barchart += " AND End_time <= " + to_time;
  barchart += " group by Protocol_l7  order by aggregate LIMIT 4";
  let res_obj = {
    app_name: {},

  };
  Promise.all([dbCon.getApplications(), dbCon.queryData(barchart, [])]).then(values => {
    res_obj.app_name = values[0];
    let result = values[1];
    for (var x in result) {
      let l7_index = result[x].Protocol_l7;
      result[x].app_name = res_obj.app_name[l7_index];

    }


    res.status(200).json(result)

    //console.log(values);
  }).catch(function (err) {
    res.status(400).json("Errors! cannot connect to database");
    console.log(err);
    // console.log(bandwidth_protocol)
    return;
  });

  // let barchart = "select application_ids.application_name as app_name, avg(ipdr.Bytes_sent), avg(ipdr.Bytes_received),(avg(ipdr.Bytes_sent)+avg(ipdr.Bytes_received)) as aggregate from ipdr";
  // barchart += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
  // if (from_time != undefined) {
  //   barchart = "select application_ids.application_name, sum(ipdr.Bytes_sent)/" + time_difference + ", sum(ipdr.Bytes_received)/" + time_difference + ",((sum(ipdr.Bytes_sent)/" + time_difference + ")+sum(ipdr.Bytes_received)/" + time_difference + ") as aggregate from ipdr";
  //   barchart += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
  //   barchart += " where End_time >= " + from_time;
  //   barchart += " AND End_time <= " + to_time;
  // }
  // barchart += "  group by ipdr.Protocol_l7 order by aggregate desc limit 4";
  // dbCon.query(barchart, [], res);
}
module.exports.getConnectionPercentage = async function (req, res) {
  let c_params = req.body.c_params;
  let c_params_query = "";
  let c_params_columns = "";

  let generate_report_flag = req.body.generate_report_flag;
  var report_query = "";

  let params_obj = { columns: "", query: "", group_by: "" };
  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }

  let percetage_connection_query = "select count(Start_time) as Percetage_connection";
  if (c_params.length != 0) {
    console.log(c_params);
    params_obj = setCustomizedData(c_params, []);

    console.log(params_obj);
  }
  percetage_connection_query += params_obj.columns;
  percetage_connection_query  += " From ipdr where End_time >= " + from_time;
  percetage_connection_query  += " AND End_time <= " + to_time;
  percetage_connection_query  += " " + params_obj.query;
  percetage_connection_query  += params_obj.group_by;
  percetage_connection_query  += " LIMIT 250";
  if(generate_report_flag){
    report_query = percetage_connection_query;
  }

  let results = await dbCon.queryData(percetage_connection_query, []).then(function(value) {
    let obj = {data:value,query:report_query}
    res.status(200).json(obj);
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
    });

  // let from_time = req.body.from_time;
  // let c_params = req.body.c_params
  // console.log("customize fields", c_params);
  // if (from_time == undefined && from_time == null) {
  //   res.status(400).json("Start Time is invalid");
  //   return;
  // }
  // let to_time = req.body.to_time;

  // if (to_time == undefined && to_time == null) {
  //   res.status(400).json("End Time is invalid");
  //   return;
  // }
  // let from_time = req.body.from_time;
  // let to_time = req.body.to_time;
  // let conn_percent_query = "select protocol_l3, protocol_l4, Protocol_l7, ((count(Protocol_l7)*100)/ (select count(Start_time) from ipdr)) as Percetage_connection from ipdr ";
  // let conn_percent_query = "select ipdr.protocol_l3 as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7 , ((count(ipdr.Protocol_l7)*100)/ (select count(Start_time) from ipdr)) as Percetage_connection from ipdr ";
  // if (c_params == null && c_params == undefined) {
  //   let conn_percent_query = "select count(Start_time) as Percetage_connection from ipdr ";
  //   conn_percent_query += " where End_time >= " + from_time;
  //   conn_percent_query += " AND End_time <= " + to_time;
    // conn_percent_query += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr.protocol_l4";
    // conn_percent_query += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
    // if (from_time != undefined) {
    //   conn_percent_query = "select ipdr.protocol_l3  as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7, ((count(ipdr.Protocol_l7)*100)/ (select count(Start_time) from ipdr"
    //   conn_percent_query += " inner join protocoll4_ids on protocoll4_ids.l4_name = ipdr.protocol_l4";
    //   conn_percent_query += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
    //   conn_percent_query += " where ipdr.End_time >= " + from_time;
    //   conn_percent_query += " AND ipdr.End_time <= " + to_time;
    //   conn_percent_query += ")) as Percetage_connection from ipdr ";
    //   conn_percent_query += " inner join protocoll4_ids on protocoll4_ids.l4_id = ipdr.protocol_l4";
    //   conn_percent_query += " inner join application_ids on application_ids.application_id = ipdr.Protocol_l7";
    //   conn_percent_query += " where ipdr.End_time >= " + from_time;
    //   conn_percent_query += " AND ipdr.End_time <= " + to_time;
    // }
    // conn_percent_query += " group by l3, l4, l7";
  //   dbCon.query(conn_percent_query, [], res);
  // }

}
module.exports.getUnclassifiedTrafic = function (req, res) {
  let from_time = req.body.from_time;
  let to_time = req.body.to_time;
  let unclassified = "select Source_ip,Source_port,Destination_ip,Destination_port,protocol_l3,protocol_l4,Protocol_l7,Category,Packets_sent,Packets_received,Bytes_sent,Bytes_received,Start_time,End_time from ipdr";
  if (from_time != undefined) {
    unclassified += " where End_time >= " + from_time;
    unclassified += " AND End_time <= " + to_time;
  }
  unclassified += " LIMIT 250";
  dbCon.query(unclassified, [], res);
}
module.exports.getUsagePerIP = async function (req, res) {
  let c_params = req.body.c_params;
  let c_params_query = "";
  let c_params_columns = "";
  let generate_report_flag = req.body.generate_report_flag;
  var report_query = "";

  let params_obj = { columns: "", value_arr: [], query: "", group_by: "" };
  let from_time = req.body.from_time;
  if (from_time == undefined && from_time == null) {
    res.status(400).json("Start Time is invalid");
    return;
  }

  let to_time = req.body.to_time;

  if (to_time == undefined && to_time == null) {
    res.status(400).json("End Time is invalid");
    return;
  }
  let ip_usage_query = "";

  if (c_params.length != 0) {
    ip_usage_query = "select sum(Bytes_sent+Bytes_received) as ip_usage";
    console.log(c_params);
    params_obj = setCustomizedData(c_params, []);

    console.log(params_obj);
    ip_usage_query += params_obj.columns;
  }else{
    ip_usage_query = "select Source_ip, Destination_ip, sum(Bytes_sent+Bytes_received) as ip_usage";

  }
 
  ip_usage_query += " From ipdr where End_time >= " + from_time;
  ip_usage_query += " AND End_time <= " + to_time;
  ip_usage_query += " " + params_obj.query;
  if (c_params.length != 0) {
  ip_usage_query += params_obj.group_by;
  }else{
    ip_usage_query += " group by Source_ip , Destination_ip";

  }
  ip_usage_query += " LIMIT 250";
  if(generate_report_flag){
    report_query = ip_usage_query;
  }

  let results = await dbCon.queryData(ip_usage_query, []).then(function(value) {
    let obj = {data:value,query:report_query}
    res.status(200).json(obj);
    }, function(err) {
      res.status(400).json("Error! cannot connect to database");
    });
  // let from_time = req.body.from_time;
  // let to_time = req.body.to_time;

  // let from_time = req.body.from_time;
  // if (from_time == undefined && from_time == null) {
  //   res.status(400).json("Start Time is invalid");
  //   return;
  // }

  // let to_time = req.body.to_time;

  // if (to_time == undefined && to_time == null) {
  //   res.status(400).json("End Time is invalid");
  //   return;
  // }
  // let ip_usage = "select Source_ip, Destination_ip, sum(Bytes_sent+Bytes_received) as ip_usage from ipdr";
  // ip_usage += " where End_time >= " + from_time;
  // ip_usage += " AND End_time <= " + to_time;

  // ip_usage += " group by Source_ip, Destination_ip LIMIT 250";
  // dbCon.query(ip_usage, [], res);
}


module.exports.getCostumizeCriteria = function (req, res) {
  let c_params = req.body.c_params
  let from_time = req.body.from_time;
  let to_time = req.body.to_time;
  console.log(c_params);
  let where = "";
  let value_arr = [];
  // let query = "select * from ipdr where ";
  let query = "Select ipdr.* , ipdr.protocol_l3 as l3, protocoll4_ids.l4_name as l4, application_ids.application_name as l7 from ipdr"
  query += " inner join protocoll4_ids on l4_id = protocol_l4";
  query += " inner join application_ids on application_id = Protocol_l7 where ";

  for (var x = 0; x < c_params.length; x++) {
    if (x > 0) {
      where += " AND "
    }
    if (c_params[x].field == "l3") {
      where += "protocol_name like \"%?%\" ";
    } else if (c_params[x].field == "l4") {
      where += "l4_name like \"%?%\" ";
    } else if (c_params[x].field == "l7") {
      where += "application_name like \"%?%\" ";
    }
    else {
      where += "" + c_params[x].field + " like \"%?%\"  ";
    }
    value_arr.push(c_params[x].value);
  }
  query += where;

  query += " AND End_time >= " + from_time;
  query += " AND End_time <= " + to_time;
  query += " LIMIT 250";
  res.customized = true;
  dbCon.query(query, value_arr, res);
}
