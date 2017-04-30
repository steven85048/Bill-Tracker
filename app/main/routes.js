// -------------------------------------------------------------------------------//
// ---------------------- HANDLES ROUTES FROM THE CLIENT ------------------------//
// -------------------------------------------------------------------------------//
var Bill = require('../database/Bill.js');

module.exports = function(app, passport) {
	
	/************************ ROUTES FOR RENDERING PAGES ***********************/
	
	// home page
	app.get('/', function(req, res){
		
	});
	
	// login page; google plus auth
	app.get('/login', function(req, res){
		res.render('login.ejs');
	});
	
	// displays all the hooked prices to the user
	app.get('/dashboard', isLoggedIn, function(req, res){
		res.render('dashboard.ejs')
	});
	
	// browses various bills at a certain point
	app.get('/browse', function(req,res){
		res.render('browse.ejs');
	});
	
	// signs the user out of session
	app.get('/logout', function(req, res){
		req.logout();
		res.render('login.ejs');
	});
	
	/************************ GOOGLE PLUS AUTHENTICATION ***********************/

	// profile gets us their basic information including their name
	// email gets their emails
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback',
			passport.authenticate('google', {
					successRedirect : '/dashboard',
					failureRedirect : '/login' 
			}));
	
	/*************************** SERVER SIDE ROUTES ************************/
	
	// ADDS BILL TO USER
	app.post('/addBillId/:billId', isLoggedIn, function(req, res){
		// get the bill id
		var bill_id = req.params.billId;
		
		// get the user from the session
		var user = req.user;
		
		//check for duplicates
		for (var i = 0 ; i < user.user.data.trackedbills.length; i++){
			if (user.user.data.trackedbills[i] == bill_id){
				res.end("Duplicate Bill: " + bill_id);
				return;
			}
		}
		
		// if no duplicates, save
		user.user.data.trackedbills.push(bill_id);
		
		// save mondified user
		user.save(function(){
			console.log("SAVED BILL TO USER");
		});
		
		res.end("Bill Successfully Saved: " + bill_id);

	});
	
	// GETS THE BILL DATA OF BILLID PARAMETER
	app.get('/getBillData/:billId', function(req, res){
		// get bill id
		var bill_id = req.params.billId;
		Bill.findOne({'bill.main.id' : bill_id}, function(err, docs){
			res.end(JSON.stringify(docs));
		});
	});
	
	// RETURN THE BILLS ATTACHED TO USER IN CURRENT SESSION
	app.get('/userbills', isLoggedIn, function(req, res){
		// get the user bills
		var bills = req.user.user.data.trackedbills;
		res.end(JSON.stringify(bills));

	});
	
	// RETURN THE MOST RECENTLY UPDATED BILLS IN A CERTAIN RANGE(DEPENDING ON PAGE)
	app.get('/getrecentupdated/:page', function(req, res){
		var page = req.params.page;
		Bill.find().sort({"bill.data.latest_major_action_date" : 1}).limit(25).skip(20 * (page - 1)).exec(function(err, docs){
			res.send(docs);
		});
	});
	
	// RETURN THE MOST RECENTLY INTRODUCED BILLS IN A CERTAIN RANGE(DEPENDING ON PAGE)
	app.get('/getrecentintroduced/:page', function(req, res){
		var page = req.params.page;
		Bill.find().sort({"bill.data.introduced_date" : 1}).limit(25).skip(20 * (page - 1)).exec(function(err, docs){
			res.send(docs);
		});
	});
	
	/*************************** EXTRA ************************/

	
	// MIDDLEWARE TO CHECK IF USER IS ALREADY LOGGED IN
	function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
                return next();

        // if they aren't redirect them to the home page
        res.redirect('/login');
	}
}