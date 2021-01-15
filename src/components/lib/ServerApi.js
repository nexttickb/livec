/*
	RUNKIT.ServerApi.send("https://www.baidu.com/", {a:'1111'}, (bl, res)=>{
		console.log(bl, res);
	});
*/
import IoBuf from '@/components/lib/IoBuf'
class ServerApi extends IoBuf{
    constructor(){
		super();
		this.token = '';
        this.userInfo = {};
		this.timer = false;
		this.historys = {};
		this.contactData = {};
		this.activeContact = {};
		this.lastSeq = 0;
    }
	
	//message频道接收模式
	onSubMessage(code, buf){
		let msg = {seq:buf.seq, msgId: buf.data.msgId, isme:0, user_id:buf.user_id, type:buf.data.type, content:buf.data.content, time:buf.data.time};
		this.addMessage(buf.user_id, msg);
		RUNKIT.VoimBus.publish('message', {type:'recv', data: msg });
		if(msg.seq < 0){//不重要的消息通知
			
		}
		if(msg.seq - this.getSeq() > 1){
			//TODO: 如果收到的消息seq大于本地seq 就向服务器获取漏掉的历史消息
		}
		this.updateSeq(msg.seq);
		this.send("Messager.messageAck", {seq:buf.seq}, (bl, res)=>{
			console.log('messageAck:', bl, res);
		});
	}
	updateSeq(seq){
		this.lastSeq = seq;
		RUNKIT.Store.set('lastSeq', seq);
	}
	getSeq(){
		return this.lastSeq;
	}
	async init(){
		this.otherInit();
		this.lastSeq = RUNKIT.Store.get('lastSeq');
		this.activeContact = RUNKIT.Store.get('activeContact') || {};//活跃联系人
		this.userInfo = RUNKIT.Store.get('userInfo') || {};
		this.historys = RUNKIT.Store.get('history') || {};//聊天记录
		await this.connect();
	}

	//activeContact应该换成对象 更容易操作，传递时再转数组
	addMessage(user_id, data){
		let key = user_id;
		if(typeof(this.historys[key]) == 'undefined')
			this.historys[key] = [];
		this.historys[key].push(data);
		if(this.historys[key].length > 20){
			this.historys[key].shift();
		}
		RUNKIT.Store.set('history', this.historys);
		this.changeActivecChat(user_id, 1);
	}
	changeActivecChat(user_id, state){
		if(!user_id)return;
		if(typeof(this.activeContact[user_id]) == 'undefined'){
			if(typeof(this.contactData[user_id])  == 'undefined'){
				console.log('changeActivecChat:', user_id, this.contactData);
				return;
			}
			this.activeContact[user_id] = this.contactData[user_id];
		}
		this.activeContact[user_id].lasttime = new Date().getTime();
		this.activeContact[user_id].newMsg = state;
		RUNKIT.Store.set('activeContact', this.activeContact);
		this.noticeChats();
	}
	readMessage(user_id, seq){
		this.changeActivecChat(user_id, 0);
		this.send("Messager.messageRead", {seq:seq, fromUser:user_id}, (bl, res)=>{
			console.log('messageRead:', bl, res);
		});
	}
	noticeChats(){
		let chats = [];
		for(let item in this.activeContact){chats.push(this.activeContact[item])}
		chats.sort(function(a,b){return b.lasttime - a.lasttime});
		
		RUNKIT.VoimBus.publish('message', {type:'chats', data: chats });
	}
	removeChat(){
		
	}
	getHistory(user_id){
		return this.historys[user_id] || [];
	}
	async getContacts(isNew){
		isNew = isNew || 0;
		if(!isNew){
			let res = RUNKIT.Store.get('contacts');
			console.log('res:', res);
			if(res)return res;
		}
		return new Promise((resolve, reject)=> {
			this.send("Messager.getContacts", {}, (bl, res)=>{
				console.log('detail:', bl, res);
				RUNKIT.Store.set('contacts', res.detail);
				RUNKIT.VoimBus.publish('contacts', {type:'change' });
				let list = res.detail;
				for(let i = 0; i < list.length; i++){
					this.contactData[list[i].user_id] = list[i];
				}
				resolve(res.detail);
				
			});
		});
	}
	async addContacts(user_id){
		return new Promise((resolve, reject)=> {
			this.send("Messager.addContacts", {id:user_id}, (bl, res)=>{
				console.log('detail:', bl, res);
				this.getContacts(1);
				resolve(res);
			});
		});
	}
	/*
	async makeContactKv(){
		let res = await this.getContacts(1);
		for(let i = 0; i < res.length; i++){
			this.contactData[res[i].user_id] = res[i];
		}
	}
	*/
	getChatlist(){
		let resList = [];
		for(let item in this.historys){
			if(this.historys[item]){
				resList.push(this.historys[item]);
			}
		}
		return resList;
	}
	changeMessage(){
		
	}
	sendMessage(messageType, messageText, toUser){
		var messageUid = this.createUUID();
		let sendBuf = {to_user:toUser, data:{msgId:messageUid, type:messageType, content:messageText}};
		this.send('Messager.sendMsg', sendBuf, (code, data, time)=>{
			if(0 == code){
			//	sendBuf.data.type = 'ack';
				this.changeMessage(data);
			}
		});
		let msgData = {msgId: messageUid, isme:1, user_id:this.userInfo.user_id, user_name:this.userInfo.user_name, avatar:"", type:messageType, content:messageText};
		this.addMessage(toUser, msgData);
		return msgData;
	}
	async upUserInfo(){
		return new Promise((resolve, reject)=> {
			this.send("User.getFiendInfo", {}, (bl, res)=>{
				console.log('upUserInfo:', bl, res);
				this.onUserInfoChange(res.data);
				resolve(res);
			});
		});
	}
	async onOpen(){
		super.onOpen();
		if(typeof(this.userInfo.user_token) == 'undefined'){
			RUNKIT.token = '';
		//	await this.guestLogin();
			this.needLogin();
		}else{
			this.onUserInfoChange(this.userInfo);
			RUNKIT.token = this.token;
			this.logged();
		}

		setInterval(()=>{
			this.ping();
		}, 9000);
		
		if(await this.checkVersion()){
			await this.getContacts(1);
		}
		this.noticeChats();
		RUNKIT.VoimBus.publish('network', {type:'init', data: {}});
	}
	getQueryString(name){
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r!=null)return  unescape(r[2]); return null;
	}
	ping(){
		this.callApi('Home.ping', {}, (code, data, time)=>{
	//		console.log('ping:', code, data, time);
			RUNKIT.VoimBus.publish('signal', {type:'signal', data: {code, time} });
		}, {mode : 1, timeout: 3900});
	}

	createUUID() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = "";
		var uuid = s.join("");
		return uuid;
	}
	//存取一级分类下看到哪个子分类以及页数
	setTypePoint(id, data){
		RUNKIT.Store.set('typePoint_' + id, data);
	}
	getTypePoint(id){
		return RUNKIT.Store.get('typePoint_' + id);
	}
	//存取一级分类下看到哪个子分类以及页数
	setNowType(id){
		RUNKIT.Store.set('nowType', id);
	}
	getNowType(){
		return RUNKIT.Store.get('nowType');
	}
	//存取当前影片播放到多少集
	setPlayNum(id, number){
		RUNKIT.Store.set('playNum_' + id, number);
	}
	getPlayNum(id){
		if('0' == id)return 0;
		return RUNKIT.Store.get('playNum_' + id) || 0;
	}
	async guestLogin(){
		/*
		return new Promise((resolve, reject)=> {
			this.send('Guest.login', {}, (code, data, time)=>{
				console.log(code, data);
				if(0 == code){
					this.onUserInfoChange(data);
				}
				resolve(data);
			});
		});
		*/
	}
	
	needLogin(){
		if(!this.token)
			RUNKIT.VoimBus.publish('public', {type:'login', data: {}});
		return this.token != '';
	}
	logged(){
	//	alert(1);
		RUNKIT.VoimBus.publish('public', {type:'logged', data: {}});
	}
	//分配客服
	async matchAgent(){
		if(this.token == ''){
			return this.needLogin();
		}
		return new Promise((resolve, reject)=> {
			this.send("Guest.matchAgent", {}, (bl, res)=>{
				console.log(bl, res);
				resolve(res);
			});
		});
	}
	send(path, params, cbfunc, conf){
	//	alert('send');
		params.token = this.token;
		this.callApi(path, params, (code, data, time)=>{
	//		alert('recv');
			if(-9 == code){
				this.token = '';
				this.needLogin();
			}
			cbfunc.call(0, code, data);
		}, conf);
	}
	//{phone:'13161918102', code:'123456'}
    login(params){
		return new Promise((resolve, reject)=> {
			this.send("Messager.login", params, (bl, res)=>{
				console.log(bl, res);
				if(bl == 0 && res.code == 0){
					this.onUserInfoChange(res.data);
					this.logged();
					this.checkVersion();
				}
				resolve(res);
			});
		});
    }
	async checkVersion(){
		return new Promise((resolve, reject)=> {
			this.send('Messager.checkVersion', {seq:this.getSeq()}, (code, data, time)=>{
				console.log('checkVersion:', code, data);
				if(code){
					resolve(false);
				}else{
					
					resolve(true);
				}
			});
		});
	}
	async register(params){
		return new Promise((resolve, reject)=> {
			this.send('Messager.register', params, (code, data, time)=>{
				console.log('register:', code, data);
				resolve({code:code, info:data});
			});
		});
	}
	
	checkUser(params){
		return new Promise((resolve, reject)=> {
			this.send("Messager.checkUser", params, (bl, res)=>{
				console.log(bl, res);
				resolve(res);
			});
		});
    }
	logout(){
		this.token = '';
		this.userInfo.token = '';
		RUNKIT.token = '';
		RUNKIT.Store.set('userInfo', {});
		location.reload();
	}
	onUserInfoChange(userInfo){
		if(typeof(userInfo) != "undefined"){
			this.userInfo = userInfo;
			this.token = this.userInfo.user_token;
		//	alert(this.token);
			console.log('upuserInfo:',userInfo);
			RUNKIT.Store.set('userInfo', this.userInfo);
		}
		RUNKIT.VoimBus.publish('public', {type:'userInfo', data: userInfo});
	}
	otherInit(){
		Date.prototype.Format = function (fmt) { // author: meizz
			var o = {
				"M+": this.getMonth() + 1, // 月份
				"d+": this.getDate(), // 日
				"h+": this.getHours(), // 小时
				"m+": this.getMinutes(), // 分
				"s+": this.getSeconds(), // 秒
				"q+": Math.floor((this.getMonth() + 3) / 3), // 季度
				"S": this.getMilliseconds() // 毫秒
			};
			if (/(y+)/.test(fmt))
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
					return fmt;
		}
	}
    onNotLogged(params, cbfunc){
	
    }
}

export default ServerApi
