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
	
	// GETS THE DATA CORRESPONDING TO A BILL OF A CERTAIN ID
	app.post('/addBillId/:billId', function(req, res){
		// get the bill id
		var bill_id = req.params.billId;
	});
	
	// RETURN THE BILLS ATTACHED TO USER IN CURRENT SESSION
	app.get('/userbills', isLoggedIn, function(req, res){
		// return the user bills
		var bills = req.user.user.data.trackedbills;
		res.send(JSON.stringify(bills));
	});
	
	// RETURN THE MOST RECENTLY UPDATED BILLS IN A CERTAIN RANGE(DEPENDING ON PAGE)
	app.get('/getrecentupdated/:page', function(req, res){
		var page = req.params.page;
		Bill.find().sort({"bill.data.latest_major_action_date" : -1}).limit(50).skip(20 * (page - 1)).exec(function(err, docs){
			res.send(docs);
		});
	});
	
	// RETURN THE MOST RECENTLY INTRODUCED BILLS IN A CERTAIN RANGE(DEPENDING ON PAGE)
	app.get('/getrecentintroduced/:page', function(req, res){
		var page = req.params.page;
		Bill.find().sort({"introduced_date" : -1}).limit(30).skip(20 * (page - 1)).exec(function(err, docs){
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