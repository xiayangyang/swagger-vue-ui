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
new Vue({
	el: "#app",
	data: {
		rd: {},
		sidebarTheme: "dark",
		onOff: false,
		tableTextarea: true,
		basePath: "",
		info: {},
		paths: {}, // 所有的数据
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
		// 侧边栏数据
		sidebarData: [],
		mainData: {}, // 已选中菜单的所有数据   mainData.parameters   parameters下边的表格展示的数据
		tableData: [], // parameters上边的表格展示的数据
		responseData: [],
		jsonTreeData: {},//调试返回展示数据
		textareaJsonStr: "",
		tableAjax: {}, //在表格中的提交数据
		parameterType: "",// json  form
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
			}, {
				title: "Data Type",
				key: "type",
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
				// render: (create, params) => {
				// 	var vm = this
					var txt = ""
					if(params.row.required){
						txt = "required"
					}
					return create("Input",{
						attrs: {
							size: "small",
							placeholder: txt,
							id: params.row.name
						},
						// on: {
						// 	input: function(val){
						// 		vm.$emit('input', event.target.value)
						// 		var key = params.row.name
						// 		vm.tableAjax[key] = val
						// 	}
						// }
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
			// 切换菜单清空已输入信息和展示的返回数据
			vm.textareaJsonStr = ""
			$("#json-response").empty();
			vm.onOff = true
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
				vm.$Message.error("请求方式不属于get、post、put、patch、delete中的任何一种");
				return
			}
			return params
		},
		submitDebug: function(){
			var vm = this;
			if(!vm.getParams()){
				// 数据验证未通过
				return
			}
			var params = vm.getParams();
			// console.log('请求params：',params)
			axios(params).then(function(res){
				var rd = res.data
				if(rd && rd.code == 1){
					vm.rd = rd;
				    $("#json-response").jsonViewer(rd, vm.jsonViewerOptions);
				}else if(rd&&rd.code != 1){
					vm.$Message.error(rd.code + ":  " +rd.message)
				}else{
					vm.$Message.error("返回对象为空")
				}
			})
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
			.catch(function(err){
				console.log(err)
			})
	}
})