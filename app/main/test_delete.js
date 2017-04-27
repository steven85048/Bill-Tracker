// GLOBAL VARIABLES
var apikey = require('./api_key.js').apikey;
var req = require('request');

var getIntroducedBills = function() { 
	var url = 'https://api.propublica.org/congress/v1/115/house/bills/updated.json';
	var headers = {
		'X-API-Key' : apikey
	};
	
	// perform request
	req.get({ url: url, headers: headers}, function(err, req, body) {
		if (err)
			console.log(err);
		else {
			console.log(body);
		}
	});
};

getIntroducedBills();