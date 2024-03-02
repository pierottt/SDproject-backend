const express = require('express');

const {getRent, getRents,addRent,updateRent,deleteRent, getChart} = require('../controllers/rents');


const router = express.Router({mergeParams:true});

const {protect,authorize}  =require('../middleware/auth');

router.route('/').get(protect,getRents).post(protect,authorize('admin','user'),addRent);
router.route('/chart').get(protect,getChart);

router.route('/:id').get(protect,getRent).put(protect,authorize('admin','user'),updateRent)
                    .delete(protect,authorize('admin','user'),deleteRent);

module.exports=router;