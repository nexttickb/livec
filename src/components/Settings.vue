<template>
    <div class="my-body" style="">
		<div class="page-title bg1" style="">
			<div class="left fa fa-filter"></div>
            <div class="title">Settings</div>
			<div class="right fa fa-search"></div>
		</div>
		<div class="head" style="">
			<div @click="avatarClick">
				<img v-show="userInfo.avatar" :src='userInfo.avatar' />
			</div>
		</div>
		<div style="flex:1;overflow-y:scroll;padding:0.5rem;">
			<div class="ctl-group">
				<div class="ctl-label"><label>本地历史保留{{setting.historyKeepNum}}条</label></div>
				<div class="ctl-control"><input v-model="setting.historyKeepNum" type="range" min="5" max="150" step="1"  /></div>
			</div>
			<div class="ctl-group">
				<div class="ctl-label"><label>本地历史保留{{setting.historyKeepTime}}秒</label></div>
				<div class="ctl-control"><input v-model="setting.historyKeepTime" type="range" min="300" max="300000" step="1"  /></div>
			</div>
			<div class="ctl-group">
				<div class="ctl-label"><label>服务器历史保留{{setting.historyKeepNum}}条</label></div>
				<div class="ctl-control"><input v-model="setting.historyKeepNum" type="range" min="5" max="150" step="1"  /></div>
			</div>
			<div class="ctl-group">
				<div class="ctl-label"><label>服务器历史保留{{setting.historyKeepTime}}秒</label></div>
				<div class="ctl-control"><input v-model="setting.historyKeepTime" type="range" min="300" max="300000" step="1"  /></div>
			</div>
			<div class="ctl-group">
				<div class="ctl-label"><label>锁屏间隔{{setting.lockScreenTime}}秒</label></div>
				<div class="ctl-control"><input v-model="setting.lockScreenTime" type="range" min="30" max="600" step="1"  /></div>
			</div>
		</div>
		<input ref='imgfile' @change="imgChange" style="display:none" type='file' />
		<Bottom></Bottom>
</div>
</template>

<script>
import UserInfo from '@/components/UserInfo'
import Bottom from '@/components/Bottom'
export default {
    name: 'Home',
    props: {
    },
    components:{UserInfo, Bottom},
    data() {
        return {
			targetUser:{userId:'', avatar:''},
			userInfo:{userId:'', avatar:''},
			setting:{
				historyKeepNum:15,
				historyKeepTime:3000,
				serverHistoryKeepNum:15,
				serverHistoryKeepTime:3000,
				lockScreenTime:300,
			}
        }
    },
    computed: {
		
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			if('userInfo' == res.type){
				this.userInfo = res.data;
			}
		});
	},
    methods: {
        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		getImgUrl(file, cbfunc){
			return new Promise((resolve, reject)=> {
				let img = new Image();
				let reader = new FileReader();
				let canvas = document.createElement('canvas');
				let context = canvas.getContext('2d');
				canvas.width = 114;
				canvas.height = 114;
				reader.onload = (e)=>{
					console.log(e.target.result);
					img.src = e.target.result;
				}
				img.onload = ()=>{
					context.drawImage(img,0,0,114,114);
					let res = canvas.toDataURL('image/png', 1);
					resolve(res);
				}
				reader.readAsDataURL(file);
			});
		},
		avatarClick(){
			console.log(this.$refs.imgfile);
			this.$refs.imgfile.click();
		},
		async imgChange(evt){
			var files = evt.target.files;
			var file = files[0];
			if (!files || !file)return;
			let data = await this.getImgUrl(file);
			RUNKIT.ServerApi.send("User.avatarSet", {avatar:data}, (bl, res)=>{
				console.log(bl, res);
				RUNKIT.ServerApi.upUserInfo();
			});
		}
    }
}
</script>

<style lang='less'>
@card-height:4.5rem;
@import '../assets/form-control.less';

.head{
	height:12rem;
	background:url('../assets/background/hd-bg.svg');
	background-size:auto;
	box-sizing:border-box;
	&>div{
		box-sizing:border-box;
		width:6rem;height:6rem;margin:3rem auto;border-radius:9rem;border:1px solid #ccc;
		background:url('../assets/icon/user.svg');
		img{
			height:6rem;width:6rem;
			border-radius:9rem;
		}
	}
}

.ctl-group{
	width:100%;
	margin-top:0.3rem;
	box-sizing:border-box;
	.ctl-label{
		height:1.8rem;
		line-height:1.8rem;
	}
	.ctl-control, .ctl-control input{
		height:1.8rem;
		line-height:1.8rem;
		width:95%;
		height:1.8rem;
	}
}


	
</style>
