// -------------------------------------------------------------------------------//
// ---------------------- MONGOOSE SCHEMA FOR STORING BILLS ------------------------//
// -------------------------------------------------------------------------------//

var mongoose = require('mongoose');

var schema = mongoose.Schema({
        bill : {
                main : {
                    id : String,
					title : String,
                },
				data : {
					bill_uri : String,
					sponsor_id : String,
					gpo_pdf_uri : String,
					congressdotgov_url : String,
					govtrack_url : String,
					introduced_date : Date,
					active : String,
					house_passage : Date,
					senate_passage : Date,
					enacted : Date,
					vetoed : Date,
					cosponsors : String,
					committees : String,
					primary_subject : String,
					summary : String,
					latest_major_action_date : Date,
					latest_major_action : [String]
				}
        }});

module.exports = mongoose.model('Bill', schema);