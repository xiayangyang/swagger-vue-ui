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
new Vue({
	el: "#app",
	i18n: i18n,
	data: {
		sidebarTheme: "dark",
		showWhichOneTab: 'description',
		parameterTypeBody: false, //参数是body
		spinShow: false, //加载中
		paramsTxt: '', //请求的路径参数
		onOff: false,
		tableTextarea: true,
		basePath: "",
		info: {},
		paths: {}, // 经过处理的返回的所有的数据
		tags: [],
		// collapsed  nl2br  recursive_collapser  escape  strict 
		jsonViewerOptions: {
			// collapsed: true,
        	withQuotes: true
        	// nl2br: true,
        	// recursive_collapser: true,
        	// escape: false,
        	// strict: true,
		},
		sidebarData: [],
		mainData: {}, // 已选中菜单的所有数据   mainData.parameters   parameters下边的表格展示的数据
		tableData: [], // parameters上边的表格展示的数据
		responseData: [],
		jsonTreeData: {},//调试返回展示数据
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
			}, {
				title: "Description",
				key: "description",
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
		debugColumns: [
			{
				title: "Name",
				key: "name",
				render: function(create,params){
					var param = [create('span',params.row.name)]
					if(params.row.required){
						param.unshift(create('span',{
							style: {
								color: "red"
							}
						},"*"))
					}
					return create('div',param)
				}
			}, {
				title: "Value",
				key: "value",
				render: function(create, params) {
					var txt = ""
					if(params.row.required){
						txt = "required"
					}
					return create("Input",{
						attrs: {
							size: "small",
							placeholder: txt,
							id: params.row.name
						}
					})
				}
			}, {
				title: "Description",
				key: "description",
			}, {
				title: "Parameter Type",
				key: "in",
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
		]
	},
	methods: {
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
			vm.responseData = vm.getResponseData(vm.mainData.responses)
			// 切换菜单清空输入和展示的返回数据,调整侧边栏文字颜色
			vm.textareaJsonStr = ""
			$("#json-response").empty();
			vm.paramsTxt = ''
			// 切换时默认展示table
			// vm.showWhichOneTab = 'description'
			// vm.tableTextarea = true
			vm.clcikTag('debug')
			vm.onOff = true
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
		updateMainData: function(name) {
			var mainData = deepcopy(this.paths[name])
			mainData["path"] = name
			return mainData
		},
		getKey: function(urlStr){
			var str = "" + urlStr
			var ind = str.indexOf("{")
			if(ind>-1){
				var ind2 = str.indexOf("}")
				return str.slice(ind+1,ind2)
			}else{
				return false
			}
		},
		getParams: function(){
			var vm = this
			var method = vm.mainData.method.toLocaleLowerCase();
			var url = vm.basePath + vm.mainData.path;
			if(vm.getKey(url)){
				// 处理Parameter Type为path：即URL中的{key}
				var key = vm.getKey(url)
				var val = $("#" + key + ' input').val()  // 因为iview创建的Input，ID加在外层div上
				url = url.replace("{"+key+"}",val);
			}
			var ajaxData = {};
			if(vm.tableTextarea){
				// 输入框输入
				if(vm.mainData.parameters){
					for(var i=0;i<vm.mainData.parameters.length;i++){
						var _key = vm.mainData.parameters[i].name
						var _val = $('#' + _key + ' input').val();
						var required = vm.mainData.parameters[i].required
						if(required && _val == ""){
							var errTxt = _key + '为必填项，不能为空！';
							vm.$Message.error(errTxt);
							return false;
						}
						ajaxData[_key] = _val
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
			var url = params.url
			var urlParams = params.data || params.params
			var paramsTxt = ''
			if(isNullObjec(urlParams)){
				paramsTxt = url
			}else{
				paramsTxt = url + '?' + vm.formatParams(urlParams)
			}
			vm.paramsTxt = paramsTxt
			axios(params).then(function(res){
				var rd = res.data
				$("#json-response").jsonViewer(rd, vm.jsonViewerOptions);
				vm.spinShow = false;
			})
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
			this.tableTextarea = false
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
			_parent.push({
				name: 'no-father',
				label: 'no-father',
				description: '无父级接口',
				children: []
			})
			var child = _parent[_parent.length-1].children
			for(var item in dataCopy){
				child.push({
					name: item,
					method: dataCopy[item].method,
					description: dataCopy[item].description || "",
					label: item
				})
			}
			returnData = _parent
			return returnData
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
				vm.tags = resData.tags
				vm.sidebarData = vm.initSidebarData(vm.tags,vm.paths)
				window.document.title = vm.info.title
			})
	}
})