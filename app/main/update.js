// -------------------------------------------------------------------------------//
// ----------------------CHILD PROCESS TO UPDATE DATABASE ------------------------//
// -------------------------------------------------------------------------------//

var req = require('request');
var Bill = require('../database/Bill.js');

// GLOBAL VARIABLES
var apikey = require('./api_key.js').apikey;
var urlHouseIntroduced = 'https://api.propublica.org/congress/v1/115/house/bills/introduced.json';
var urlSenateIntroduced = 'https://api.propublica.org/congress/v1/115/senate/bills/introduced.json';

var urlHouseUpdated = 'https://api.propublica.org/congress/v1/115/house/bills/updated.json';
var urlSenateUpdated = 'https://api.propublica.org/congress/v1/115/senate/bills/updated.json';

var updateInterval = 3600000;

// MONGODB INITIALIZATION
var mongoose = require('mongoose'); // for mongodb connection
var config = require('../database/database.js');
mongoose.connect(config.url);

// CONTINUALLY UPDATE THE DATABASE EVERY 30 MINUTES
// AND SEND MESSAGE TO PARENT PROCESS
var getBills = function(url) { 
	var headers = {
		'X-API-Key' : apikey
	};
	
	// perform request
	req.get({ url: url, headers: headers}, function(err, req, body) {
		if (err)
			console.log(err);
		else {
			var json = JSON.parse(body);
			
			// check if request returned correct data
			if (json.results[0] != null){
				var bills = json.results[0].bills;
				
				for (var i = 0 ; i < bills.length; i++){
					var currbill = bills[i];
					handleBillAdd(currbill);
				}
			}
			else
				console.log("REQUEST FAILED");
		}
	});
};

// HANDLES THE ADDITION OF BILL TO THE DATABASE
var handleBillAdd = function(currbill){
	
	Bill.findOne({'bill.main.id' : currbill.bill_id}, function(err, bill){

			if (err){
				console.log(err);
				return;
			}
			
			// PREHANDLE DATES
			var introducedDate_str = currbill.introduced_date;
			var latest_major_action_str = currbill.latest_major_action_date;
			
			var enacted = currbill.enacted;
			var house_passage = currbill.house_passage;
			var senate_passage = currbill.senate_passage;
			var vetoed = currbill.vetoed;
			
			if (enacted != "")
				enacted = new Date("<" + enacted  + ">");
			if (house_passage != "")
				house_passage = new Date("<" + house_passage + ">");
			if (senate_passage != "")
				senate_passage = new Date("<" + senate_passage + ">");
			if (vetoed != "")
				vetoed = new Date("<" + vetoed + ">");
			
			// HANDLE FORMAT OF INTRODUCED DATE
			var introducedDate = strToDate(introducedDate_str);
			var latest_major_action = strToDate(latest_major_action_str);
				
			var introducedDate = new Date(introducedDate);
			var latest_major_action = new Date(latest_major_action);
			
			if(bill){
				// first convert to object
				var bill = bill.toJSON();
				
				// bill already exists in database; just update it				
				bill.bill.data.enacted = enacted;
				bill.bill.data.house_passage = house_passage;
				bill.bill.data.senate_passage = senate_passage;
				bill.bill.data.enacted = enacted;
				bill.bill.data.vetoed = vetoed;
				
				// if the bill has been updated:
				if (new Date(bill.bill.data.latest_major_action_date).getTime() != latest_major_action.getTime()){
					bill.bill.data.latest_major_action_date = currbill.latest_major_action_date;
					var curr_actions = bill.bill.data.latest_major_action;
					curr_actions.push(currbill.latest_major_action);
					bill.bill.data.latest_major_action_date = curr_actions;
				}
				
				// prevent multiple ids
				delete bill._id;
				
				Bill.findOneAndUpdate({'bill.main.id': bill.bill.main.id}, bill, function(err, doc){
					if (err)
						throw err;
					console.log("FINISHED UPDATING BILL: " + bill.bill.main.id);
										
					// SEND MESSAGE BACK TO THE MAIN PROCESS THAT A BILL HAS BEEN UPDATED
					process.send(currbill.bill_id);
				});
			}
			else {
				// bill doesn't exist, so add new entry into database
				var newBill = new Bill();
				newBill.bill.main.id = currbill.bill_id;
				newBill.bill.main.title = currbill.title;
				
				newBill.bill.data.bill_uri = currbill.bill_uri;
				newBill.bill.data.sponsor_id = currbill.sponsor_id;
				newBill.bill.data.gpo_pdf_uri = currbill.gpo_pdf_uri;
				newBill.bill.data.congressdotgov_url = currbill.congressdotgov_url;
				newBill.bill.data.govtrack_url = currbill.govtrack_url;
				newBill.bill.data.introduced_date = introducedDate;
				newBill.bill.data.active = currbill.active;
				newBill.bill.data.house_passage = house_passage;
				newBill.bill.data.senate_passage = senate_passage;
				newBill.bill.data.enacted = enacted;
				newBill.bill.data.vetoed = vetoed;
				newBill.bill.data.cosponsors = currbill.cosponsors;
				newBill.bill.data.committees = currbill.committees;
				newBill.bill.data.primary_subject = currbill.primary_subject;
				newBill.bill.data.summary = currbill.summary;
				newBill.bill.data.latest_major_action_date = latest_major_action;
				var action = []; // action is an array
				action.push(currbill.latest_major_action);
				newBill.bill.data.latest_major_action = action;
				
				// SAVE THE BILL TO THE DATABASE
				newBill.save(function(err){
					if (err)
						throw err;
					
					console.log("FINISHED SAVING BILL: " + currbill.bill_id);
				});
			}
			
	});
}

// convert date in propublica to mongodb query date format
var strToDate = function(dateString){
	if (dateString == null)
		return;
	
	dateString = dateString.replace(',', '');
	
	var split = dateString.split(" ");
	var month = split[0];
	var monthStr = "";
	var day = split[1];
	var year = split[2];
	
	if (day.length == 1)
		day = "0" + day;
	
	// convert month to number
	if (month == "January")
		monthStr = "01";
	else if (month == "February")
		monthStr = "02";
	else if (month == "March")
		monthStr = "03";
	else if (month == "April")
		monthStr = "04";
	else if (month == "May")
		monthStr = "05";
	else if (month == "June")
		monthStr = "06";
	else if (month == "July")
		monthStr = "07";
	else if (month == "August")
		monthStr = "08";
	else if (month == "September")
		monthStr = "09";
	else if (month == "October")
		monthStr = "10";
	else if (month == "November")
		monthStr = "11";
	else if (month == "December")
		monthStr = "12";
	
	// convert to date
	var date = "<" + year + "-" + monthStr + "-" + day + ">";
	return date;
}

setTimeout(function(){getBills(urlHouseIntroduced)}, 20000);
setTimeout(function(){getBills(urlHouseUpdated)}, 20000);
setTimeout(function(){getBills(urlSenateIntroduced)}, 20000);
setTimeout(function(){getBills(urlSenateUpdated)}, 20000);

setInterval(function(){ getBills(urlHouseIntroduced);}, updateInterval);
setInterval(function(){ getBills(urlHouseUpdated);}, updateInterval); 
setInterval(function(){ getBills(urlSenateIntroduced);}, updateInterval); 
setInterval(function(){ getBills(urlSenateUpdated);}, updateInterval); 