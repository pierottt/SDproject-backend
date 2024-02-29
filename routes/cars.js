const express=require('express');
const {getCar, getCars,createCar,updateCar,deleteCar}= require('../controllers/cars');

//Include other resources routers
const rentRouter = require('./rents');

const router=express.Router();

const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:carId/rents/',rentRouter);

router.route('/').get(getCars).post(protect,authorize('admin'),createCar);
router.route('/:id').get(getCar).put(protect,authorize('admin'),updateCar).delete(protect,authorize('admin'),deleteCar);


module.exports=router;