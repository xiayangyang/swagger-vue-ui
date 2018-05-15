function deepcopy (source) {
  if (!source) {
    return source;
  }
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
  }
  return sourceCopy;
}
function isNullObjec(obj){
	for(var key in obj) {
		return false;
	}
	return true;
}
Array.prototype.unique = function(){
	var res = [this[0]];
	for(var i = 1; i < this.length; i++){
		var repeat = false;
		for(var j = 0; j < res.length; j++){
	 		if(this[i] == res[j]){
	    		repeat = true;
	    		break;
	   		}
		}
		if(!repeat){
		   res.push(this[i]);
		}
	}
	return res;
}
// var i18n = new VueI18n({})
var uploadTemplate = '<Upload :before-upload="handleUpload" :action="uploadUrl"><i-button type="ghost" icon="ios-cloud-upload-outline">{{label.upload}}</i-button></Upload>'
new Vue({
	el: "#app",
	// i18n: i18n,
	data: {
		label: {
			setting: '配置',
			operation: '其他操作',
			clearSetting: '清除配置',
			modifySetting: '修改配置',
			rememberSetting: '记住配置',
			besure: '确定',
			debug: '调试',
			none: '无',
			languageChoose: '语言选择',
			upload: '上传',
			copyResponse: '复制返回值',
			copyRequestUrl: '复制请求路径',
			searchPlaceholder: '请输入接口名称或接口路径',
			defaultToken: '默认token',
			noAuth: '无需token接口',
			close: '关闭',
			other: '其他',
			left: '左侧',
			right: '右侧'
		},
		myScroll: null,
		tagsMap: {},
		currentPageName: '',
		currentPageData: {
			// mainData: {}, // 已选中菜单的所有数据
			// headerTable: [],  //头部部分 表格
			// parametersTable: [], // 参数部分 表格
			// debugTable: [], // 调试表格
			// tableData: [],
			// responseData: [],
			// tableForm: {},  //保存表格数据
			// tableJson: '',	//保存文本域输入
			// response: {
			// 	curl: '',
			// 	requestUrl: '',
			// 	requestHeader: '',
			// 	code: '',
			// 	headers: ''
			// },
		},  //当前页回显的数据
		openedPages: [], // (url+ '.' + method)的数组
		openedPagesData: {}, //  (url+ '.' + method)作为键，该页回显的数据作为值
		sidebarSearchInp: '', // 侧边栏搜索
		defaultTokenKey: 'Authorization',
		file: null, //调试时上传的文件
		uploadUrl: "", //上传文件的url
		shadeShow: true, // 配置是否显示
		openNames: [],
		showWhichOneTab: 'description',
		parameterTypeBody: false, //参数是body
		spinShow: false, //加载中
		onOff: false,
		tableTextarea: true,
		showResponse: false,
		
		tags: [],
		basePath: "",
		info: {},
		paths: {}, // 经过处理的返回的所有的数据
		settingForm: {
			language: 'zh-CN',
			defaultAuth: '',
			noAuth: [],
			remember: true,
		},
		language: [
			{
				value: 'zh-CN',
				label: '简体中文'
			}, {
				value: 'zh-TW',
				label: '繁体中文'
			}, {
				value: 'en-US',
				label: '英文'
			}
		],
		originalSidebarData: [],
		noAuth: [], // 不需要token的接口数组
		searchData: [],
		sidebarData: [],// {name,description}
		jsonTreeData: {},
		textareaJsonStr: "",
		columnsTable: [
			{
				title: "Path",
				key: "path",
			}, {
				title: "Summary",
				key: "summary",
			}, {
				title: "Description",
				key: "description",
			}, {
				title: "Consumes",
				key: "consumes",
				render: function(create,params){
					var txt = ""
					var data = params.row.consumes
					if(typeof data === "object" && data.length){
						txt = data.join(" ")
					}else if(typeof data === "object" && !data.length){
						for(var key in data) {
							txt += " " + data[key]
						}
					}
					return create('span',txt)
				}
			}, {
				title: "Produces",
				key: "produces",
				render: function(create,params){
					var txt = ""
					var data = params.row.produces
					if(typeof data === "object" && data.length){
						txt = data.join(" ")
					}else if(typeof data === "object" && !data.length){
						for(var key in data) {
							txt += " " + data[key]
						}
					}
					return create('span',txt)
				}
			}
		],
		columns: [
			{
				title: "Name",
				key: "name",
				render: function(create,params){
					var param = []
					if(params.row.required){
						param = [create('strong',{
							style: {
								color: "red"
							}
						},"*"),create('strong',params.row.name)]
					}else{
						param = [create('span',params.row.name)]
					}
					return create('div',param)
				}
			}, {
				title: "Description",
				key: "description",
				render: function(create,params){
					var mark = params.row.required ? 'strong' : 'span';
					return create(mark,params.row.description)
				}
			}, {
				title: "Parameter Type",
				key: "in",
				width: 300,
				render: function(create,params){
					var txt = ''
					if (params.row.in == 'path') {
						txt = params.row.in + '  (路径参数，例如：/users/{id})'
					} else if(params.row.in == 'query'){
						txt = params.row.in + '  (查询参数，例如：/users?role=admin)'
					}else{
						txt = params.row.in
					}
					return create('span',txt)
				}
			}, {
				title: "Data Type",
				key: "type",
				render: function(create,params){
					var txt = ''
					if (params.row.type){
						txt = params.row.type
					}else if(params.row.schema && params.row.schema.type){
						txt = params.row.schema.type
					}
					if(txt == 'integer' && params.row.format == 'int64'){
						txt = 'long'
					}
					return create('span',txt)
				}
			}, {
				title: "Required",
				key: "required",
				render: function(create, params){
					if(params.row.required){
						return create("Icon",{
							attrs: {
								type: "checkmark-round"
							}
						})	
					}
				}
			}
		],
		debugColumns: [
			{
				title: "Name",
				key: "name",
				render: function(create,params){
					var param = []
					if(params.row.required){
						param = [create('strong',{
							style: {
								color: "red"
							}
						},"*"),create('strong',params.row.name)]
					}else{
						param = [create('span',params.row.name)]
					}
					return create('div',param)
				}
			}, 
			{
				title: "Value",
				key: "value",
				width: 250,
				render: function(create, params) {
					var txt = ""
					if(params.row.required){
						txt = "required"
					}
					if(params.row.type == 'file' || params.row.schema && params.row.schema.type == 'file'){
						// 这里需要控制手动上传
						return create("Upload",{
								attrs: {
									action: ''
								},
								style: {
									marginTop: '8px'
								},
								on: {
									click: function(){
										console.log('on')
									},
									beforeUpload: function(file){
										console.log('file: ',file)
										this.file = file;
							      return false;
									}
								},
								nativeOn: {
							    click: function(){
							    	console.log('nativeOn')
							    }
								}
							},[
								create('i-button',{
									attrs: {
										icon: 'ios-cloud-upload-outline'
									},
									on: {
										beforeUpload: function(file){
											console.log('绑在按钮上的 file: ',file)
											this.file = file;
								      return false;
										}
									}
								}, "上传")
							])
					}else if(params.row.in == 'body'){
						// in 是 body
						return create('div',{
								style: {
									marginBottom: "10px"
								}
							},[
								create('Input',{
									attrs: {
										type: "textarea",
										rows: 4,
										placeholder: txt,
										id: params.row.name
									},
									style: {
										marginTop: "10px",
										marginBottom: "10px"
									}
								})
							])
					}else{
						return create("Input",{
							attrs: {
								size: "small",
								placeholder: txt,
								id: params.row.name
							}
						})
					}
				}
			}, 
			{
				title: "Description",
				key: "description",
				render: function(create,params){
					var mark = params.row.required ? 'strong' : 'span';
					return create(mark,params.row.description)
				}
			}, 
			{
				title: "Parameter Type",
				key: "in",
				width: 300,
				render: function(create,params){
					var txt = ''
					if (params.row.in == 'path') {
						txt = params.row.in + '  (路径参数，例如：/users/{id})'
					} else if(params.row.in == 'query'){
						txt = params.row.in + '  (查询参数，例如：/users?role=admin)'
					}else{
						txt = params.row.in
					}
					return create('span',txt)
				}
			}, 
			{
				title: "Data Type",
				key: "type",
				render: function(create,params){
					var txt = ''
					if (params.row.type){
						txt = params.row.type
					}else if(params.row.schema && params.row.schema.type){
						txt = params.row.schema.type
					}
					return create('span',txt)
				}
			}, 
			{
				title: "Required",
				key: "required",
				render: function(create, params){
					if(params.row.required){
						return create("Icon",{
							attrs: {
								type: "checkmark-round"
							}
						})	
					}
				}
			}
		],
		responseColumns: [
			{
				title: "Properties",
				key: "properties",
			}, {
				title: "Type",
				key: "type",
				width: 248
			}, {
				title: "Description",
				key: "description",
			}
		],
		rules: {}
	},
	methods: {
		// 确定设置
		buSureSetting: function(){
			var vm = this;
			if(vm.settingForm.remember){
				localStorage.setting = JSON.stringify(this.settingForm);
			}else{
				sessionStorage.setting = JSON.stringify(this.settingForm);
			}
			vm.shadeShow = false;
		},
		initClipboard: function(){
			new Clipboard('.copyResponseBody');
			new Clipboard('.copyRequestUrl');
		},
		initIScroll: function(){
			var vm = this;
			vm.$nextTick(function(){
				vm.myScroll = new IScroll('#wrapper', { scrollX: true, scrollY: false, mouseWheel: true });	
			})
		},
		iScrollRefresh: function(){
			this.myScroll && this.myScroll.refresh();
		},
		sidebarSearch: function(){
			var vm = this,i,ai,sidebarData = [];
			if(!vm.sidebarSearchInp){
				vm.sidebarData = vm.originalSidebarData;
				return
			}
			var has = false;
			for(i=0;i<vm.searchData.length;i++){
				ai = vm.searchData[i];
				if(ai.description.indexOf(vm.sidebarSearchInp)>-1||ai.label.indexOf(vm.sidebarSearchInp)>-1){
					sidebarData.push({
						label: ai.label,
						method: ai.method,
						description: ai.description
					})
					has = true
				}
			}
			if(!has){
				vm.$Message.warning("没有您要找的信息！")
				return
			}
			vm.sidebarData = sidebarData;
		},
		selectMenu: function(name){
			var vm = this
			// 更新基础效果
			vm.upadteCurrentPageName(name);
			vm.updateOpenedPages(name);
			// 更新展示数据
			vm.updateShowData(name);
			// 初始化/更新插件
			vm.initClipboard();
			// vm.clickTabs('debug');
			vm.initIScroll();
			vm.onOff = true;
		},
		updateShowData: function(name){
			var vm = this;
				// 更新当前页数据  vm.currentPageData
			vm.updateCurrentPageFixedData(name);
			vm.updateCurrentPageChangeData(name);
				// 保存当前页数据
			vm.updateOpenedPagesData(name,vm.currentPageData);
		},
		upadteCurrentPageName: function(name){
			this.currentPageName = name;
			sessionStorage.currentPageName = name;
			this.updateSidebar(name);
		},
		updateSidebar: function(name){
			var vm = this,i,has=false;
			var parentName = vm.getParentName(name);
			for(i=0;i<vm.openNames.length;i++){
				if(parentName==vm.openNames[i]){
					has=true;
				}
			}
			!has && vm.openNames.push(parentName);
			vm.$nextTick(function(){
				vm.$refs.sideMenu.updateOpened();
				vm.$refs.sideMenu.updateActiveName();
			})
		},
		getParentName: function(name){
			var parentName = '',vm=this,i,j,_name;
			var data = deepcopy(vm.sidebarData);
			for(i=0;i<data.length;i++){
				if(parentName)break;
				for(j=0;j<data[i].children.length;j++){
					_name = data[i].children[j].label + '.' + data[i].children[j].method
					if(name==_name){
						parentName = data[i].tags
						break
					}
				}
			}
			return parentName
		},
		updateOpenedPages: function(name){
			var vm=this;
			var openedPages=deepcopy(vm.openedPages);
			if(!vm.nameInOpenedPages(name)){
				openedPages.push(name)
			}
			vm.openedPages = openedPages
		},
		updateCurrentPageFixedData: function(name){
			var nowPageDate = {},vm=this;
			nowPageDate.mainData = vm.updateMainData(name);
			nowPageDate.headerTable = vm.updateHeaderTable(nowPageDate.mainData.parameters);
			nowPageDate.parametersTable = vm.updateParametersTable(nowPageDate.mainData.parameters);
			nowPageDate.debugTable = vm.updateDebugTable(nowPageDate.mainData.parameters,vm.needToken(nowPageDate.mainData))
			nowPageDate.tableData = [{
				path: nowPageDate.mainData.path,
				summary: nowPageDate.mainData.summary,
				description: nowPageDate.mainData.description,
				consumes: nowPageDate.mainData.consumes,
				produces: nowPageDate.mainData.produces,
			}]
			nowPageDate.responseData = vm.getResponseData(nowPageDate.mainData.responses)
			// vm.mainData = vm.updateMainData(name);
			// vm.headerTable = vm.updateHeaderTable(vm.mainData.parameters);
			// vm.parametersTable = vm.updateParametersTable(vm.mainData.parameters);
			// vm.debugTable = vm.updateDebugTable(vm.mainData.parameters,vm.needToken())
			// vm.tableData = [{
			// 	path: vm.mainData.path,
			// 	summary: vm.mainData.summary,
			// 	description: vm.mainData.description,
			// 	consumes: vm.mainData.consumes,
			// 	produces: vm.mainData.produces,
			// }]
			// vm.responseData = vm.getResponseData(vm.mainData.responses);

			//  回显当前页应该显示的数据
			// vm.resetShowData();
			vm.currentPageData = nowPageDate;
		},
		nameInOpenedPages: function(name){
			var vm = this,inOpenedPages=false,i;
			for(i=0;i<vm.openedPages.length;i++){
				if(name==vm.openedPages[i]){
					inOpenedPages=true
				}
			}
			return inOpenedPages
		},
		updateOpenedPagesData: function(name,data){
			var openedPagesData = deepcopy(this.openedPagesData);
			openedPagesData[name] = data
			this.openedPagesData = openedPagesData
		},
		updateCurrentPageChangeData: function(name){
			var vm = this;
			console.log('vm.currentPageData: ',vm.currentPageData);
			// var openedPages = vm.openedPages,len=vm.openedPages.length;
			var parameters = vm.currentPageData.debugTable || {};
			var tableForm = vm.getTableForm(parameters);  //保存表格数据
			var tableJson = vm.textareaJsonStr || '';
			var response = deepcopy(vm.currentPageData.response) || {};
			// 根据什么判断：
			// 1）从总数据对象里回显数据
			// 2）初始化数据

		},
		getTableForm: function(data){
			// 入参data是调试表格的数据
			var tableForm = {},len=data.length;
			if(len){
				for(var i=0;i<len;i++){
					var key = data[i].name
					if(data[i].in == 'body'){
						tableForm[key] = $('#' + key + ' textarea').val();
					}else if(data[i].in == 'formData'){
						// 上传文件
						tableForm[key] = vm.file;
					}else{
						var val = $('#' + key + ' input').val();
						tableForm[key] = val || '';  //未切换时，还未渲染，获取不到
					}
				}
			}
			console.log('tableForm: ',tableForm)
			return tableForm
		},
		updateHeaderTable: function(data){
			var headerTable = [],i;
			for(i=0;i<data.length;i++){
				if(data[i].in=="header"){
					headerTable.push(data[i])
				}
			}
			return headerTable
		},
		updateParametersTable: function(data){
			var parametersTable = [],i;
			for(i=0;i<data.length;i++){
				if(data[i].in=="header"){
					continue
				}
				parametersTable.push(data[i])
			}
			return parametersTable
		},
		updateDebugTable: function(data,needToken){
			var debugTable = [];
			if(needToken){
				debugTable = deepcopy(data)
			}else{
				for (var i = data.length - 1; i >= 0; i--) {
					if(data[i].in=="header"){
						continue
					}
					debugTable.push(data[i])
				}
			}
			return debugTable
		},
		choseOperation: function(name){
			var vm = this;
			if(name=='clear'){
				// 清除配置操作
				vm.$Modal.confirm({
					title: "确认清除配置",
					content: "清除配置后需要重新进行配置，请确认",
					onOk: function(){
						if(sessionStorage.setting){
							sessionStorage.removeItem('setting')
						}
						if(localStorage.setting){
							localStorage.removeItem('setting')
						}
						vm.resetSettingForm();
						vm.shadeShow = true;
					}
				})
			}else if(name =="modify"){
				if(localStorage.setting){
					vm.settingForm = JSON.parse(localStorage.setting);	
				}
				vm.shadeShow = true;
			}
		},
		// 批量关闭
		closePages: function(name){
			var vm = this,i,data = deepcopy(vm.openedPages),ind;
			var len=data.length;
			for(i=0;i<data.length;i++){
				if(data[i]==vm.currentPageName){
					ind=i
				}
			}
			if(typeof ind == 'undefined')return
			if(name=="other"){
				data = data.splice(ind,1);
			}else if(name=="left"){
				if(ind!=0){
				 	data = data.splice(ind);
				}
			}else if(name=="right"){
				if(ind!=len-1){
					data = data.splice(0,ind+1);
				}
			}
			vm.openedPages = data;
			vm.upadteCurrentPageName(vm.currentPageName);
		},
		// 关闭某一页
		closePage: function(name){
			var vm = this,i,data = deepcopy(vm.openedPages),ind;
			var len = data.length;
			for(i=0;i<data.length;i++){
				if(data[i]==name){
					ind=i
				}
			}
			if(typeof ind == 'undefined')return
			if(name==vm.currentPageName){
				// close  current  tag
				if(len==1){
					vm.currentPageName = '';
				}else if(ind==len-1){
					vm.currentPageName = data[ind-1]
				}else{
					vm.currentPageName = data[ind+1]
				}
			}	
			data.splice(ind,1);
			vm.openedPages = data;
			vm.upadteCurrentPageName(vm.currentPageName);
		},
		clickTag: function(name){
			var vm=this;
			vm.selectMenu(name);
			vm.upadteCurrentPageName(name);
		},
		resetSettingForm: function(){
			this.settingForm = {
				language: 'zh-CN',
				defaultAuth: '',
				noAuth: [],
				remember: true,
			}
		},
		resetShowData: function(){
			var vm = this;
			$("#json-response").empty();
			vm.textareaJsonStr = "";
			for(var key in vm.currentPageData.response){
				vm.currentPageData.response[key] = ""
			}
			vm.file = null;
			vm.showResponse = false;
		},
		// 当Parameter Type为body时默认展示文本域
		clickTabs: function(name){
			var vm = this
			var parameters = vm.currentPageData.mainData.parameters;
			if (name=="debug" && parameters) {
				for(var i=0;i<parameters.length;i++){
					var ai = parameters[i]
					if(ai.in == 'body'){
						vm.tableTextarea = false
						return
					}
				}
			}
			// 测试：切换时，组件是否销毁;   结果：初始不展示的切换框不进行编译，无法获取内部内容
			// vm.getTableForm(vm.currentPageData.debugTable)
			vm.tableTextarea = true
		},
		getResponseData: function(data){
			var _data = deepcopy(data)
			var returnData = []
			for(var key in _data){
				returnData.push({
					properties: key,
					type: (_data[key].schema && _data[key].schema.type) || '',
					description: _data[key].description
				})
			}
			return returnData
		},
		updateMainData: function(name) {
			var path = name.split(".")[0];
			var method = name.split(".")[1];
			var mainData = deepcopy(this.paths[path][method])
			mainData["path"] = path;
			mainData["method"] = method;
			return mainData
		},
		getUrl: function(urlStr,data){
			var i,str = '' + urlStr;
			if(typeof data != 'undefined'){
				for(i=0;i<data.length;i++){
					var ai = data[i];
					if(ai.in == 'path'){
						// 因为iview创建的Input，ID加在外层div上
						var key = ai.name
						var val = $("#" + key + ' input').val()
						str = str.replace('{' + key + '}',val)
					}
				}	
			}
			return str
		},
		getParams: function(){
			var vm = this,ajaxData = {};
			var data = vm.currentPageData.mainData,parameters = vm.currentPageData.mainData.parameters;
			if(vm.tableTextarea){
				// 输入框输入
				var num = 0;
				if(parameters){
					console.log('获取参数parameters: ',parameters)
					for(var i=0;i<parameters.length;i++){
						var _key = parameters[i].name
						if(parameters[i].in == 'path' || parameters[i].in == 'header'){
							continue
						}
						if(parameters[i].in == 'body'){
							// 多个body先不处理，先把一个body的测试成功
							ajaxData = num ? '' : $('#' + _key + ' textarea').val();
							num++
						}else if(parameters[i].in == 'formData'){
							// 上传文件
							if(!vm.file&&parameters[i].required){
								vm.$Message.error('请上传文件')
								return false
							}
							ajaxData[_key] = vm.file;
						}else{
							var _val = $('#' + _key + ' input').val();
							var required = parameters[i].required
							// 必填提示
							if(required && _val == ""){
								var errTxt = _key + '(' + parameters[i].description + ')' +'为必填项，不能为空！';
								vm.$Message.error(errTxt);
								return false;
							}else if(_val == ""){
								continue
							}
							ajaxData[_key] = _val	
						}
					}
				}
			}else{
				// 文本域输入
				if(!vm.isDisabled){
					var str = "" + vm.textareaJsonStr
					try{
	        	ajaxData = JSON.parse(str);
	       	}catch(error){
	        	vm.$Message.error("请输入json格式的数据")
	        	return false;
	       	}
	       	// 必填提示
	       	for(var j=0;j<parameters.length;j++){
						var _required = parameters[j].required
						if(_required && parameters[j].in!='body'){
							// 必填字段的parameter type是body时，该字段不进行验证
							var requiredKey = parameters[j].name
							if(!typeof ajaxData[requiredKey]){
								var _errTxt = requiredKey + '(' + parameters[j].description + ')' +'为必填项，不能为空！';
								vm.$Message.error(_errTxt);
								return false;
							}	
						}
					}
				}
			}
			var method = vm.currentPageData.mainData.method.toLocaleLowerCase();
			var url = vm.getUrl(vm.basePath + vm.currentPageData.mainData.path,vm.currentPageData.mainData.parameters);
			var params = {
				url: url,
				method: method
			}
			if(method == "put" || method == "post" || method == "patch"){
				params["data"] = ajaxData;
			}else if(method == "get" || method == "delete"){
				params["params"] = ajaxData;
			}else{
				// head OPTIONS  TRACE请求不做处理
				// vm.$Message.error("请求方式不属于get、post、put、patch、delete中的任何一种");
				// return
			}
			return params
		},
		// 根据body设置  content-type
		setContentType: function(){
			var vm = this,contentType;
			var parameters = vm.currentPageData.mainData.parameters
			if(parameters){
				for(var i=0;i<parameters.length;i++){
					var ai = parameters[i];
					if(ai.in == 'body'){
						contentType = 'application/json;charset=UTF-8';
						break;
					}
				}	
			}
			contentType = 'application/x-www-form-urlencoded';
			axios.defaults.headers.patch['Content-Type'] = contentType;
			axios.defaults.headers.post['Content-Type'] = contentType;
			axios.defaults.headers.put['Content-Type'] = contentType;
		},
		submitDebug: function(){
			var vm = this;
			if(!vm.getParams()){
				return
			}
			vm.spinShow = true;
			var params = vm.getParams();
			// 设置contentType
			vm.setContentType();
			// 设置token
			vm.setToken();
			console.log('请求参数： ',params)
			axios(params).then(function(res){
				var rd = res.data;
				console.log('返回：',rd);
				vm.updateResponse(res,params);
				var htmlStr = vm.getShowJsonResponse(rd);
				$("#json-response").html(htmlStr);
				vm.spinShow = false;
				vm.showResponse = true;
			})
		},
		updateResponse: function(res,params){
			var vm = this;
			if(!vm.currentPageData.response)vm.currentPageData.response={};
			vm.currentPageData.response.requestUrl = vm.getRequestUrl(params,vm.currentPageData.mainData.parameters);
			vm.currentPageData.response.requestHeader = res.config.headers;
			vm.currentPageData.response.code = res.status;
			vm.currentPageData.response.headers = res.headers;
		},
		setToken: function(){
			var vm = this;
			var token = localStorage.token || sessionStorage.token || "";
			var parameters = vm.currentPageData.mainData.parameters,i,tokenCanSet=false,ind;
			for(i in parameters){
				if(parameters[i].in=="header"){
					tokenCanSet = true;
					ind = i;
				}
			}
			if(tokenCanSet && $("#" + parameters[ind].name + " input").val()){
				token = $.trim($("#" + parameters[ind].name + " input").val());
			}else{
				var settingForm = JSON.parse(localStorage.setting) || JSON.parse(sessionStorage.setting);
				token = settingForm.defaultAuth.trim();
			}
			// 先可以设置token进行调试
			// token ? axios.defaults.headers.common[vm.defaultTokenKey] = token : delete axios.defaults.headers.common[vm.defaultTokenKey];
			vm.needToken() ? axios.defaults.headers.common[vm.defaultTokenKey] = token : delete axios.defaults.headers.common[vm.defaultTokenKey]
		},
		needToken: function (data){
			var need = true,vm=this,i;
			data = data || vm.currentPageData.mainData;
			var nowPath = data.path;
			var method = data.method;
			var mark = nowPath + '.' + method
			var needArr = JSON.parse(localStorage.setting).noAuth;
			for(i=0;i<needArr.length;i++){
				if(mark==needArr[i]){
					need = false
				}
			}
			return need
		},
		getRequestUrl: function(params,data){
			var urlParams = deepcopy(params.data || params.params);
			var requestUrl = '' + params.url;
			if(!isNullObjec(data)){
				var j = 0;
				for(var i=0;i<data.length;i++){
					var ai = data[i];
					if(ai.in == 'query' && urlParams[ai.name]){
						requestUrl += j ? ('&' + ai.name + '=' + urlParams[ai.name]) : ('?' + ai.name + '=' + urlParams[ai.name])
						j++	
					}
				}	
			}
			return requestUrl
		},
		getShowJsonResponse: function(dataObj){
			var content = JSON.stringify(dataObj);
			var result = '';
			try{
				result = new JSONFormat(content,2).toString();
			}catch(e){
        result = '<span style="color: #f1592a;font-weight:bold;">' + e + '</span>';
      }
      return result
		},
		copySuccess: function(){
			this.$Message.success("复制成功");
		},
		checkToForm: function(){
			this.tableTextarea = true
		},
		checkToJson: function(){
			this.tableTextarea = false;
		},
		initSearchData: function(data){
			var searchData = [],key,childKey;
			for(key in data){
				// key  请求url
				for(childKey in data[key]){
					// childKey 请求方法
					searchData.push({
						method: childKey,
						label: key,
						description: data[key][childKey].description || ''
					})
				}
			}
			return searchData
		},
		initTagsMap: function(data){
			var tagsMap = {},vm=this,i,key,val;
			for(i=0;i<data.length;i++){
				key=data[i].label + '.' + data[i].method;
				val=data[i].description ? data[i].description : key;
				tagsMap[key]=val
			}
			return tagsMap
		},
		initNoAuth: function(data){
			var noAuth = [],i,ai,j;
			for(i=0;i<data.length;i++){
				ai = data[i]
				noAuth.push({
					value: ai.label + '.' + ai.method,
					label: ai.method + '  ' +ai.description,
					path: ai.label,
					method: ai.method
				})
			}
			return noAuth
		},
		// 根据paths获取侧边栏数据
		initSidebarData: function(data){
			var sidebarData = [],key,_key,childKey,_childKey,arr=[],i,j,k;
			for(_key in data){
				// key  请求url
				for(_childKey in data[_key]){
					// childKey 请求方法  标识
					arr.push(data[_key][_childKey].tags[0])
				}
			}
			arr = arr.unique();
			for(i=0;i<arr.length;i++){
				sidebarData.push({
					name: arr[i],
					tags: arr[i],
					children: []
				})
			}
			for(j=0;j<sidebarData.length;j++){
				for(key in data){
					// key  请求url
					for(childKey in data[key]){
						// childKey 请求方法
						if(sidebarData[j].tags == data[key][childKey].tags[0]){
							sidebarData[j].children.push({
								label: key,
								method: childKey,
								description: data[key][childKey].description
							});
						}
					}
				}
			}
			return sidebarData
		},
		handleUpload: function(file){
			this.file = file;
			return false
		}
	},
	computed: {
		isDisabled: function(){
			var vm = this,i;
			var data = vm.currentPageData.debugTable
			var len = data ? data.length : 0;
			var num = len;
			for(i=0;i<len;i++){
				if(data[i].in=="header"){
					num--
				}
			}
			return num ? false : true
		}
	},
	created: function () {
		var vm = this
		vm.shadeShow = localStorage.setting ? false : true;
		axios.get('v2/api-docs')
			.then(function(res){
				var resData = deepcopy(res.data);
				console.log('服务端返回的所有数据：',resData)
				vm.info = resData.info
				vm.basePath = resData.basePath;
				vm.paths = resData.paths;
				vm.searchData = vm.initSearchData(vm.paths);
				vm.tagsMap = vm.initTagsMap(vm.searchData);
				vm.noAuth = vm.initNoAuth(vm.searchData);
				vm.sidebarData = vm.initSidebarData(resData.paths);
				vm.originalSidebarData = deepcopy(vm.sidebarData);
				window.document.title = vm.info.title
			})
	},
	mounted: function(){
		this.initClipboard();
	}
})

// 拖拽
$("#drag-line").mousedown(function(){
	var left,self=$(this);
	return document.onmousemove = function(e) {
		var e = e || event;
		left = e.clientX; //这里应该是鼠标的位置的left
		if(left<300)left=300
		if(left>600)left=600
		self.css({"left": function(){
			return left + 'px'
		}});
		$("#zsx-sidebar").css({"width": function(){
			return left+'px'
		}});
		$("#zsx-main-right").css({"left": function(){
			return left+4 +'px'
		}});
	},
	document.onmouseup = function() {
			document.onmousemove = null;
    	document.onmouseup = null;
	},
	false
})