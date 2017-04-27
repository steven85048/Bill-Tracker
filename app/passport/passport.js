// -------------------------------------------------------------------------------//
// ---------- HANDLES AUTHENTICATION OF THE USER THROUGH PASSPORT ----------------//
// -------------------------------------------------------------------------------//

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../database/User.js');

module.exports = function(passport, auth) {
	// USER SERIALIZATION OR DESERIALIZATION
	
	// IF USER SESSION EXISTS, SERIALIZE 
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	
	// IF USER SESSION DOES NOT EXIST, SERIALIZE FROM DATABASE
	passport.deserializeUser(function(id, done) {
		// FIND USER ID HERE AND RETURN USER SESSION
		User.findById(id, function(err, user){
			done(err, user);
		});
	});
	
	// GOOGLE AUTHENTICATION
	
	
	passport.use(new GoogleStrategy({ // GET EXISTING PARAMETERS FOR GOOGLE AUTH FROM AUTH.JS
		clientID : auth.googleAuth.clientId,
		clientSecret : auth.googleAuth.clientSecret,
		callbackURL : auth.googleAuth.callbackURL,
	}, function(token, refreshToken, profile, done){
		// WAIT UNTIL DATA RETURNED:
		process.nextTick(function() {
			// ATTEMPT TO FIND USER IN DATABASE : profile.id
			User.findOne({'user.google.id' : profile.id}, function(err, user){
				if (err)
					return done(err);
				if (user){
					// USER ALREADY EXISTS
					return done(null, user);
				} else {
					// CREATE NEW USER AND SAVE IN DB
					var newUser = new User();
					
					newUser.user.google.id = profile.id;
					newUser.user.google.token = token;
					newUser.user.google.name = profile.displayName;
					newUser.user.google.email = profile.emails[0].value;
					
					newUser.user.data.trackedBills = [];
					
					newUser.save(function(err){
						if (err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));
}