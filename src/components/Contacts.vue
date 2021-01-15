<template>
    <div class="my-body" style="">
		<div class="page-title bg1" style="">
			<div class="left fa fa-filter"></div>
            <div class="title">Contacts</div>
			<div class="right fa fa-search" @click="showPage('Search')">Add</div>
		</div>
		<div style="height:2.6rem;display:flex;padding:0.2rem;">
			<input v-model.lazy="search_key"  placeholder="please input user name" type="text" style="border:1px solid #ccc;border-radius:0.2rem;flex:1;"></input>
		</div>
		<div style="flex:1;overflow-y:scroll">
			<div class="" @click="openMessage(item)" style="margin-top:0.2rem;height:3.6rem;display:flex;" v-for="item in resList">
				<div style='width:3.6rem;height:3.6rem;'>
					<div style="width:3.6rem;height:3.6rem;display:flex;padding:0.3rem;box-sizing: border-box;">
						<div style="flex:1;background:#ccc;border-radius:5rem;" src=""></div>
					</div>
				</div>
				<div style='flex:1;border-bottom:1px solid #eee;'>
					<div style='font-size:1.6rem;line-height:3.6rem;color:#666'>{{item.user_name}}</div>
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
			resList:[],
			maxPage:100,
			pageShowNum:5,
			search_key:''
        }
    },
    computed: {
		
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			if('logged' == res.type){
				this.getContacts();
			}
			if('showPage' == res.type){
				if(res.data.name == 'Contacts'){
					this.getContacts();
				}
			}
		});
		RUNKIT.VoimBus.subscribe('contacts', (topic, res)=>{
			if('change' == res.type){
				this.getContacts();
			}
		});
		
		
		
	},
    methods: {

        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		async getContacts(){
			this.resList = await RUNKIT.ServerApi.getContacts();
		},
		delContact(user_id){
			RUNKIT.ServerApi.send("Messager.delContacts", {id:user_id}, (bl, res)=>{
				console.log('detail:', bl, res);
				alert(res.info);
				
			});
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
