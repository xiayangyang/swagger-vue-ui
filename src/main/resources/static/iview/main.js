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
			besure: '确定',
			debug: '调试',
			none: '无',
			languageChoose: '语言选择',
			upload: '上传',
			copyResponse: '复制返回值',
			copyRequestUrl: '复制请求路径',
			searchPlaceholder: '请输入接口名称或接口路径'
		},
		sidebarSearchInp: '', // 侧边栏搜索
		file: null, //调试时上传的文件
		uploadUrl: "", //上传文件的url
		shadeShow: true, // 配置是否显示
		sidebarTheme: "dark",
		showWhichOneTab: 'description',
		parameterTypeBody: false, //参数是body
		spinShow: false, //加载中
		onOff: false,
		tableTextarea: true,
		showResponse: false,
		response: {
			curl: '',
			requestUrl: '',
			requestHeader: '',
			code: '',
			headers: ''
		},
		tags: [],
		file: null, //上传的文件
		basePath: "",
		info: {},
		paths: {}, // 经过处理的返回的所有的数据
		// collapsed  nl2br  recursive_collapser  escape  strict 
		jsonViewerOptions: {
        	withQuotes: true
		},
		dataTypeInitMap: {
			string: '',
			integer: 0
		},
		settingForm: {
			language: 'zh-CN'
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
		activeName: '', //激活的侧边栏菜单
		openNames: [], //展开的菜单
		originalSidebarData: [],
		searchData: [],
		sidebarData: [],// {name,description}
		mainData: {}, // 已选中菜单的所有数据
		tableData: [],
		responseData: [],
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
			}, {
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
								}),
								// create('span','Parameter content type:'),
								// create('span','application/json')
								// create('Select',{

								// },[
								// 	create('Option',)
								// ])
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
			this.shadeShow = false;
		},
		initClipboard: function(){
			new Clipboard('.copyResponseBody');
			new Clipboard('.copyRequestUrl');
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
		updateOpened: function(){
			var vm = this;
			vm.$nextTick(function(){
	      if (vm.$refs.sideMenu) {
	        vm.$refs.sideMenu.updateOpened();
	        vm.$refs.sideMenu.updateActiveName();
	      }
	    })
		},
		selectMenu: function(name){
			var vm = this
			vm.mainData = vm.updateMainData(name)
			vm.tableData = [{
				path: vm.mainData.path,
				summary: vm.mainData.summary,
				description: vm.mainData.description,
				consumes: vm.mainData.consumes,
				produces: vm.mainData.produces,
			}]
			vm.responseData = vm.getResponseData(vm.mainData.responses);
			vm.resetShowData();
			vm.initClipboard();
			// vm.clcikTag('debug');
			vm.onOff = true;
		},
		choseOperation: function(name){
			if(name=='clear'){
				// 清除配置操作
			}
		},
		resetShowData: function(){
			var vm = this;
			$("#json-response").empty();
			vm.textareaJsonStr = "";
			for(var key in vm.response){
				vm.response[key] = ""
			}
			vm.file = null;
			vm.showResponse = false;
		},
		// 当Parameter Type为body时默认展示文本域
		clcikTag: function(name){
			var vm = this
			if (name=="debug" && vm.mainData.parameters) {
				for(var i=0;i<vm.mainData.parameters.length;i++){
					var ai = vm.mainData.parameters[i]
					if(ai.in == 'body'){
						vm.tableTextarea = false
						return
					}
				}
			}
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
			mainData["path"] = path
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
			var vm = this
			var ajaxData = {};
			if(vm.tableTextarea){
				// 输入框输入
				var num = 0;
				if(vm.mainData.parameters){
					var data = vm.mainData.parameters
					for(var i=0;i<data.length;i++){
						var _key = data[i].name
						if(data[i].in == 'path'){
							continue
						}
						if(data[i].in == 'body'){
							// 多个body先不处理，先把一个body的测试成功
							ajaxData = num ? '' : $('#' + _key + ' textarea').val();
							num++
						}else if(data[i].in == 'formData'){
							// 上传文件
							if(!vm.file&&data[i].required){
								vm.$Message.error('请上传文件')
								return false
							}
							ajaxData[_key] = vm.file;
						}else{
							var _val = $('#' + _key + ' input').val();
							var required = data[i].required
							// 必填提示
							if(required && _val == ""){
								var errTxt = _key + '为必填项，不能为空！';
								vm.$Message.error(errTxt);
								return false;
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
			       	for(var j=0;j<vm.mainData.parameters.length;j++){
						var _required = vm.mainData.parameters[j].required
						if(_required && vm.mainData.parameters[j].in!='body'){
							// 必填字段的parameter type是body时，该字段不进行验证
							var requiredKey = vm.mainData.parameters[j].name
							if(!typeof ajaxData[requiredKey]){
								var _errTxt = requiredKey + '字段为必填项，不能为空！';
								vm.$Message.error(_errTxt);
								return false;
							}	
						}
					}
				}
			}
			var method = vm.mainData.method.toLocaleLowerCase();
			var url = vm.getUrl(vm.basePath + vm.mainData.path,vm.mainData.parameters);
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
		getContentType: function(){
			var vm = this;
			if(vm.mainData.parameters){
				for(var i=0;i<vm.mainData.parameters.length;i++){
					var ai = vm.mainData.parameters[i];
					if(ai.in == 'body'){
						return 'application/json;charset=UTF-8';
					}
				}	
			}
			return 'application/x-www-form-urlencoded';
		},
		submitDebug: function(){
			var vm = this;
			if(!vm.getParams()){
				return
			}
			vm.spinShow = true;
			var params = vm.getParams();
			vm.response.requestUrl = vm.getRequestUrl(params,vm.mainData.parameters);
			// 根据body设置  content-type
			axios.defaults.headers.patch['Content-Type'] = vm.getContentType();
			axios.defaults.headers.post['Content-Type'] = vm.getContentType();
			axios.defaults.headers.put['Content-Type'] = vm.getContentType();
			axios(params).then(function(res){
				var rd = res.data;
				vm.response.requestHeader = res.config.headers;
				vm.response.code = res.status;
				vm.response.headers = res.headers;
				var htmlStr = vm.getShowJsonResponse(rd);
				$("#json-response").html(htmlStr);
				vm.spinShow = false;
				vm.showResponse = true;
			})
		},
		getRequestUrl: function(params,data){
			var urlParams = deepcopy(params.data || params.params);
			var requestUrl = '' + params.url;
			if(!isNullObjec(data)){
				var j = 0;
				for(var i=0;i<data.length;i++){
					var ai = data[i];
					if(ai.in == 'query'){
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
			console.log('vm.searchData: ',searchData)
			return searchData
		},
		// 根据paths获取侧边栏数据
		initSidebarData: function(data){
			var sidebarData = [],arr = [],key,item,i,j;
			for(key in data){
				arr.push(data[key].tags)
			}
			arr = arr.unique();
			for(i=0;i<arr.length;i++){
				sidebarData.push({
					name: arr[i],
					label: arr[i],
					tags: arr[i],
					children: []
				})
			}
			for(j=0;j<sidebarData.length;j++){
				for(item in data){
					if(sidebarData[j].tags==data[item].tags){
						sidebarData[j].children.push({
							name: item,
							label: item,
							method: data[item].method,
							description: data[item].description
						})
					}
				}
			}
			return sidebarData
		},
		initSidebarData2: function(data){
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
		// 将数据减层(将请求的一级去除，和其子数据同级，用method字段记录,将tags有只有一项的array转为该项的string)
		handleResData: function(data){
			var _data = {}
			for(var key in data) {
				for(var childKey in data[key]){
					_data[key] = {}
					_data[key].method = childKey
					for(var grandSonKey in data[key][childKey]){
						_data[key][grandSonKey] = data[key][childKey][grandSonKey]
						if(grandSonKey=='tags'){
							_data[key][grandSonKey] = data[key][childKey][grandSonKey][0]
						}
					}
				}
			}
			return _data
		},
		handleUpload: function(file){
			this.file = file;
			return false
		}
	},
	computed: {
		isDisabled: function(){
			return this.mainData.parameters && this.mainData.parameters.length ? false : true
		}
	},
	created: function () {
		var vm = this
		axios.get('v2/api-docs')
			.then(function(res){
				var resData = deepcopy(res.data);
				console.log('服务端返回的所有数据：',resData)
				vm.info = resData.info
				vm.basePath = resData.basePath;
				vm.paths = resData.paths;
				vm.searchData = vm.initSearchData(vm.paths);
				vm.sidebarData = vm.initSidebarData2(resData.paths);
				vm.originalSidebarData = deepcopy(vm.sidebarData);
				window.document.title = vm.info.title
			})
	},
	mounted: function(){
		this.initClipboard();
	}
})