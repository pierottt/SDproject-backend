const Rent = require('../models/Rent');
const mongoose = require('mongoose');
const Car = require('../models/Car');

//@desc     Get all rents
//@route    GET /api/v1/rents
//@accees   Private
exports.getRents=async(req,res,next)=>{
    let query;
    //General user can see only their rents!
    if(req.user.role !== 'admin'){
        query=Rent.find({user:req.user.id}).populate({
            path:'car',
            select:'name address tel'
        });
    } else{ //If you are an admin, you can see all!
        if(req.params.carId){
            console.log(req.params.carId);
            query = Rent.find({car:req.params.carId}).populate({
                path:'car',
                select:'name address tel'
            });
        } else {
            query = Rent.find().populate({
                path:'car',
                select:'name address tel'
            });
        }
    }
    try{
        const rents=await query;

        res.status(200).json({
            success:true,
            count:rents.length,
            data:rents
        });
    } catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find rent"});
    }
}

//@desc     Get single rent
//@route    GET /api/v1/rents/:id
//@accees   Public
exports.getRent=async(req,res,next)=>{
    try{
        const rent = await Rent.findById(req.params.id).populate({
            path: 'car',
            select: 'name address tel'
        });
        if(!rent){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:rent});
    }catch (error){
        console.log(error);
        res.status(500).json({success:false,message:"Cannot find rent"});
    }
}
//@desc     Add rent
//@route    POST /api/v1/cars/:carId/rents/
//@accees   Private
exports.addRent=async(req,res,next)=>{
    try{
        req.body.car=req.params.carId;
        const car = await Car.findById(req.params.carId);
        if(!car){
            return res.status(404).json({success:false, message:`No car with the id of ${req.params.carId}`});
        }
        //add user Id to req.body
        req.body.user = req.user.id;
        //Check for existed rent
        const existedRent = await Rent.find({user:req.user.id});
        //If the user is not an admin, they can only create 3 rent
        if(existedRent.length>=3 && req.user.role!=='admin'){
            return res.status(400).json({success:false, message:`The user with ID ${req.user.id} has already made 3 rent`});
        }
        const rent = await Rent.create(req.body);
        res.status(200).json({success:true, data:rent});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,message:"Cannot create rent"});
    }
}
//@desc     Update rent
//@route    PUT /api/v1/rents/:id
//@accees   Private
exports.updateRent=async(req,res,next)=>{
    try{
        let rent = await Rent.findById(req.params.id);
        if(!rent){
            return res.status(404).json({success:false, message:`No rent with the id of ${req.params.id}`});
        }
        //Make sure user is the rent owner
        if(rent.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this rent`});
        }
        rent = await Rent.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({success:true, data:rent});
    } catch (error){
        console.log(error);
        res.status(500).json({success:false,message:"Cannot update rent"});
    }
}
//@desc     Delete rent
//@route    DELETE /api/v1/rents/:id
//@accees   Private
exports.deleteRent=async(req,res,next)=>{
    try{
        const rent = await Rent.findById(req.params.id);
        if(!rent){
            return res.status(404).json({success:false, message:`No rent with the id of ${req.params.id}`});
        }
         //Make sure user is the rent owner
         if(rent.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this rent`});
        }
        await rent.deleteOne();
        res.status(200).json({success:true, data:rent});
    } catch (error){
        console.log(error);
        res.status(500).json({success:false,message:"Cannot delete rent"});
    }
}