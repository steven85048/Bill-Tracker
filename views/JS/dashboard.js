// GLOBAL VARIABLES
var socketURL = 'http://localhost:8080/';

// WHEN WINDOW IS READY
$(document).ready(function(){
	// get bill ids from the server for current user
	var userids = getUserIds(socketConnection, receiveData);	
});

// FIRST, GET JSON DATA
var receiveData = function(userids, addDataToTable){	

	// LOOP THROUGH IDS AND ADD EACH TO PAGE
	for (var i = 0 ; i < userids.length; i++){
		$.ajax({
			type: "GET",
			url : "/getBillData/" + userids[i],
			success : function(res){
				addDataToTable(res);
			}
		});
	}
}

// ADD ELEMENT TO TABLE
var addElementToPage = function(billElement){
	billElement = JSON.parse(billElement);
	
	// GET RELEVANT DATA
	var billid = billElement.bill.main.id;
	var billtitle = billElement.bill.main.title;
	var gpoUrl = billElement.bill.data.gpo_pdf_uri;
	var govtrack = billElement.bill.data.govtrack_url;
	
	console.log(govtrack);
	
	// CREATE MAIN CARD WRAPPER
	var mainCardDiv = document.createElement("div");
	mainCardDiv.setAttribute("class", "data_card card");
	
	// HEADER OF CARD
	var divHeader = document.createElement("h4");
	divHeader.setAttribute("class", "card-header");
	divHeader.innerHTML = billid;
	mainCardDiv.appendChild(divHeader);
	
	// BODY OF CARD
	var bodyWrapper = document.createElement("div");
	bodyWrapper.setAttribute("style", "padding: 20px;")

	
	// TITLE OF CARD IN BODY
	var billName = document.createElement("h6");
	billName.setAttribute("class", "card-title");
	billName.innerHTML = billtitle;
	bodyWrapper.appendChild(billName);
	
	var buttonGroup = document.createElement("div");
	buttonGroup.setAttribute("class", "button_group");
	
	// ADD GPO URL BUTTON
	var gpoButton = document.createElement("button");
	gpoButton.setAttribute("class", "btn btn-outline-primary btn-md");
	gpoButton.setAttribute("type", "button");
	gpoButton.setAttribute("style", "cursor:pointer;")
	gpoButton.innerHTML = '<i class = "glyphicon glyphicon-search"></i> GPO Pdf';
	
	// ADD GOVTRACK BUTTON
	var govtrackButton = document.createElement("button");
	govtrackButton.setAttribute("class", "btn btn-outline-primary btn-md");
	govtrackButton.setAttribute("type", "button");
	govtrackButton.setAttribute("style", "margin-left: 50px; cursor: pointer;")
	govtrackButton.innerHTML = '<i class = "glyphicon glyphicon-search"></i> Govtrack';
	
	
	// ADD GOVTRACK BUTTON ACTION LISTENER
	govtrackButton.addEventListener('click', function(govUrl, title){
		return function() {
			
			var modal = $("#modal_container");
			var modal_title = $("#modal_title");
			var modal_body = $("#modal-body");
			
			modal_title.html(title); // set title
			// CLEAR CONTENTS OF BODY AND REPLACE
			modal_body.empty();
			
			modal_body.append("<div class='box'><iframe src='" + govUrl + "' width = '100%' height = '100%'></iframe></div>").fadeIn();
			
			modal.css("display", "block");
			
		};
	}(govtrack, billtitle));
	
	// CHECK IF THERE IS NO GPO PDF AVAILABLE
	var gpourl = gpoUrl;
	var gpoEnabled = true;
	if(gpourl == "")
		gpoEnabled = false;
	
	if (gpoEnabled){
		// ADD GPO URL ACTION LISTENER
		gpoButton.addEventListener('click', function(url, title){
			return function() {
				var modal = $("#modal_container");
				var modal_title = $("#modal_title");
				var modal_body = $("#modal-body");
				
				modal_title.html(title); // set title
				// CLEAR CONTENTS OF BODY AND REPLACE
				modal_body.empty();
				modal_body.append(convertToEmbed(url, "100%", "100%")).fadeIn();
				
				modal.css("display", "block");
				
			};
		}(gpoUrl, billtitle));
	} else {
		// if disabled, set button disabled as well
		gpoButton.setAttribute("class", "btn btn-md btn-outline-primary disabled");
	}
	
	buttonGroup.appendChild(gpoButton);
	buttonGroup.appendChild(govtrackButton);
	bodyWrapper.appendChild(buttonGroup);
	
	// Finally, append the bodyWrapper
	mainCardDiv.append(bodyWrapper);
	
	// APPEND THE WHOLE CARD TO THE DATA_WRAPPER
	$("#data_wrapper").append(mainCardDiv);
}

// AJAX CALL TO SERVER FOR BILL IDS
var getUserIds = function(socketconn, receiveData){
	$.ajax({
		type: "GET",
		url : "/userbills",
		success: function(res) {
			receiveData(JSON.parse(res), addElementToPage);
			socketconn(res);
		}
	});
}

// HANDLES THE SOCKET CONNECTION WITH THE SERVER
var socketConnection = function(billIds){
	// ON CONNECTION, SENDS BILL IDS BACK TO SERVER
	var socket = io(socketURL, {query : "data=" + billIds });
  
	socket.on('update', function(data) {
		socket.emit('update', {data: 'data'});	
	});
}

// CONVERT THE PDF SRC INTO AN HTML EMBED
var convertToEmbed = function(src, width, height){
	// CREATE EMBEDDED PDF IN PAGE; have to add as a string since setting src attribute automatically routes to server static path
		var embedHTML = "<embed width='" + width + "' height='" + height + "' class='embeddedHTML' src=" + src + " type='application/pdf'>"
		
		// SHITTY DOM HACK LUL
		var child = document.createElement('div');
		child.innerHTML = embedHTML;
		child = child.firstChild;
		return child;
}