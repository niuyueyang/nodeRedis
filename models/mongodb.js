var mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/drifer", {useNewUrlParser:true}, function(err){
　　if(err){
　　　　console.log('Connection Error:' + err)
　　}else{
　　　　console.log('Connection success!') }
});

//定义漂流瓶类型
var bottleModdel=mongoose.model('Bottle',new mongoose.Schema({
	bottle:Array,
	message:Array
},{
	collection:'bottles'
}));

//将用户捡到的漂流瓶改变样式保存
exports.save=function(picker,_bottle,callback){
	var bottle={bottle:[],message:[]};
	bottle.bottle.push(picker);
	bottle.message.push([_bottle.owner,_bottle.time,_bottle.content]);
	bottle=new bottleModdel(bottle);
	bottle.save(function(err){
		if(err){
			return err;
		}else{
			return bottle;
		}
	})
}
//获取捡到的所有瓶子
exports.getAll=function(user,callback){
	bottleModdel.find({"bottle":[user]},function(err,bottles){
		if(err){
			callback(err);
		}else{
			callback(bottles);
		}
	})
}

exports.getOne=function(id,callback){
	bottleModdel.find({"_id":id},function(err,bottles){
		if(err){
			callback(err);
		}else{
			callback(bottles);
		}
	})
}

exports.reply=function(id,reply,callback){
	reply.time=reply.time||Date.now();
	bottleModdel.find({"_id":id},function(err,bottles){
		if(err){
			callback(err);
		}else{
			var newBottle={};
			newBottle.bottle=bottles[0].bottle;
			newBottle.message=bottles[0].message;
			newBottle.message.push(reply.user,reply.time,reply.content);
			//更新数据库
			bottleModdel.update({_id:id},newBottle,function(err,bottle){
				if(err){
					callback(err);
				}else{
					callback(bottle);
				}
			})
		}
	})
}
