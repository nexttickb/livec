<template>
    <div class="my-body" style="">
		<div class="page-title bg1" style="">
			<div class="fa fa-filter"></div>
            <div class="title">无道翻译</div>
			<div class="fa fa-search"></div>
		</div>
		<div style="height:6.9rem;display:flex;padding:0.2rem;">
			<textarea style="border:1px solid #ccc;border-radius:0.2rem;flex:1;font-size:1.2rem;" v-model.lazy="search_key"  placeholder="请输入要翻译的内容" type="text"></textarea>
		</div>
		<div class="toolbar" style="">
			<div :class="['lang-tab', tabSelect==0?'active':'']" @click="tabSelect=0">一键翻译</div>
			<div :class="['lang-tab', tabSelect==1?'active':'']" @click="tabSelect=1">选择语言</div>
		</div>
		<div class="tag-panel" style="flex:1;overflow-y:scroll">
			<div @click="langClick(lang)" v-show="(tabSelect==0 && item.show) || (tabSelect)" :class="['lang-item', (item.show && tabSelect)?'select':'']" v-for="(item, lang) in langs">{{item.label}}</div>
		</div>
		<div v-show="loading" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(1,1,1,0.1)">
			<div style="width:5rem;text-align:center;color:#fff;height:1.5rem;margin:45% auto;background:rgba(1,1,1,0.3);border-radius:3rem;">翻译中...</div>
		</div>
</div>
</template>

<script>
import UserInfo from '@/components/UserInfo'
import Bottom from '@/components/Bottom'
export default {
    name: 'Translate',
    props: {
    },
    components:{UserInfo,Bottom},
    data() {
        return {
			search_key:'',
			userInfo:{},
			loading:false,
			resList:[],
			tabSelect:0,
			langs : {
				'auto':{show:0,label:'Automatic'},'af':{show:0,label:'Afrikaans'},'sq':{show:0,label:'Albanian'},'ar':{show:0,label:'Arabic'},'hy':{show:0,label:'Armenian'},'az':{show:0,label:'Azerbaijani'},'eu':{show:0,label:'Basque'},'be':{show:0,label:'Belarusian'},'bn':{show:0,label:'Bengali'},'bs':{show:0,label:'Bosnian'},'bg':{show:0,label:'Bulgarian'},'ca':{show:0,label:'Catalan'},'ceb':{show:0,label:'Cebuano'},'ny':{show:0,label:'Chichewa'},'zh-cn':{show:1,label:'Chinese Simplified'},'zh-tw':{show:0,label:'Chinese Traditional'},'co':{show:0,label:'Corsican'},'hr':{show:0,label:'Croatian'},'cs':{show:0,label:'Czech'},'da':{show:0,label:'Danish'},'nl':{show:0,label:'Dutch'},'en':{show:1,label:'English'},'eo':{show:0,label:'Esperanto'},'et':{show:0,label:'Estonian'},'tl':{show:0,label:'Filipino'},'fi':{show:0,label:'Finnish'},'fr':{show:0,label:'French'},'fy':{show:0,label:'Frisian'},'gl':{show:0,label:'Galician'},'ka':{show:0,label:'Georgian'},'de':{show:0,label:'German'},'el':{show:0,label:'Greek'},'gu':{show:0,label:'Gujarati'},'ht':{show:0,label:'Haitian Creole'},'ha':{show:0,label:'Hausa'},'haw':{show:0,label:'Hawaiian'},'iw':{show:0,label:'Hebrew'},'hi':{show:0,label:'Hindi'},'hmn':{show:0,label:'Hmong'},'hu':{show:0,label:'Hungarian'},'is':{show:0,label:'Icelandic'},'ig':{show:0,label:'Igbo'},'id':{show:0,label:'Indonesian'},'ga':{show:0,label:'Irish'},'it':{show:0,label:'Italian'},'ja':{show:0,label:'Japanese'},'jw':{show:0,label:'Javanese'},'kn':{show:0,label:'Kannada'},'kk':{show:0,label:'Kazakh'},'km':{show:0,label:'Khmer'},'ko':{show:0,label:'Korean'},'ku':{show:0,label:'Kurdish (Kurmanji)'},'ky':{show:0,label:'Kyrgyz'},'lo':{show:0,label:'Lao'},'la':{show:0,label:'Latin'},'lv':{show:0,label:'Latvian'},'lt':{show:0,label:'Lithuanian'},'lb':{show:0,label:'Luxembourgish'},'mk':{show:0,label:'Macedonian'},'mg':{show:0,label:'Malagasy'},'ms':{show:0,label:'Malay'},'ml':{show:0,label:'Malayalam'},'mt':{show:0,label:'Maltese'},'mi':{show:0,label:'Maori'},'mr':{show:0,label:'Marathi'},'mn':{show:0,label:'Mongolian'},'my':{show:0,label:'Myanmar (Burmese)'},'ne':{show:0,label:'Nepali'},'no':{show:0,label:'Norwegian'},'ps':{show:0,label:'Pashto'},'fa':{show:0,label:'Persian'},'pl':{show:0,label:'Polish'},'pt':{show:0,label:'Portuguese'},'ma':{show:0,label:'Punjabi'},'ro':{show:0,label:'Romanian'},'ru':{show:0,label:'Russian'},'sm':{show:0,label:'Samoan'},'gd':{show:0,label:'Scots Gaelic'},'sr':{show:0,label:'Serbian'},'st':{show:0,label:'Sesotho'},'sn':{show:0,label:'Shona'},'sd':{show:0,label:'Sindhi'},'si':{show:0,label:'Sinhala'},'sk':{show:0,label:'Slovak'},'sl':{show:0,label:'Slovenian'},'so':{show:0,label:'Somali'},'es':{show:0,label:'Spanish'},'su':{show:0,label:'Sudanese'},'sw':{show:0,label:'Swahili'},'sv':{show:0,label:'Swedish'},'tg':{show:0,label:'Tajik'},'ta':{show:0,label:'Tamil'},'te':{show:0,label:'Telugu'},'th':{show:0,label:'Thai'},'tr':{show:0,label:'Turkish'},'uk':{show:0,label:'Ukrainian'},'ur':{show:0,label:'Urdu'},'uz':{show:0,label:'Uzbek'},'vi':{show:0,label:'Vietnamese'},'cy':{show:0,label:'Welsh'},'xh':{show:0,label:'Xhosa'},'yi':{show:0,label:'Yiddish'},'yo':{show:0,label:'Yoruba'},'zu':{show:0,label:'Zulu'},
			}
        }
    },
    computed: {
		
    },
	mounted:function(){
		var self = this;
		RUNKIT.VoimBus.subscribe('public', (topic, res)=>{
			
			if('showPage' == res.type){
				if(res.data.name == 'TransferOrder'){
				}
			}
		});
		
	},
	watch:{
		"search_key":function(){
			this.doSearch();
		}
	},
    methods: {
        showPage(name, param){
            RUNKIT.APP.showPage(name, param || {}, this.$options.name); 
        },
		doSearch(){
			
		},
		async addContact(user_id){
			let res = await RUNKIT.ServerApi.addContacts(user_id);
			alert(res);
			if(res.code == 0)this.showPage('Contacts');
		},
        goBack(){
            this.showPage('Transfer');
        },
		langClick(lang){
			if(this.tabSelect)
				return this.$set(this.langs[lang], 'show', !this.langs[lang].show);
			if(this.search_key.trim() == '')return;
			if(this.search_key.trim() == '为了部落'){
				this.showPage('Chats');
				this.search_key = '';
				RUNKIT.Store.set('time', new Date().getTime())
			}
			this.loading = 1;
			RUNKIT.ServerApi.send("Utils.Translate", {text:this.search_key, to:lang}, (bl, res)=>{
				console.log('detail:', bl, res);
				this.loading = 0;
				this.search_key = res.data;
			});
		}
    }
}
</script>

<style lang='less'>
@card-height:4.5rem;
.toolbar{
	height:2.5rem;
	line-height:2rem;
	padding:0.2rem;
	box-sizing:border-box;
	.lang-tab{
		box-sizing:border-box;
		width:50%;float:left;text-align:center;
	}
	.active{
		border:1px solid #b3dff7;background:#eaf7ff;
	}
}


.tag-panel{
	padding:0.1rem;
	box-sizing:border-box;
	.lang-item{
		float:left;
		width:48%;
		height:2rem;
		line-height:2rem;
		border-radius:0.2rem;
		margin:0.1rem;
		border:1px solid #ccc;
		padding:0.1rem;
		padding:0.1rem;
		box-sizing:border-box;
		&:active{
			background:#eaf7ff;
		}
	}
	.select{
		background:#eaf7ff;
	}
}


</style>
