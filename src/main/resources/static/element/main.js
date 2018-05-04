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

new Vue({
	el: '#app',
	data: {
		label: {
			setting: '配置',
			besure: '确定',
			debug: '调试',
			none: '无',
			languageChoose: '语言选择',
			upload: '上传',
			copyResponse: '复制返回值',
			copyRequestUrl: '复制请求路径',
			pathIntroduce: '(路径参数，例如：/users/{id})',
			queryIntroduce: '(查询参数，例如：/users?role=admin)',
			selectFile: '选取文件',
			required: 'required'
		},
		info: {},
		paths: {},
		basePath: '',
		sidebarData: [],
		mainData: {},
		activeName: 'description',
		showMain: false,
		tableData: [],
		responseData: [],
		textareaJsonStr: '',
		debugBody: '', // Parameter Type为body时绑定的数据
		debugForm: {},
		fileList: [],
		spinShow: false,
		showResponse: false,
		response: {
			curl: '',
			requestUrl: '',
			requestHeader: '',
			code: '',
			headers: ''
		},
	},
	methods: {
		initClipboard: function(){
			new Clipboard('.copyResponseBody');
			new Clipboard('.copyRequestUrl');
		},
		selectMenu: function(index,indexPath){
			var vm = this;
			vm.debugForm = {};  //先清空提交对象
			vm.mainData = vm.updateMainData(index);
			vm.tableData = [{
				path: vm.mainData.path,
				summary: vm.mainData.summary,
				description: vm.mainData.description,
				consumes: vm.mainData.consumes,
				produces: vm.mainData.produces,
			}]
			vm.responseData = vm.getResponseData(vm.mainData.responses);
			vm.initClipboard();
			vm.resetShowData();
			vm.showMain = true;
		},
		resetShowData: function(){
			var vm = this;
			$("#json-response").empty();
			vm.textareaJsonStr = "";
			for(var key in vm.response){
				vm.response[key] = ""
			}
			vm.showResponse = false;
		},
		handleClick: function(e){
			
		},
		updateMainData: function(path) {
			var mainData = deepcopy(this.paths[path]);
			mainData['path'] = path;
			return mainData
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
		submitDebug: function(){
			var vm = this;
			if(vm.checkInput()){
				vm.spinShow = true;
				var params = vm.getParams();
				var url = vm.getRequestUrl(params,vm.mainData.parameters);
				vm.response.requestUrl = typeof encodeURI == 'function' ? encodeURI(url) : url;
				if(this.$refs.upload)vm.submitUpload();
				// 根据body设置  content-type
				axios.defaults.headers.patch['Content-Type'] = vm.contentType;
				axios.defaults.headers.post['Content-Type'] = vm.contentType;
				axios.defaults.headers.put['Content-Type'] = vm.contentType;
				axios(params).then(function(res){
					var rd = res.data
					vm.response.requestHeader = res.config.headers
					vm.response.code = res.status
					vm.response.headers = res.headers
					var htmlStr = vm.getShowJsonResponse(rd);
					$("#json-response").html(htmlStr);
					vm.spinShow = false;
					vm.showResponse = true;
				})
			}
		},
		checkInput: function(){
			var checkOk = true,vm=this,i,data=this.mainData.parameters;
			if(data&&data.length){
				if(data[0].in!='body'){
					for(i=0;i<data.length;i++){
						if(data[i].in=='formData')continue
						if(data[i].required && !vm.debugForm[data[i].name]){
							vm.$message({
					          message: '参数' + data[i].name + '为必填项',
					          type: 'error'
					        })
					        return false
						}
					}	
				}else{
					try{
						JSON.parse(vm.textareaJsonStr)
					}catch(e){
		                vm.$message({
				          message: e,
				          type: 'error'
				        })
				        return false
		            }
				}
			}
			return checkOk
		},
		getParams: function(){
			var vm = this,params = {},ajaxData={},i;
			var method = vm.mainData.method.toLocaleLowerCase();
			var url = vm.getUrl(vm.basePath + vm.mainData.path,vm.mainData.parameters);
			var params = {
				url: url,
				method: method
			}
			if(vm.showTable){
				if(vm.mainData.parameters&&vm.mainData.parameters.length){
					for(i=0;i<vm.mainData.parameters.length;i++){
						if(vm.mainData.parameters[i].in=='path' || !vm.debugForm[vm.mainData.parameters[i].name]){
							continue
						}
						ajaxData[vm.mainData.parameters[i].name] = vm.debugForm[vm.mainData.parameters[i].name]
					}
				}
			}else{
				ajaxData = JSON.stringify(vm.textareaJsonStr);
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
		getUrl: function(urlStr,data){
			var i,str = '' + urlStr,vm=this;
			if(typeof data != 'undefined'){
				for(i=0;i<data.length;i++){
					var ai = data[i];
					if(ai.in == 'path'){
						var key = ai.name;
						var val = vm.debugForm[key];
						str = str.replace('{' + key + '}',val);
					}
				}	
			}
			return str
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
		handlePreview: function(){},
		handleRemove: function(){},
		submitUpload: function(){
			this.$refs.upload.submit();
		},
		copySuccess: function(){
			this.$message({
	          message: '复制成功！',
	          type: 'success'
	        });
		},
		// 操作返回的原始数据
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
		handleResData: function(data){
			var _data = {}
			for(var key in data) {
				for(var childKey in data[key]){
					_data[key] = {};
					_data[key].method = childKey;
					for(var grandSonKey in data[key][childKey]){
						_data[key][grandSonKey] = data[key][childKey][grandSonKey];
						if(grandSonKey=='tags'){
							_data[key]['tags'] = data[key][childKey]['tags'][0];
						}
					}
				}
			}
			return _data
		},
		initPageData: function(){
			var vm = this;
			axios.get('v2/api-docs')
			.then(function(res){
				var resData = deepcopy(res.data);
				vm.info = resData.info;
				vm.basePath = resData.basePath;
				vm.paths = vm.handleResData(resData.paths);
				vm.sidebarData = vm.initSidebarData(vm.paths);
				window.document.title = vm.info.title;
			})
		}
	},
	computed: {
		showTable: function(){
			return this.mainData.parameters && this.mainData.parameters.length && this.mainData.parameters[0].in=='body' ? false : true
		},
		contentType: function(){
			return this.mainData.parameters && this.mainData.parameters.length && this.mainData.parameters[0].in=='body' ? 'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded'
		},
		parametersType: function(){
			return this.mainData.parameters && this.mainData.parameters.length && this.mainData.parameters[0].in=='body' ? 'json' : 'form'
		},
		uploadAction: function(){
			return this.response.requestUrl
		}
	},
	watch: {},
	created: function(){
		this.initPageData();
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