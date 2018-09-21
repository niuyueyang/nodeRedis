var redis=require('redis');
var client=redis.createClient();
var client2=redis.createClient();
var client3=redis.createClient();
//扔一个漂流瓶
exports.throw=function(bottle,callback){
	bottle.time=bottle.time||Date.now();
	var bottleId=Math.random().toString(16);
	var type={'female':0,'male':1};
	//根据漂流瓶的不同类型保存到不同的数据库
//	client.HMSET(bottleId,bottle,function(err,result){
//			if(err){
//				return callback({code:0,msg:"过会儿再来试吧！"});
//			}else{
//				return callback({code:1,msg:result});
//			}
//			//设置生存期为1天
//			client.EXPIRE(bottleId,86400);
//		})
	//先到2号数据库查看用户是否超过扔瓶次数
	client2.SELECT(2,function(){
		client2.GET(bottle.owner,function(err,result){
			if(result>=10){
				return callback({code:0,msg:'今天次数用完了'});
			}else{
				client2.INCR(bottle.owner,function(){
					//检查用户今天是否第一次扔瓶子
					client2.TTL(bottle.owner,function(err,ttl){
						if(ttl==-1){
							client2.EXPIRE(bottle.owner,86400);
						}
					})
				});
				
				client.SELECT(type[bottle.type],function(){
					//向不同的bottleId插入bottle信息
					client.hmset(bottleId,bottle,function(err,result){
						if(err){
							return callback({code:0,msg:"过会儿再来试吧！"});
						}else{
							return callback({code:1,msg:result});
						}
						//设置生存期为1天
						client.EXPIRE(bottleId,86400);
					})
				});
				
			}
		})
	})
}
//捡一个漂流瓶 
exports.pick=function(info,callback){
	
	client3.SELECT(3,function(){
		//获取捡瓶次数
		client3.GET(info.user,function(err,result){
			if(result>=100000){
				return callback({code:0,msg:'今天次数用完了'});
			}else{
				client3.INCR(info.user,function(){
					//检查用户今天是否第一次扔瓶子
					client3.TTL(info.user,function(err,ttl){
						if(ttl==-1){
							client2.EXPIRE(info.user,86400);
						}
					})
				});
				
				if(Math.random()<=0.2){
					return callback({code:0,msg:'海星'});
				}
				
				var type={all:Math.round(Math.random()),male:0,female:1};
				info.type=info.type||'all';
				//根据捡到瓶子不同类型到不同数据库取
				client.SELECT(type[info.type],function(){
					//随机返回一个漂流瓶ID
					client.RANDOMKEY(function(err,bottleId){
						if(!bottleId){
							return callback({code:0,msg:'海星'});
						}else{
							client.HGETALL(bottleId,function(err,bottle){
								if(err){
									return callback({code:0,msg:"漂流瓶破损了！"});
								}else{
									return callback({code:1,msg:bottle});
									//从redis删除该漂流瓶
									client.DEL(bottleId);
								}
							})
						}
					})
				});
				
			}
		})
	})
}

//将捡到的漂流瓶扔回海里
exports.throwBack=function(bottle,callback){
	var type={male:0,female:1};
	var bottleId=Math.random().toString(16);
	client.select(type[bottle.type],function(){
		client.hmset(bottleId,bottle,function(err,result){
			if(err){
				return callback({code:0,msg:"过会儿再来试吧！"});
			}else{
				return callback({code:1,msg:result});
			}
			//设置生存期为1天
			client.PEXPIRE(bottleId,86400000+bottle.time-Date.now());
		})
	})
}
