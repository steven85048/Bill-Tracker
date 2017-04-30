var pageNum = "1";
var currState = "getrecentintroduced";

// WHEN WINDOW IS READY
$(document).ready(function(){	
	var pageNum = getCurrPageNumber();
	modifyList(pageNum);
	
	// LISTENERS FOR STATE CHANGE BUTTONS
	document.getElementById("button_introduced").addEventListener('click', function(){
		currState = "getrecentintroduced";
		var currPage = getCurrPageNumber();
		getBillData(populateTable, currState, currPage);
		snackbarMessageLong("SHOWING RECENTLY INTRODUCED BILLS");
	});

	document.getElementById("button_updated").addEventListener('click', function(){
		currState = "getrecentupdated";
		var currPage = getCurrPageNumber();
		getBillData(populateTable, currState, currPage);
		snackbarMessageLong("SHOWING RECENTLY UPDATED BILLS");

	});
	
	/// GET BILLS AND POPULATE PAGE WITH DATA
	getBillData(populateTable, currState, pageNum);
		
});

// GETS CURRENT PAGE NUMBER FROM THE PAGE HASH
var getCurrPageNumber = function(){
	var pageNum = "1";
	var hash = location.hash.replace( /^#/, '' );
	if (hash != "")
		pageNum = hash;
	
	return pageNum;
}

// MODIFIES LIST BASED ON PAGE NUMBER
var modifyList = function(pageNum){
	var num = parseInt(pageNum);
	
	// first, reset all list elements
	$(".pagination_element").attr("class", "pagination_element");
	$(".pagination_element").children().attr("class", "");
	
	// then set the element inactive
	var selectedElement = $(".pagination_element:eq(" + num + ")");
	selectedElement.attr("class", "pagination_element disabled disabled_mark");
	selectedElement.children().attr("class", "not-active");
}

// CHECKS FOR PAGE NUM CHANGES
$(window).on('hashchange', function(e){
	// GET THE PAGE NUMBER
	var hash = location.hash.replace( /^#/, '' );
	pageNum = hash;
	modifyList(pageNum);
	
	getBillData(populateTable, currState, pageNum);
});

// AJAX CALL TO SERVER FOR BILL IDS
var getBillData = function(populateTable, selectionUrl, page){
	var title = "";
	if(currState == "getrecentupdated")
		title = "Recently Updated Bills";
	else
		title = "Recently Introduced Bills";
	
	// change title and make inner card fill whole page while loading
	$("#main_title_header").html(title);
	$(".inner_card").attr("class", "card well inner_card");
	
	// clear table now so no lag
	var selectTable = $('#bill_table');
	selectTable.empty();
	
	$.ajax({
		type: "GET",
		url : selectionUrl + "/" + page,
		success: function(res) {
			//console.log(JSON.stringify(res));
			populateTable(res);
		}
	});
}
//<embed width="191" height="207" name="plugin" src="https://www.gpo.gov/fdsys/pkg/BILLS-115hr1795ih/pdf/BILLS-115hr1795ih.pdf" type="application/pdf">
// POPULATE PAGE WITH DATA USING BILL DATA JSON
var populateTable = function(billData){
	var selectTable = $('#bill_table');
	
	var rowCount = 0;
	var currRow = document.createElement("tr");
	for (var i = 0 ; i < billData.length; i++){						
		// IF THERE ARE ALREADY 4 elements in the row
		if ((rowCount % 4 == 0) && rowCount != 0){
			selectTable.append(currRow);
			currRow = document.createElement("tr");
			rowCount = 0;
		}
		
		// CREATE TABLE ELEMENT THAT HOLDS EVERYTHING
		var tableElement = document.createElement("td");
		tableElement.setAttribute("class", "bill_element well");	
		
		// ADD THE ID OF THE BILL AT THE TOP
		var billIdHeader = document.createElement("h4");
		billIdHeader.innerHTML = "<b>" + billData[i].bill.main.id + "</b>";
		billIdHeader.setAttribute("class", "bill_id_header");
		tableElement.appendChild(billIdHeader);
		
		
		// ATTACH NAME OF BILL TOO
		var billName = document.createElement("h5");
		var billTitle = billData[i].bill.main.title;
		if (billTitle.length > 60)
			billTitle = billTitle.substring(0, 100) + "...";
		else
			billTitle = billTitle.substring(0,100);
		
		billTitle = billTitle;
		
		billName.setAttribute("style", "text-align:center; text-size: 15px;")
		billName.innerHTML = billTitle;
		tableElement.appendChild(billName);
		
		// ADD ADD TO PROFILE BUTTON
		var addButton = document.createElement("button");
		addButton.setAttribute("class", "btn btn-sm");
		addButton.setAttribute("type", "button");
		addButton.setAttribute("style", " margin-left: 68px; margin-top: 15px;"); // center button
		addButton.innerHTML = '<i class = "glyphicon glyphicon-plus"></i> Add';
		
		var buttonGroup = document.createElement("div");
		buttonGroup.setAttribute("class", "button_group");
		
		// ADD GPO URL BUTTON
		var gpoButton = document.createElement("button");
		gpoButton.setAttribute("class", "btn btn-sm");
		gpoButton.setAttribute("type", "button");
		gpoButton.innerHTML = '<i class = "glyphicon glyphicon-search"></i> GPO Pdf';
		
		// ADD GOVTRACK BUTTON
		var govtrackButton = document.createElement("button");
		govtrackButton.setAttribute("class", "btn btn-sm");
		govtrackButton.setAttribute("type", "button");
		govtrackButton.setAttribute("style", "float: right;")
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
		}(billData[i].bill.data.govtrack_url, billTitle));
		
		// CHECK IF THERE IS NO GPO PDF AVAILABLE
		var gpourl = billData[i].bill.data.gpo_pdf_uri;
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
			}(gpourl, billTitle));
		} else {
			// if disabled, set button disabled as well
			gpoButton.setAttribute("class", "btn btn-sm disabled");
		}
		
		// ADD TO PROFILE BUTTON ACTION LISTENER
		addButton.addEventListener('click', function(billId){
			return function(){
				$.ajax({
					type: "POST",
					url : "addBillId/" + billId,
					success: function(res) {
						
						// IF REROUTED TO LOGIN PAGE
						if(res.includes("Authentication")){
							document.location.href = "/login";
						} else {
							snackbarMessageShort(res);
						}
					}
				});
			}
		} (billData[i].bill.main.id));
		
		// ADD GPO/GOVTRACK BUTTONS
		buttonGroup.appendChild(govtrackButton);
		buttonGroup.appendChild(gpoButton);

		// ADD ADD/ BUTTON GROUP
		tableElement.appendChild(buttonGroup);
		tableElement.appendChild(addButton);
		
		// ADD TD TO TABLE ROW
		currRow.appendChild(tableElement);

		rowCount++;
	}
	
	// reset inner card to previous state
	$(".inner_card").attr("class", "card well");

}

// SEND MESSAGE TO SNACKBAR
var snackbarMessageShort = function(message){
	var snackbar = document.getElementById("snackbar");
	snackbar.innerHTML = message;
	snackbar.setAttribute("class", "showShort");
	setTimeout(function(){ snackbar.setAttribute("class", ""); }, 700);
}

var snackbarMessageLong = function(message){
	var snackbar = document.getElementById("snackbar");
	snackbar.innerHTML = message;
	snackbar.setAttribute("class", "showLong");
	setTimeout(function(){ snackbar.setAttribute("class", ""); }, 2500);
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
