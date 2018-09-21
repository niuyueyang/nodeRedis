var express = require("express");
var router = express.Router();
var redis=require("../models/redis");
var request=require("request");
var mongodb=require("../models/mongodb.js");

/* GET home page. */
router.get("/", function(req, res, next) {
  redis.pick(req.query,function(result){
  	if(result.code===1){
  		mongodb.save(req.query.user,result.msg,function(err){
  			if(err){
  				return res.json({code:0,msg:"获取漂流瓶失败"});
  			}else{
  				return res.json(result);
  			}
  		})
  		res.json(result);
  	}
  })
});

router.post("/",function(req,res,next){
//	if(!(req.body.owner&&req.body.type&&req.body.content)){
//		return res.json({code:0,msg:"信息不完整"});
//	}else{
//		redis.throw(req.body,function(result){
//			res.json(result);
//		})
//	}
	redis.throw(req.body,function(result){
			res.json(result);
		})
});

router.get("/add",function(req,res,next){
	for(var i=1;i<=5;i++){
		(function(i){			
				request.post({
					url:"http://127.0.0.1:3000/",
					json:{"owner":"bottle"+i,"type":"male","content":"content"+i}
				})		
			})(i)
	}
	for(var i=6;i<=10;i++){
		(function(i){			
					request.post({
						url:"http://127.0.0.1:3000/",
						json:{"owner":"bottle"+i,"type":"female","content":"content"+i}
					})		
		})(i)
	}
	res.send("success");
	
});

router.get("/get",function(req,res,next){
	var result=redis.pick({type:"male"},function(result){
		res.json(result);
	});
});

//获取用户瓶子
router.get("/user/:user",function(req,res){
	mongodb.getAll(req.params.user,function(result){
		 res.json(result);
	})
});

router.get("/bottle/:id",function(req,res){
	mongodb.getOne(req.params.id,function(result){
		 res.json(result);
	})
});

//回复信息
router.post("/reply/:id",function(req,res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	if(!(req.body.user&&req.body.content)){
		res.json({code:0,msg:"回复信息不完整"});
	}
	mongodb.reply(req.params.id,req.body,function(result){
		 res.json(result);
	})
})

module.exports = router;
