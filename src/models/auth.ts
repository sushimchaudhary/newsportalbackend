const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    email: {type: String, require:true},
    password:{type: String, require: true}
})



module.exports = mongoose.model('Auth', authSchema)