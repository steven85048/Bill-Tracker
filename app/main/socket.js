// -------------------------------------------------------------------------------//
// ---------------------- HANDLES WEBSOCKET CONNECTIONS------------------------//
// -------------------------------------------------------------------------------//
var UserTrack = require('../database/UserTrack.js');

module.exports = function(io){
	
	// HANDLE USER CONNECT; ADD USER AND DATA TO DATABASE
	io.use(function(socket, next) {
		//console.log(socket.id);

		// HANDLING SOCKET DISCONNECTION
		socket.on('disconnect', function () {
			// REMOVE THE USER DISCONNECTED FROM DATABASE
			UserTrack.find({'track.socket' : socket.id}).remove().exec();
		});
		
		// ADD SOCKET TO DATABASE AND VERIFY CONNECTION
		console.log("Query: ", socket.handshake.query);
		addSocketToDatabase(socket.id, socket.handshake.query.data);
		return next();
	});
	
	// ADDS SOCKET TO THE DATABASE WITH CORRESPONDING IDS
	var addSocketToDatabase = function(socketid, billids){
		var newTrack = new UserTrack();
		
		// SAVE USER DATA
		newTrack.track.socket = socketid;
		newTrack.track.billIds = JSON.parse(billids) ;
		
		// SAVE INTO DATABASE
		newTrack.save(function(err){
			if (err)
				throw err;
		});
	}
}