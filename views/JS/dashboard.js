// GLOBAL VARIABLES
var socketURL = 'http://localhost:8080/';

// WHEN WINDOW IS READY
$(document).ready(function(){
	// get bill ids from the server for current user
	var userids = getUserIds(socketConnection);
});

// AJAX CALL TO SERVER FOR BILL IDS
var getUserIds = function(socketconn){
	$.ajax({
		type: "GET",
		url : "/userbills",
		success: function(res) {
			console.log(res);
			socketconn(res);
		}
	});
}

// HANDLES THE SOCKET CONNECTION WITH THE SERVER
var socketConnection = function(billIds){
	// ON CONNECTION, SENDS BILL IDS BACK TO SERVER
	var socket = io(socketURL, {query : "data=" + billIds });
  
	socket.on('update', function(data) {
		console.log(data);
		socket.emit('update', {data: 'data'});	
	});
}