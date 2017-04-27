// WHEN WINDOW IS READY
$(document).ready(function(){
	/// GET BILLS AND POPULATE PAGE WITH DATA
	getBillData(populateTable, "getrecentupdated", 1);
});

// AJAX CALL TO SERVER FOR BILL IDS
var getBillData = function(populateTable, selectionUrl, page){
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
		// IF THERE IS NO GPO PDF AVAILABLE
		if (billData[i].bill.data.gpo_pdf_uri == "")
			continue;
		
		// IF THERE ARE ALREADY 4 elements in the row
		if ((rowCount % 4 == 0) && rowCount != 0){
			selectTable.append(currRow);
			currRow = document.createElement("tr");
			rowCount = 0;
		}
		
		// ADD EMBED AS CHILD OF TD
		var tableElement = document.createElement("td");
		tableElement.setAttribute("class", "bill_element well");	
		
		// CREATE EMBEDDED PDF IN PAGE; have to add as a string since setting src attribute automatically routes to server static path
		var embedHTML = "<embed width='191' height='207' class='embeddedHTML' src=" + billData[i].bill.data.gpo_pdf_uri + " type='application/pdf'>"
		
		// SHITTY DOM HACK LUL
		var child = document.createElement('div');
		child.innerHTML = embedHTML;
		child = child.firstChild;
		tableElement.appendChild(child);
		
		// ATTACH NAME OF BILL TOO
		var billName = document.createElement("h6");
		var billTitle = billData[i].bill.main.title;
		if (billTitle.length > 60)
			billTitle = billTitle.substring(0, 60) + "...";
		else
			billTitle = billTitle.substring(0,60);
		
		billName.setAttribute("style", "text-align:center;")
		billName.innerHTML = billTitle;
		tableElement.appendChild(billName);
		
		// ADD ADD TO PROFILE BUTTON
		var addButton = document.createElement("button");
		addButton.setAttribute("class", "btn");
		addButton.setAttribute("type", "button");
		addButton.innerHTML = "add";
		tableElement.appendChild(addButton);
		
		// ADD ADD TO PROFILE BUTTON
		var addButton = document.createElement("button");
		addButton.setAttribute("class", "btn");
		addButton.setAttribute("type", "button");
		addButton.setAttribute("style", "float:right")
		addButton.innerHTML = "expand";
		tableElement.appendChild(addButton);
		
		// ADD TD TO TABLE ROW
		currRow.appendChild(tableElement);

		rowCount++;
	}
}
