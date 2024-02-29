const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    name : {
        type : String,
        require : [true,'Please add a name'],
        unique : true,
        trim : true,
        maxlength:[50,'Name can not be more than 50 chaeacters']
    },
    address:{
        type:String,
        required :[true,'Pleade add an address']
    },
    tel : {
        type :String
    }
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
CarSchema.virtual('rents', {
    ref:'Rent',
    localField:'_id',
    foreignField:'car',
    justOne:false
});

//Cascade delete rents when a car is deleted
CarSchema.pre(`deleteOne`,{document:true, query:false}, async function(next){
    console.log(`Rents being removed from car ${this._id}`);

    await this.model(`Rent`).deleteMany({car: this._id});

    next();
})

module.exports = mongoose.model('Car',CarSchema);