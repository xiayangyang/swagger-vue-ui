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
var i18n = new VueI18n({})
var uploadTemplate = '<Upload :before-upload="handleUpload" :action="uploadUrl"><i-button type="ghost" icon="ios-cloud-upload-outline">{{label.upload}}</i-button></Upload>'
new Vue({
	el: "#app",
	i18n: i18n,
	data: {
		label: {
			setting: '配置',
			besure: '确定',
			debug: '调试',
			none: '无',
			languageChoose: '语言选择',
			upload: '上传'
		},
		file: null, //调试时上传的文件
		uploadUrl: "", //上传文件的url
		shadeShow: false, // 配置是否显示
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
			// collapsed: true,
        	withQuotes: true
        	// nl2br: true,
        	// recursive_collapser: true,
        	// escape: false,
        	// strict: true,
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
									action: '',

								},
								style: {
									marginTop: '8px'
								},
								// on: {
								// 	hover: function(){alert(1)},
								// 	beforeUpload: function(file){
								// 		console.log('file: ',file)
								// 		this.file = file;
							 //            return false;
								// 	}
								// }
							},[
								create('i-button',{
									attrs: {
										icon: 'ios-cloud-upload-outline'
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
			vm.clcikTag('debug')
			vm.onOff = true
		},
		resetShowData: function(){
			var vm = this;
			$("#json-response").empty();
			vm.requestUrl = '';
			// vm.textareaJsonStr = vm.initTextareaJson()
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
		getResponseData(data){
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
		updateMainData: function(path) {
			var mainData = deepcopy(this.paths[path])
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
				if(vm.mainData.parameters){
					var data = vm.mainData.parameters
					for(var i=0;i<data.length;i++){
						var _key = data[i].name
						if(data[i].in == 'body'){
							ajaxData = $('#' + _key + ' textarea').val()
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
						if(_required){
							var requiredKey = vm.mainData.parameters[j].name
							if(ajaxData[requiredKey] == "" || typeof ajaxData[requiredKey] == 'undefined'){
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
		submitDebug: function(){
			var vm = this;
			if(!vm.getParams()){
				return
			}
			vm.spinShow = true;
			var params = vm.getParams();
			vm.response.requestUrl = vm.getRequestUrl(params,vm.mainData.parameters);
			// 根据body设置  content-type
			// contentType = 'application/x-www-form-urlencoded'  'application/json'
			// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
			// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
			axios(params).then(function(res){
				var rd = res.data
				vm.response.requestHeader = res.config.headers
				vm.response.code = res.status
				vm.response.headers = res.headers
				$("#json-response").jsonViewer(rd, vm.jsonViewerOptions);
				vm.spinShow = false;
				vm.showResponse = true;
			})
		},
		getRequestUrl: function(params,data){
			var urlParams = params.data || params.params;
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
		// 将对象格式的参数处理成字符串格式进行显示
		formatParams: function(obj){
			var txt = ''
			var i = 0;
			for(var key in obj){
				if(i==0){
					txt = key + '=' + obj[key]
				}else{
					txt += '&' + key + '=' + obj[key]
				}
				i++
			}
			return txt
		},
		checkToForm: function(){
			this.tableTextarea = true
		},
		checkToJson: function(){
			this.tableTextarea = false;
		},
		initTextareaJson: function(){
			var vm = this;
			var txt = '';
			if(!vm.isDisabled && vm.mainData.parameters && vm.mainData.parameters.length){
				var obj = {}
				for(var i=0;i<vm.mainData.parameters.length;i++){
					var ai = vm.mainData.parameters[i]
					obj[ai.name] = ai.schema && ai.schema.type ? vm.dataTypeInitMap[ai.schema.type] : ''
				}
				txt = JSON.stringify(obj)
			}
			return txt
		},
		initSidebarData: function (parentArr, dataObj) {
			var _data = deepcopy(dataObj)
			var dataCopy = deepcopy(dataObj)
			var _parent = deepcopy(parentArr)
			var returnData = []
			for(var i = 0;i<_parent.length;i++){
				_parent[i]["label"] = _parent[i]["name"]
				_parent[i]["children"] = []
				for(var key in _data){
					if(_data[key].tags["0"]==_parent[i]["name"]){
						delete dataCopy[key]
						_parent[i]["children"].push({
							name: key,
							method: _data[key].method,
							description: _data[key].description || "",
							label: key
						})
					}
				}
			}
			// 将无父级的接口放到一个菜单里
			// _parent.push({
			// 	name: 'no-father',
			// 	label: 'no-father',
			// 	description: '无父级接口',
			// 	children: []
			// })
			// var child = _parent[_parent.length-1].children
			// for(var item in dataCopy){
			// 	child.push({
			// 		name: item,
			// 		method: dataCopy[item].method,
			// 		description: dataCopy[item].description || "",
			// 		label: item
			// 	})
			// }
			// 无父级的单独列出来
			for(var item in dataCopy){
				_parent.push({
					name: item,
					method: dataCopy[item].method,
					description: dataCopy[item].description || "",
					label: item	
				})
			}
			returnData = _parent
			return returnData
		},
		// 根据paths获取侧边栏数据
		initSidebarData2: function(data){
			var sidebarData = [],arr = [],key,item,i,j;
			for(key in data){
				arr.push(data[key].tags)
			}
			arr = _.uniq(arr); // 不排序
			// arr = _.  //排序
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
		// 将数据减层(将请求的一级去除，和其子数据同级，用method字段记录,将tags有只有一项的array转为该项的string)
		handleResData2: function(data){
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
		// 将数据减层(将请求的一级去除，和其子数据同级，用method字段记录)
		handleResData: function(data){
			var _data = {}
			for(var key in data) {
				for(var childKey in data[key]){
					_data[key] = {}
					_data[key].method = childKey
					for(var grandSonKey in data[key][childKey]){
						_data[key][grandSonKey] = data[key][childKey][grandSonKey]
					}
				}
			}
			return _data
		},
		handleUpload: function(file){
			this.file = file;
			console.log('file: ',file)
			return false
		}
	},
	computed: {
		isDisabled: function(){
			return this.mainData.parameters && this.mainData.parameters.length ? false : true
		}
	},
	created () {
		var vm = this
		axios.get('v2/api-docs')
			.then(function(res){
				var resData = deepcopy(res.data)
				vm.info = resData.info
				vm.basePath = resData.basePath
				vm.paths = vm.handleResData(resData.paths)
				// vm.sidebarData = vm.initSidebarData(resData.tags,vm.paths);
				vm.sidebarData = vm.initSidebarData2(vm.handleResData2(resData.paths));
				window.document.title = vm.info.title
			})
	}
})