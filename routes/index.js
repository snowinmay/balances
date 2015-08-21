var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect('mongodb://snowinmay:yujianqi2011@ds033133.mongolab.com:33133/prince-balances',function(){
// mongoose.connect('mongodb://localhost/balances',function(){
	console.log("Mongodb connected")
})
var Balance = mongoose.model('Balance', { 
	content: String, 
	price: Number, 
	type: Boolean, 
	from:String, 
	createdAt: { type: Date, default: Date.now()},
    updatedAt: { type: Date, default: Date.now()}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//index
router.get('/balances', function(req, res, next) {
	
	Balance.find({},function(err,docs){
		res.render('balances/index', { 
			title: '收支明细' ,
			docs: docs,
			moment: moment
		});
	})
});

//new
router.get('/balances/new', function(req, res, next) {
  res.render('balances/new', { title: '新增收支明细' });
});

//edit
router.get('/balances/:id/edit', function(req, res, next) {
	Balance.findById(req.params.id,function(err,doc){
		res.render('balances/edit', {
			title: '编辑收支明细',
			doc:doc
		});
	})
});

//create
router.post('/balances', function(req, res, next) {	
	req.body.createdAt = new Date();
	var balance = new Balance(req.body);	
	// console.log(balance)
	balance.save(function (err) {
	  if (!err){
	  	res.redirect('/balances')
	  }else{
	  	res.redirect('/balances/new')
	  }
	});
});

//update
router.all('/balances/:id', function(req, res, next) {
	Balance.findById(req.params.id,function(err,doc){
		if (req.body && req.body._method == 'put') {
			req.body.createdAt = new Date();
			var conditions = {_id : doc._id};
			var update     = {$set : req.body};
			var options    = {upsert : true};
			Balance.update(conditions, update, options, function(error){
			    if(error) {
			        console.log(error);
			        res.redirect('/balances/:id/edit')
			    } else {
			        console.log('update ok!');
			        res.redirect('/balances')
			    }
			    //关闭数据库链接
			    //db.close();
			});
		}
		if (req.method == 'DELETE') {
			console.log(req.method)
			var conditions = {_id : doc._id};
			Balance.remove(conditions, function(error){
			    if(error) {
			        console.log(error);
			        res.json({"data":"0"})
			    } else {
			        console.log('delete ok!');
			        res.json({"data":"ok","status":"1"})
			    }
			    //关闭数据库链接
			    //db.close();
			});
		}
		console.log(req.method)
	})
});

// 删除记录
// var conditions = {username: 'emtity_demo_username'};
// mongooseModel.remove(conditions, function(error){
//     if(error) {
//         console.log(error);
//     } else {
//         console.log('delete ok!');
//     }
//  
//  
//     //关闭数据库链接
//     db.close();
// });

module.exports = router;
