var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');
var nodeExcel = require('excel-export');

var pagination = {}
var page_size = 10;

mongoose.connect('mongodb://localhost/balances',function(){
	console.log("Mongodb connected")
})
var Balance = mongoose.model('Balance', { 
	content: String, 
	price: Number, 
	type: Boolean, 
	from:String, 
	// time: String,
	time: { type: Date, default: Date.now()},
	createdAt: { type: Date, default: Date.now()},
    updatedAt: { type: Date, default: Date.now()}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//index
router.get('/balances', function(req, res, next) {
	console.log(moment().format('YYYY-MM-DD HH:mm'))
	pagination.current = parseInt(req.query.page) || 1;
	Balance.count(function(err, count){
		pagination.page_numbers = Math.ceil(count/page_size);
		pagination.count = count;
		pagination.start = parseInt(pagination.current)-2;
		pagination.end = pagination.start + 4;
		if (pagination.page_numbers <=5) {
			pagination.start = 1;
			pagination.end = pagination.page_numbers;
		}else if (pagination.current <= 3) {
			pagination.start = 1;
			pagination.end = pagination.start + 4;
		}else
		if (pagination.page_numbers <= parseInt(pagination.current)+2) {
			pagination.end = pagination.page_numbers;
			pagination.start = pagination.page_numbers - 4;
		}

	})

	var query = Balance.find({});
	query.sort({time: -1});
	query.limit(page_size);
	query.skip((pagination.current-1)*page_size);

	query.exec(function(err,docs){

		res.render('balances/index', { 
			title: '收支明细' ,
			docs: docs,
			pagination: pagination,
			paginationJson:pagination,
			moment: moment
		});
	});
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
			doc:doc,
			moment: moment
		});
	})
});

//create
router.post('/balances', function(req, res, next) {	
	req.body.createdAt = new Date();
	console.log(typeof req.body.time)
	var balance = new Balance(req.body);	
	console.log(balance)
	balance.save(function (err) {
	  if (!err){
	  	res.redirect('/balances')
	  }else{
	  	res.redirect('/balances/new')
	  }
	});
});

//update,delete
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

// export
router.get('/export', function(req, res){
    var conf ={};
    conf.stylesXmlFile = "styles.xml";
    conf.cols = [{
        caption:'内容',
        type:'string',
        width:28.7109375
    },
    {
        caption:'金额',
         type:'number' 
    },
    {
        caption:'类型',
         type:'string' 
    },
    {    caption:'来源',
         type:'string' 
    },
    {
        caption:'日期',
        type:'string'
        // type:'date'
        // beforeCellWrite:function(){
        //     var originDate = new Date(Date.UTC(1899,11,30));
        //     return function(row, cellData, eOpt){
        //         if (eOpt.rowNum%2){
        //             eOpt.styleIndex = 1;
        //         }  
        //         else{
        //             eOpt.styleIndex = 2;
        //         }
        //         if (cellData === null){
        //           	eOpt.cellType = 'string';
        //          	return 'N/A';
        //         } else
        //         	console.log((cellData - originDate) / (24 * 60 * 60 * 1000))
        //           	return (cellData - originDate) / (24 * 60 * 60 * 1000);
        //     } 
        // }()
    }];
    var page = parseInt(req.query.page) || 1;
    console.log(req.query.page)
    var arrAll =[];
    var query = Balance.find({});
	query.sort({time: -1});
	query.limit(page_size);
	query.skip((page-1)*page_size);
	query.exec(function(err,docs){

		for(var p in docs){
			var arr =[];
			arr.push(docs[p].content)
			arr.push(docs[p].price)
			arr.push(docs[p].type ? "收入" : "支出")
			arr.push(docs[p].from)
			arr.push(moment(docs[p].time).format('YYYY-MM-DD HH:mm'))
			arrAll.push(arr)
		}
		conf.rows = arrAll;
		var result = nodeExcel.execute(conf);
	    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
	    res.setHeader("Content-Disposition", "attachment; filename=Page_"+page+"_Report.xlsx");
	    res.end(result, 'binary');
	});

    // conf.rows = [
    //     ["早饭",3.14,"支出","limi" ,new Date(Date.UTC(2013, 4, 1))],
    //     ["午饭",2.7182,"支出","limi", new Date(2012, 4, 1)],
    //     ["工资",10000,"收入","prince",new Date(Date.UTC(2013, 6, 9))],
    //     ["话费",100,"支出","limi", null]  
    // ];
    
});

module.exports = router;
