const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    owner_id: String,
    name: String,
    desc: String,
    banner: String,
    address:String,
    contact:String,
    email:String,
    locCoords: {lng:String,lat:String},
    account:{type:Number,default:0}
},{
    timestamps:true
});

module.exports =  mongoose.model('shop', ShopSchema);