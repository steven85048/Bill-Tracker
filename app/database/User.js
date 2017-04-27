var mongoose = require('mongoose');

var schema = mongoose.Schema({
        user : {
                google : {
                    id : String,
                    token : String,
                    email : String,
                    name : String,
                },
				data : {
					trackedbills : [String]
				}
        }});

module.exports = mongoose.model('User', schema);