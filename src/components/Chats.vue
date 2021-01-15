<template>
    <div class="my-body" style="">
		<div class="page-title bg1" style="">
			<div class="left fa fa-filter"></div>
            <div class="title">Chats</div>
			<div class="right fa fa-search"></div>
		</div>
		<div style="flex:1;overflow-y:scroll">
			<div class="card-list-item" @click="openMessage(item)" style="height:5rem;display:flex;" v-for="item in chatList">
				<div style='width:5rem;height:5rem;'>
					<div style="width:5rem;height:5rem;display:flex;padding:0.3rem;box-sizing: border-box;">
						<div style="flex:1;background:#ccc;border-radius:5rem;" src="">
							<div style="width:0.9rem;height:0.9rem;float:right;border-radius:1rem;background:#f00;" v-show='item.newMsg'></div>
						</div>
						
					</div>
				</div>
				<div style='flex:1;display:flex;flex-direction:column;text-align:left;padding-top: 8px;padding-bottom: 8px;padding-left: 8px;'>
					<div style='flex:1;font-size:1rem;line-height:0.7rem;'>{{item.user_name}}</div>
					<div style='flex:1;font-size:1rem;line-height:0.7rem;'>{{item.user_id}}</div>
				</div>
				<div style='width:5rem;height:5rem;display:flex;flex-direction:column;'>
					<div>
						<span style="color:#999;font-size:0.9rem;" v-show='item.newMsg'>有未读消息</span>
					</div>
					<div></div>
				</div>
			</div>
		</div>
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
    components:{UserInfo,Bottom},
    data() {
        return {
			startDate:'',
			endDate:'',
            pageNum:0,
			userInfo:{},
			loadingMore:false,
			chatList:[],
        }
    },
    computed: {
		
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			if('showPage' == res.type){
				if(res.data.name == ''){
				}
			}
		});
		RUNKIT.VoimBus.subscribe('message', (topic, res)=>{
			if('chats' == res.type){
				this.chatList = res.data;
			}
		});
	},
    methods: {
        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		openMessage(item){
			this.showPage('Message', item);
		},
        goBack(){
            this.showPage('Transfer');
        }
    }
}
</script>

<style lang='less'>
@card-height:4.5rem;


.card-list-item{
	height:2.5rem;background:#fff;display:flex;text-align:center;box-sizing: border-box;
	color:#888;
	margin:0.2rem;
	border-box:0.2rem #ccc;
	border-radius:0.2rem;
	box-shadow:0px 0px 0.3rem #ccc;

	
}


.page-menu{
	height:2.5rem;background:#fff;display:flex;text-align:center;box-sizing: border-box;;
	color:#888;
	.item{
		flex:1;
		.icon{
			height:1.6rem;line-height:1.6rem;font-size:1.2rem;
		}
		.text{
			height:0.6rem;line-height:0.6rem;font-size:0.4rem;
		}
		&:active{
			background:#fff;
		}
	}
}

.page-menu-rl{
	@height:2.5rem;
	@padding:0.8rem;
	height:@height;background:#fff;display:flex;text-align:center;box-sizing: border-box;
	color:#888;
	margin:0.2rem;
	padding:@padding;
	border-box:0.2rem #ccc;
	border-radius:0.2rem;
	box-shadow:0px 0px 0.3rem #ccc;
	.item{
		flex:1;
		display:flex;
		
		.icon{
			width:2.2rem;font-size:1rem;
		}
		.text{
			flex:1;font-size:0.6rem;text-align:left;
		}
		&:active{
			background:#fff;
		}
	}
}
	
</style>
