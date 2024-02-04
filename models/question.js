'use strict';

const mongoose = require("mongoose");

const schema = mongoose.Schema({
	abusive_reports_count: Number,
	answer: String,
	my_feedback: String,
	negative_feedbacks_count: Number,
	positive_feedbacks_count: Number,
	product_id: {
        type: String
    },
	question: String,
    user_id: {
        type: String
    }
},
{ versionKey: false, timestamps: true }
);

module.exports = new mongoose.model("Questions", schema);