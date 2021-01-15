<template>
	<div class="app message" id="app">
		<div class="message-head" style="display:flex;">
			<div style="width:2.5rem;font-size:1.5rem;line-height:2.5rem;text-align:center;color:#fff;" @click="showPage('Chats')"><</div>
			<div style="flex:1;font-size:1.5rem;line-height:2.5rem;text-align:center;color:#fff;">{{userInfo.user_name}}</div>
			<div style="width:2.5rem;"></div>
		</div>
		<div class="message-list" ref="messagelist">
			 <template v-for="(item) in messages">
				<div class="msg-item" v-show="!item.isme">
					<div class="avatar">
						<img :src="userInfo.avatar" />
					</div>
					<div class="content-left">
						<span class="con-text" @click="clickMsg(item)">
							<span v-if="item.type=='text'">{{item.content}}</span>
							<div class="sound-left" v-if="item.type=='voice'"></div>
						</span>
					</div>
				</div>
				<div class="msg-item" v-show="item.isme">
					<div class="content-right">
						<span class="con-text" @click="clickMsg(item)">
							<div class="content-status">
								<div class="warn" v-show="item.state == -1">!</div>
								<div class="loading rotation" v-show="item.state == 0">。</div>
							</div>
							<span v-if="item.type=='text'">{{item.content}}</span>
							<div class="sound-right" v-if="item.type=='voice'"></div>
						</span>
					</div>
					<div class="avatar">
						<div class="hide-box">
							<span class="arrow arrow-right">◆</span>
						</div>
					</div>
				</div>
			</template>
			
		</div>
		<div class="message-box">
			<div @click="textModel = !textModel" class="box-left">{{textModel?"V":"T"}}</div>
			<div class="box-center">
				<div v-show="textModel" class="edit-box">
					<input class="text-input" v-model="messageInput" @keyup.enter="onClickSendBtn"></input>
				</div>
				<div v-show="!textModel" class="voice-box">
					<button @touchstart="onClickVioceStart" @touchend="onClickVioceStop" class="button-input">按住说话</button>
				</div>
			</div>
			<div class="box-right" @click="onClickSendBtn">A</div>
		</div>
    </div>
</template>

<script>
export default {
	name: 'Message',
	data () {
		return {
			info:"准备...",
			voiceState:0,
			textModel:true,
			messageInput:'',
			client:{},
			messages:[],
			lastMsg:{},
			targetUser:{
				user_id : "",
				user_name : ""
			},
			userInfo : {
				user_id : "",
				user_name : ""
			}
		}
	},
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('network', (topic, res)=>{
			if(res.type == 'init'){
				this.init();
			}
		});
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			if(res.type == 'showPage' && res.data.name == 'Message'){
				this.userInfo = res.data.param;
				this.messages = RUNKIT.ServerApi.getHistory(this.targetUser.user_id);
				this.messages.sort((a,b)=>{a.time - b.time});
				RUNKIT.ServerApi.readMessage(this.targetUser.user_id);
			}
			if('userInfo' == res.type){
				this.userInfo = res.data;
			}
		});
		RUNKIT.VoimBus.subscribe('message', (topic, res)=>{
			if(res.type == 'recv'){
				this.onRecvData(res.data);
			}
		});
		
	},
	watch: {
		messages() {
			this.$nextTick(() => {
				
				let list = this.$refs.messagelist;
				list.scrollTop = list.scrollHeight;
			});
		},
		textModel() {
			RUNKIT.APP.recorderOpen();
		}
	},
	props: {
		msg: String
	},
	methods:{
		showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		init(){
			/*
			setInterval(()=>{
				if(RUNKIT.APP.nowPage == 'Message'){
					
				}
			}, 3000);
			*/
		},
		clickMsg(msg){
			if(msg.type == 'voice'){
				RUNKIT.APP.playSound(msg.content);
			}
		},
		onRecvData(data){
			console.log("recv:", data);
			if(!data.content)return;
			this.lastMsg = data;
			this.addMessage(data);
		//	alert(JSON.stringify(data));
			
			if(RUNKIT.APP.nowPage == this.$options.name){
				console.log('已读');
				RUNKIT.ServerApi.readMessage(this.userInfo.user_id, this.lastMsg.seq);
			}
		},
		addMessage(data){
			console.log('addMessage:', data.msgId, data);
			this.messages.push(data);
			console.log('this.messages:',this.messages);
		},
		onClickSendBtn(){
			if(this.messageInput == "")
				return;
			this.sendMessage('text', this.messageInput);
		},
		sendMessage(type, data){
			let sendData = RUNKIT.ServerApi.sendMessage(type, data, this.userInfo.user_id);
			this.addMessage(sendData);
			setTimeout(()=>{
				this.messageInput = "";
			});
		},
		onClickVioceStart(e){
			console.log("down", e);
			RUNKIT.APP.recorderStart();
		},
		onClickVioceStop(e){
			console.log("up", e);
			RUNKIT.APP.recorderEnd((data)=>{
				if(data){
					this.sendMessage('voice', data);
				}
			});
		},
		sendMsg(){
			this.callApi('Message.sendMsg', {}, (code, data, time)=>{
				console.log(code, data);
			}, {mode : 0, timeout: 0, req:'message'});
		}
	}
}
</script>

<style scoped>

html, body{
	width:100%;
	height:100%;
	margin:0;
	padding:0;
	font-size:16px;
}
input, button{
	outline: none;
}
button{
	-webkit-user-select: none;
}

.sound-right, .sound-left{
	width:1rem;height:1rem;
}
.sound-left{
	background:url('../assets/icon/sound.svg') no-repeat center center;
	background-size:100% 100%;
	margin-right:6rem;
}
.sound-right{
	background:url('../assets/icon/sound.svg') no-repeat center center;
	background-size:100% 100%;
	transform:rotate(180deg);
	margin-left:6rem;
}


.message{
	width:100%;
	height:100%;
	display:flex;
	flex-direction: column;
}
.message-head{
	height:3rem;
	width:100%;
	background:#333;
}
.message-list{
	flex:1;
	width:100%;
	background:#efefef;
	overflow-x: hidden!important;
	overflow-y: scroll!important;
	box-sizing:border-box;
}
.message-box{
	height:3.5rem;
	width:100%;
	border-top:1px solid #ddd;
	background:#fefefe;
	display:flex;
	color:#888;
}
.box-left{
	width:3.5rem;
	border-right:1px solid #eee;
}
.box-center{
	flex:1;
	background:#fff;
	display:flex;
}
.text-input{
	width:100%;
	height:3rem;
	font-size:1.6rem;
	border:0;
	border-bottom:0.2rem solid #ccc;
	
}
.button-input{
	flex:1;
	margin:0 auto;
	font-size:1.6rem;
	width:100%;
	height:3rem;
	
}
.edit-box{
	padding:0 0.5rem 0 0.5rem;
}
.voice-box{
	text-align:center;
	line-height:3.5rem;
	color:#999;
	flex:1;
	display:flex;
	flex-direction: column;
}
.box-left, .box-right{
	font-size:2rem;
	line-height:3.5rem;
	text-align:center;
}
.box-right{
	width:3.5rem;
	border-left:1px solid #eee;
}

.chat-content{
	width:100%;
	
}


.message-list{
	flex:1;
	padding:0.5rem;
}
.msg-item {
	margin-top:0.8rem;
	margin-bottom:0.8rem;
	display:flex;
	min-height:3rem;
}
.avatar{
	width:3rem;
	height:3rem;
	background:#aaa;
	border-radius:3rem;
	margin:0 0.5rem 0 0.5rem;
}
.content-status{
	width:0;height:0;
}
.warn, .loading{
	width:1.2rem;
	height:1.2rem;
	font-size:1rem;
	line-height:1.2rem;
	text-align:center;
	cursor:pointer;
	border-radius:20rem;
	position:relative;
	left:-2.5rem;
}
@-webkit-keyframes rotation{
	from {-webkit-transform: rotate(0deg);}
	to {-webkit-transform: rotate(360deg);}
}

.rotation{
	-webkit-transform: rotate(360deg);
	animation: rotation 1s linear infinite;
}
.warn{
	background:#f00;
	color:#fff;
}
.loading{
	background:#fff;
	color:#ccc;
}
.content-left, .content-right{
	flex:1;
	
}
.arrow{
	position:relative;
	font-size:2rem;
	display:none;
}
.arrow-left{
	color:#fff;
	margin-right:-1.2rem;
	text-shadow: -1px 0px 1px #aaa;
}
.arrow-right{
	color:#90d936;
	margin-left:-1.2rem;
	text-shadow: 1px 0px 1px #aaa;
}
.hide-box{
	width:0;
	height:0;
}
.con-text{
	box-shadow: 0px 1rem 2rem #ddd;
	border:1px solid #ccc;
	max-width:69%;
	word-break: normal;
	word-wrap: break-word;
	word-break: break-all;
}
.content-left .con-text{
	margin-right:0.5rem;
	background-color: #fff;
	border-radius:0.5rem;
	padding:0.8rem;
	float:left;
	margin-right:20%
}
.content-right .con-text{
	margin-left:0.5rem;
	background-color: #90d936;
	border-radius:0.5rem;
	padding:0.8rem;
	float:right;
	margin-left:20%
}
.content-left:before {

}
.content-right:before {

}
::-webkit-scrollbar {
	width: 0.3rem;
	height: 1px;
}
::-webkit-scrollbar-thumb {
	border-radius: 10px;
	background: #fff;
}
::-webkit-scrollbar-track {
	border-radius: 10px;
	background: #EDEDED;
}
			
</style>
