const express = require('express');
const router = express.Router();
const myctrl = require('../controllers/myctrl.js');
const tcctrl = require('../controllers/tcCtrl.js');
const userctrl = require('../controllers/userCtrl.js');
// adding controller
const ipdrctrl = require('../controllers/ipdrCtrl.js');
// added for search and other button
const emailctrl = require('../controllers/emailCtrl.js');
const dnsctrl = require('../controllers/dnsCtrl.js');
const activityctrl = require('../controllers/activity-log.js');
const httpctrl = require('../controllers/http.js');
const locationctrl = require('../controllers/location.js');
const liveipdr=require('../controllers/liveipdr.js');
const policyctrl = require('../controllers/policyCtrl.js')
router.route('/user/login').post((req,res)=>{
  userctrl.authenticateUser(req, res);
});

router.route('/ipdr/getData').post((req,res)=>{
  console.log("check ipdr api ");
  ipdrctrl.getData(req, res);
});
//get ipdr dropdownValues
router.route('/ipdr/dropdownValues').get((req,res)=>{
ipdrctrl.getDropdownValues(req, res);
});
// adding route
router.route('/ipdr/commulative-results').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getCommulativeData(req, res);
});
router.route('/ipdr/existing-reports/getReports').get((req,res)=>{
  ipdrctrl.getExistingReports(req, res);
});
router.route('/ipdr/existing-reports/runQuery').post((req,res)=>{
  ipdrctrl.runReportQuery(req, res);
});
// existing report
router.route('/ipdr/existing-reports/saveReport').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.saveReport(req, res);
});
router.route('/ipdr/bandwith/utilization').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getBandwidthUtil(req, res);
});
router.route('/ipdr/bandwith/protocol').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getBandwidthProtocol(req, res);
});
router.route('/ipdr/bandwidth/barChart').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getBandwidthBchart(req, res);
});
router.route('/ipdr/connection/percentage').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getConnectionPercentage(req, res);
});
router.route('/ipdr/traffic/unclassified').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getUnclassifiedTrafic(req, res);
});
router.route('/ipdr/ipUsage').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getUsagePerIP(req, res);
});
router.route('/ipdr/customizeCriteria').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getCostumizeCriteria(req, res);
});

router.route('/ipdr/getDataByRange').post((req,res)=>{
  req.table_name = "ipdr";
  ipdrctrl.getDataByRange(req, res);
});
// ipdr_live search

router.route('/liveipdr/searchByAnyKeyword').post((req,res)=>{
  liveipdr.searchByAnyKeywords(req, res);
});

//target-creation-routes
router.route('/target-users/getData/:target_type').get((req,res)=>{
  tcctrl.getData(req, res);
});

router.route('/target-users/updateData').put((req,res)=>{
  tcctrl.updateData(req, res);
});

router.route('/target-users/addLocationAnalysisData').put((req,res)=>{
  tcctrl.addLocationAnalysisData(req, res);
});
router.route('/target-users/deactivateData').put((req,res)=>{
  tcctrl.deactivateData(req, res);
});

router.route('/target-users/addData').post((req,res)=>{
  tcctrl.addData(req, res);
});
router.route('/target-users/dropdownValues').get((req,res)=>{
  tcctrl.getDropdownValues(req, res);
  });

router.route('/target-users/searchData').post((req,res)=>{
  tcctrl.searchData(req, res);
});


//email-analaysis-routes

router.route('/email/getData').get((req,res)=>{
  // req.table_name = "email";
  emailctrl.getData(req, res);
});
router.route('/email/searchData').post((req,res)=>{
  // req.table_name = "email";
  emailctrl.searchData(req, res);
});
router.route('/email/searchByAnyKeyword').post((req,res)=>{
  emailctrl.searchByAnyKeywords(req, res);
});
//http-routes
router.route('/https/getData').get((req,res)=>{
  httpctrl.getData(req, res);
});
router.route('/https/searchByAnyKeyword').post((req,res)=>{
  httpctrl.searchByAnyKeyword(req, res);
});
//dns-routes
router.route('/dns/getData').get((req,res)=>{
  req.table_name = "dns";
  myctrl.getData(req, res);
});
router.route('/dns/searchData').post((req,res)=>{
  req.table_name = "dns";
  dnsctrl.searchData(req, res);
});
router.route('/dns/searchByAnyKeyword').post((req,res)=>{
  dnsctrl.searchByAnyKeyword(req, res);
});
//categories
router.route('/category/getCategories').get((req,res)=>{
  dnsctrl.getCategories(req, res);
});
// access count
router.route('/dns/accessCount').get((req,res)=>{
  req.table_name = "dns";
  dnsctrl.accessCount(req, res);
});
router.route('/users/getData').get((req,res)=>{
  req.table_name = "users";
  myctrl.getData(req, res);
});

//activity-log
router.route('/activity-log/getData').get((req,res)=>{
  req.table_name = "activity-log";
  activityctrl.getData(req, res);
});
router.route('/activity-log/getusername').get((req,res)=>{
  activityctrl.getusername(req, res);
});

router.route('/activity-log/addLog').post((req,res)=>{
  activityctrl.addData(req, res);
});

router.route('/activity-log/searchData').post((req,res)=>{
  activityctrl.searchData(req, res);
});
// location analysis
router.route('/location/getData').get((req,res)=>{
  locationctrl.getData(req, res);
});
router.route('/location/searchData').post((req,res)=>{
  locationctrl.searchData(req, res);
});
router.route('/location/searchByAnyKeyword').post((req,res)=>{
  locationctrl.searchByAnyKeyword(req, res);
});
//liveipdr
router.route('/liveipdr/getData').get((req,res)=>{
  liveipdr.getData(req, res);
});
// policy controllers
// get data
router.route('/policy/getData').get((req,res)=>{
  policyctrl.getData(req, res);
});
// get reports
router.route('/policy/getDataByPolicy/:policy_type').get((req,res)=>{
  policyctrl.getPolicyData(req, res);
});
// get reports
router.route('/policy/getExistingPolicy/:policy_type').get((req,res)=>{
  policyctrl.getExistingPolicyData(req, res);
});
// exiting data update
router.route('/policy/updateExistingData').post((req,res)=>{
  policyctrl.updateExistingData(req, res);
});
// deactivate
router.route('/policy/deactivateData').put((req,res)=>{
  policyctrl.deactivateData(req, res);
});

router.route('/policy/dropdownValues').get((req,res)=>{
policyctrl.getDropdownValues(req, res);
});
router.route('/policy/addData').post((req,res)=>{
  policyctrl.addData(req, res);
});

router.route('/policy/searchData').post((req,res)=>{
  policyctrl.searchData(req, res);
});
router.route('/policy/updateData').put((req,res)=>{
  policyctrl.updateData(req, res);
});
module.exports = router;
