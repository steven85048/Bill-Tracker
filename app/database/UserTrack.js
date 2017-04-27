// -------------------------------------------------------------------------------//
// ---------------------- MONGOOSE SCHEMA FOR STORING USER TRACKED BILLS ------------------------//
// -------------------------------------------------------------------------------//

var mongoose = require('mongoose');

var schema = mongoose.Schema({
        track : {
            socket : String,
			billIds : [String] 
        }});

module.exports = mongoose.model('UserTrack', schema);