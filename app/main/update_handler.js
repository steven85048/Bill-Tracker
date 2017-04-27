// -------------------------------------------------------------------------------//
// ----------------- HANDLES MESSAGES FROM THE CHILD PROCESS ---------------------//
// -------------------------------------------------------------------------------//
var UserTrack = require('../database/UserTrack.js');
var Bill = require('../database/Bill.js');

module.exports = function(child, io){
	// PING ALL USERS UPON RECEPTION OF BILLID FROM CHILD PROCESS
	child.on('message', function(billId) {
		console.log("RECEIVED BILL: " + billId);
		findUpdatedBill(billId, pingAllUsers);
	});
	
	// GET NEW BILL DATA FROM THE DATABASE AND PING ALL USERS IF SUCCESSFUL
	var findUpdatedBill = function(billid, pingAllUsers) {
		Bill.findOne({'bill.main.id' : billid}, function(err, bill){
			if (err)
				console.log(err);
			else if (bill){
				// if bill already exists, callback to send data to all connected users
				pingAllUsers(bill,billid);
			}
			else // if bill doesn't exist (shouldn't happen)
				console.log("BILL DOES NOT EXIST IN DATABASE")
		});
	}
	
	//PING ALL USERS CONNECTED TO BILL WITH UPDATED DATA
	var pingAllUsers = function(billData, billid){
		// FIND ALL USERS CORRESPONDING WITH THE BILLID
		UserTrack.find({'track.billids' : billid}, function(err, Track){
			// EMIT DATA TO ALL USERS WITH BILL ID
			for (var i = 0 ; i < Track.length; i++){
				var currUser = Track[i];
				
				// SEND UPDATED BILL DATA TO THE USER
				if (io.sockets.connected[currUser.socket]){
					io.sockets.connected[currUser.socket].emit('update', billData);
				}
			}
		});
	}
}