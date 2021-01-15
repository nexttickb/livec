<template>
<div :class="['app']" id="app" style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;">
	<Message v-show="nowPage == 'Message'" ref="" v-if="init"></Message>
	<Contacts v-show="nowPage == 'Contacts'" ref="" v-if="init"></Contacts>
	<Chats v-show="nowPage == 'Chats'" ref="" v-if="init"></Chats>
	<Settings v-show="nowPage == 'Settings'" ref="" v-if="init"></Settings>
	<Search v-show="nowPage == 'Search'" ref="" v-if="init"></Search>
	<Login v-show="nowPage == 'Login'" ref="" v-if="init"></Login>
	<Translate v-show="nowPage == 'Translate'" ref="" v-if="init"></Translate>
	<Recorder style="" ref="recorder" v-if="init"></Recorder>
	<div style="width:0;height:0;"><audio ref="audioPlayer" style="" src=""></audio></div>
	
</div>
</template>

<script>
import ServerApi from '@/components/lib/ServerApi'
import VoimBus from '@/components/lib/VoimBus'
import Store from '@/components/lib/Store'
import Message from '@/components/Message'
import Contacts from '@/components/Contacts'
import Chats from '@/components/Chats'
import Settings from '@/components/Settings'
import Search from '@/components/Search'
import Login from '@/components/Login'
import Recorder from '@/components/Recorder'
import Translate from '@/components/Translate'

export default {
    name: 'app',
    components: {
		Message,Contacts,Chats,Settings,Search,Login,Recorder,Translate
    },
    data() {
        return {
			init:0,
			nowPage:'Chats'
        }
    },
    mounted:function(){
        RUNKIT.ServerApi = new ServerApi();
		RUNKIT.VoimBus = new VoimBus();
		RUNKIT.Store = new Store();
		
        RUNKIT.APP = this;

		RUNKIT.ServerApi.init();
		
		this.init = true;
		
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			
		});
		

		this.initData();
		
		
		window.onresize = this.onResize;
		
		document.getElementById('mask').style.display = "none";
		
	//	setInterval(function () { debugger }, 100);
	
	
		this.checkTime();
		setInterval(()=>{
			this.checkTime();
		}, 5000)
		
    },
    computed: {
    },
    methods: {
		checkTime(){
			let lt = RUNKIT.Store.get('time') || 1111111;
			let now = new Date().getTime();
			if(now - lt > 300 * 1000){
				console.log('过期', now, lt);
				this.showPage('Translate');
				RUNKIT.Store.set('time', now)
			}else{
			//	this.showPage('Translate');
			}
		},
        showPage(name, param){
			let prePage = '';
			console.log(name, param);
			if(name != this.nowPage){
				prePage = this.nowPage;
				this.nowPage = name;
			}
			RUNKIT.VoimBus.publish('public', {type:'showPage', data: {name:name, prePage:prePage, param:param}});
        },
		onResize(){
			if(this.resizeTimer)return;
			this.resizeTimer = setTimeout(()=>{
				RUNKIT.VoimBus.publish('public', {type:'resize', data: {}});
				clearTimeout(this.resizeTimer);
				this.resizeTimer = false;
			}, 500);
		},
		recorderOpen(){
			this.$refs.recorder.recOpen();
		},
		recorderStart(){
			this.$refs.recorder.recStart();
		},
		recorderEnd(cbfunc){
			this.$refs.recorder.recStop((data)=>{
				cbfunc(data);
			});
		},
		playSound(src){
			var audio = this.$refs.audioPlayer;
			audio.onerror = function(e){
                console.log('播放失败[' + audio.error.code + ']' + audio.error.message);
            };
            if(!(audio.ended || audio.paused)){
                audio.pause();
            };
			audio.src = src;
            audio.play();
		},
		loading(bl){
			this.isLoading = bl;
		},
		initData(){
		}
    }
}
</script>

<style lang='less'>

@bg-blue:#1C83D0;
@line-color:#619AEB;

body,html{
	margin:0;
	padding:0;
	font-size:16px;
}
*{
	outline:none;
	
}

#app, .my-body{
    width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;
}

input{
	padding:0 0.2rem 0 0.2rem;
	outline:none;
}

.page-title{
    background:@bg-blue;
    font-size:1.6rem;
    height:2.5rem;
	line-height:2.5rem;
    display:flex;
	z-index:100;
    .title{
        flex:1;
        color:#fff;
        text-align:center;
    }
    .left{
        flex:1;
        color:#fff;
        padding:0 0.3rem 0 0.3rem;
    }
    .right{
        flex:1;
        color:#fff;
		text-align:right;
        padding:0 0.3rem 0 0.3rem;
    }
}


</style>
