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
function isNullObject(obj){
	for(var key in obj) {
		return false;
	}
	return true;
}
function getDataByProperties(obj,map){
  var properties = {},key,type;
  for(key in obj){
    type = obj[key].type
    properties[key] = (type=="string" && obj[key].format=="date-time") ? map["date"] : map[type]
  }
  return properties
}
function objToString(obj){
  var str = '',key,val,br=' \n ';
  obj = (typeof obj == 'object' && typeof obj.length == 'undefined') ? deepcopy(obj) : {};
  str = JSON.stringify(obj);
  str.replace(',',', \n ')
  console.log("str: ",str);
  return str
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
var basicDataMap = {
  "string": "string",
  "integer": 0,
  "array": [],
  "boolean": true,
  "date": (new Date()).toISOString()
}
new Vue({
	el: "#app",
	// i18n: i18n,
	data: {
		ui: {},
		resources: [],
		security: {},
		label: {
			setting: '配置',
			operation: '其他操作',
			clearSetting: '清除配置',
			modifySetting: '修改配置',
      rememberSetting: '记住配置',
      add: '添加',
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
			right: '右侧',
      reset: '重置',
      defaultParameterType: "默认参数类型"
		},
		myScroll: null,
		tagsMap: {},
		currentPageName: '',
		currentPageData: {
			// mainData: {}, // 已选中菜单的所有数据
			// headerTable: [],  //头部部分 表格
      // parametersTable: [], // 参数部分 表格
      // debugHeaders: [], //头部数据
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
    definitions: {}, // Parameter Type是body时，Data Type取 schema.$ref ,值为 "#/definitions/Post",找definitions.Post
		paths: {}, // 经过处理的返回的所有的数据
		settingForm: {
			language: 'zh-CN',
			defaultAuth: '',
      noAuth: [],
      requestParameterType: 'application/json;charset=UTF-8',
			remember: true,
    },
    // 用户自定义的头部
    selfHeaders: {},
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
    requestSetting: {
      requestParameterType: 'application/json;charset=UTF-8',
    },
    parametersType: [
      {
        value: 'application/json;charset=UTF-8',
        label: 'application/json;charset=UTF-8'
      },
      {
        value: 'application/x-www-form-urlencoded;charset=UTF-8',
        label: 'application/x-www-form-urlencoded;charset=UTF-8'
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
				// width: 300,
				render: function(create,params){
					var txt = '';
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
				render: function(create,params) {
					var txt = '',ref='',key,obj={},_obj={};
					if (params.row.type){
						txt = params.row.type
					}else if(params.row.schema && params.row.schema.type){
						txt = params.row.schema.type
					}else if(params.row.schema && params.row.schema.$ref){
            ref = params.row.schema.$ref
            key = ref.split("/")[2]
            obj = key ? definitions[key] : {};
            if(obj.type=="object" && !isNullObject(obj.properties)){
              _obj = getDataByProperties(obj.properties,basicDataMap)
            }
          }
          if(txt){
            if(txt == 'integer' && params.row.format == 'int64'){
              txt = 'long'
            }
            return create('span',txt)
          }
					if(ref){
            // return create('span',objToString(_obj))
            return create('span',JSON.s(_obj))
          }
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
					var txt = "",_str="";
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
            if(params.row.schema && params.row.schema.$ref){
              var ref = params.row.schema.$ref;
              var key = ref.split("/")[2];
              var obj = key ? definitions[key] : {};
              if(obj.type=="object" && !isNullObject(obj.properties)){
                _obj = getDataByProperties(obj.properties,basicDataMap)
                _str = JSON.stringify(_obj);
              }
            }
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
                    value: _str,
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
				// width: 300,
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
				render: function(create,params) {
					var txt = '',ref='',key,obj={},_obj={};
					if (params.row.type){
						txt = params.row.type
					}else if(params.row.schema && params.row.schema.type){
						txt = params.row.schema.type
					}else if(params.row.schema && params.row.schema.$ref){
            ref = params.row.schema.$ref
            key = ref.split("/")[2]
            obj = key ? definitions[key] : {};
            if(obj.type=="object" && !isNullObject(obj.properties)){
              _obj = getDataByProperties(obj.properties,basicDataMap)
            }
          }
          if(txt){
            if(txt == 'integer' && params.row.format == 'int64'){
              txt = 'long'
            }
            return create('span',txt)
          }
					if(ref){
            // return create('span',objToString(_obj))
            return create('span',JSON.stringify(_obj))
          }
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
			// 更新展示数据  要在更新name之前调用，不然函数中无法获取当前的name
      vm.updateCurrentPageData(name);
      vm.$nextTick(function(){
        // 更新表格的输入
        vm.updateTableInput();
      })
			// 更新基础效果
			vm.upadteCurrentPageName(name);
			vm.updateOpenedPages(name);
			// 初始化/更新插件
			vm.initClipboard();
			// vm.clickTabs('debug');
			vm.initIScroll();
			vm.onOff = true;
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
        if(data[i].children){
          for(j=0;j<data[i].children.length;j++){
            _name = data[i].children[j].label + '.' + data[i].children[j].method
            if(name==_name){
              parentName = data[i].tags
              break
            }
          }
        }
			}
			return parentName
		},
		updateOpenedPages: function(name){
			var vm=this,has=false;
			var openedPages=deepcopy(vm.openedPages);
			var len = openedPages.length;
			for(i=0;i<len;i++){
				if(name==openedPages[i]){
					has=true
				}
			}
			if(!has){
				openedPages.push(name)
			}
			vm.openedPages = openedPages
		},
		getCurrentPageFixedData: function(name){
			var currentPageData = {},vm=this;
			currentPageData.mainData = vm.updateMainData(name);
			currentPageData.headerTable = vm.getHeaderTable(currentPageData.mainData.parameters);
			currentPageData.parametersTable = vm.getParametersTable(currentPageData.mainData.parameters);
      currentPageData.debugTable = vm.getDebugTable(currentPageData.mainData.parameters)
      currentPageData.debugHeaders = vm.getDebugHeaders(currentPageData.mainData.parameters,vm.needToken(currentPageData.mainData))
			currentPageData.tableData = [{
				path: currentPageData.mainData.path,
				summary: currentPageData.mainData.summary,
				description: currentPageData.mainData.description,
				consumes: currentPageData.mainData.consumes,
				produces: currentPageData.mainData.produces,
			}]
			currentPageData.responseData = vm.getResponseData(currentPageData.mainData.responses)
			return currentPageData
		},
		updateCurrentPageData: function(name){
			// name： 将要前往的name
			var vm = this,key,has=false;
			var openedPagesData = deepcopy(vm.openedPagesData);
			for(key in openedPagesData){
				if(key==name){
					has=true
				}
			}
			// name经测试没问题，显示有问题应该是 vm.currentPageData 获取有问题
			// var currentPageData = deepcopy(vm.currentPageData);
			if(has){
        // 获取改变之前的name   很关键！！！
        var currentPageName = vm.currentPageName;  //  
				var currentPageData = vm.getCurrentPageFixedData(currentPageName);
				var debugTable = currentPageData.debugTable;
				// 已经打开过了，回显的逻辑:1.将当前 currentPageData 存入 openedPagesData   2.从openedPagesData 获取值并回显
        // 保存当前页数据
        var tableForm = {}; // 未切换时表格中的数据，因为此函数触发时，组件可能已经销毁，所以不能使用jQuery取值
				currentPageData.tableForm = tableForm;
				currentPageData.tableJson = '' + vm.textareaJsonStr;
				currentPageData.response = deepcopy(vm.currentPageData.response);
				// 更新当前数据到 vm.openedPagesData
				vm.openedPagesData[currentPageName] = currentPageData;
				
				// 回显将要切换过去的页面
					// 数据切换
				vm.currentPageData = vm.openedPagesData[name];
					// 处理回显
				vm.echoCurrentPageData(vm.currentPageData);
			}else{
				var currentPageData = vm.getCurrentPageFixedData(name);
				var debugTable = currentPageData.debugTable;
				// 没打开过，初始化显示
				vm.resetShowData();
				vm.$nextTick(function(){
					var tableForm = vm.getTableForm(debugTable);
					currentPageData.tableForm = tableForm;
					currentPageData.tableJson = "";
					currentPageData.response = {};
					vm.currentPageData = currentPageData;
					vm.openedPagesData[name] = currentPageData;	
				})
			}
		},
		echoCurrentPageData: function(data){
			var vm =this,key;
			vm.textareaJsonStr = data.tableJson;
			var response = data.response;
      vm.showResponse = response.body ? true : false;
      try{
        $("#json-response").html(vm.getShowJsonResponse(response.body));
      }catch(e){
        console.log(e)
      }
    },
    updateTableInput: function(val){
      var vm = this,key;
      var tableForm = vm.currentPageData.tableForm;
      if(val==vm.label.debug && tableForm){
        // 更新table展示的值
        for(key in tableForm){
          // todo：有上传文件的数据优化回显
          $("#" + key + " input").val(tableForm[key])
        }
      }
    },
		getTableForm: function(data){
			// 入参data是调试表格的数据
			var tableForm = {},len=data.length;
			if(len){
				for(var i=0;i<len;i++){
					var key = data[i].name
					if(data[i].in == 'body'){
						tableForm[key] = '';
					}else if(data[i].in == 'formData'){
						// 上传文件
						tableForm[key] = null;
					}else{
						tableForm[key] = '';
					}
				}
			}
			return tableForm
		},
		getHeaderTable: function(data){
			var headerTable = [],i;
			for(i=0;i<data.length;i++){
				if(data[i].in=="header"){
					headerTable.push(data[i])
				}
			}
			return headerTable
		},
		getParametersTable: function(data){
			var parametersTable = [],i;
			for(i=0;i<data.length;i++){
				if(data[i].in=="header"){
					continue
				}
				parametersTable.push(data[i])
			}
			return parametersTable
    },
    getDebugHeaders: function(data,needToken){
      var debugHeaders = [];
      for (var i = data.length - 1; i >= 0; i--) {
        if(data[i].in!="header"){
          continue
        }
        if(needToken)debugHeaders.push(data[i])
      }
      return debugHeaders
    },
		getDebugTable: function(data){
      var debugTable = [];
      for (var i = data.length - 1; i >= 0; i--) {
        if(data[i].in=="header"){
          continue
        }
        debugTable.push(data[i])
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
			var vm = this,key;
			var response = deepcopy(vm.currentPageData.response);
      var debugTable = vm.currentPageData.debugTable || [];
      var debugHeaders = vm.currentPageData.debugHeaders || [];
			var len = debugTable.length,len2 = debugHeaders.length;
			$("#json-response").empty();
			vm.textareaJsonStr = "";
			for(key in response){
				response[key] = ""
			}
			if(len){
				for(var i=0;i<len;i++){
					var _key = debugTable[i].name
					if(debugTable[i].in == 'body'){
						$('#' + _key + ' textarea').val('');
					}else if(debugTable[i].in == 'formData'){
						// 上传文件
						vm.file = null;
					}else{
						$('#' + _key + ' input').val("");
					}
				}
      }
      if(len2){
        for(var j=0;j<len2;j++){
          var key2 = debugHeaders[j].name;
          $('#' + key2 + ' input').val("");
        }
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
			var vm = this,ajaxData = {},ajaxParams={};
			var data = vm.currentPageData.mainData,parameters = vm.currentPageData.mainData.parameters;
			if(vm.tableTextarea){
				// 输入框输入
				if(parameters){
					for(var i=0;i<parameters.length;i++){
						var _key = parameters[i].name
						if(parameters[i].in == 'path' || parameters[i].in == 'header'){
							continue
						}
						if(parameters[i].in == 'body'){
              try{
                ajaxData = JSON.parse($('#' + _key + ' textarea').val());
              }catch(e){
                vm.$Message.error(e.message)
                return false
              }
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
							ajaxParams[_key] = _val	
						}
					}
				}
			}else{
				// 文本域输入
				if(!vm.isDisabled){
          var str = "" + vm.textareaJsonStr
          console.log('str: ',str)
          debugger
					try{
	        	ajaxData = JSON.parse(str);
	       	}catch(e){
	        	vm.$Message.error(e.message)
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
      // 设置参数方法一
      params["data"] = isNullObject(ajaxData) ? {} : ajaxData;
      params["params"] = isNullObject(ajaxParams) ? {} : ajaxParams;
      // 设置参数方法二
			// if(method == "put" || method == "post" || method == "patch"){
			// 	params["data"] = ajaxData;
			// }else if(method == "get" || method == "delete"){
			// 	params["params"] = ajaxParams;
			// }else{
			// 	// head OPTIONS  TRACE请求不做处理
			// 	// vm.$Message.error("请求方式不属于get、post、put、patch、delete中的任何一种");
			// 	// return
			// }
			return params
		},
		submitDebug: function(){
			var vm = this;
			if(!vm.getParams()){
				return
			}
			vm.spinShow = true;
			var params = vm.getParams();
			// 设置contentType
			var contentType = vm.requestSetting.requestParameterType || 'application/json;charset=UTF-8';
			axios.defaults.headers.common['Content-Type'] = contentType;
			// 设置token
      vm.setToken();
      console.log("params: ",params)
      debugger
			axios(params).then(function(res){
				var rd = res.data;
				vm.updateResponse(res,params);
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
      vm.currentPageData.response.body = res.data;
      var htmlStr = vm.getShowJsonResponse(res.data);
			$("#json-response").html(htmlStr);
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
      var urlParams = deepcopy(params.params);
			var requestUrl = '' + params.url;
			if(!isNullObject(data) || !isNullObject(params)){
				var j = 0,ai;
				for(var i=0;i<data.length;i++){
					ai = data[i];
					if(ai.in == 'query' && urlParams[ai.name]){
						requestUrl += j ? ('&' + ai.name + '=' + urlParams[ai.name]) : ('?' + ai.name + '=' + urlParams[ai.name])
						j++	
					}
				}	
			}
			return requestUrl
		},
		getShowJsonResponse: function(data){
			var content = JSON.stringify(data);
			var result = '';
			try{
				result = new JSONFormat(content,2).toString();
			}catch(e){
        result = '<span style="color: #f1592a;font-weight:bold;">' + e + '</span>';
      }
      return result
    },
    // 添加自定义头部
    addHeaders: function(){
      console.log('添加自定义头部')
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
        window["definitions"] = resData.definitions;
				vm.paths = resData.paths;
				vm.searchData = vm.initSearchData(vm.paths);
				vm.tagsMap = vm.initTagsMap(vm.searchData);
				vm.noAuth = vm.initNoAuth(vm.searchData);
				vm.sidebarData = vm.initSidebarData(resData.paths);
				vm.originalSidebarData = deepcopy(vm.sidebarData);
				window.document.title = vm.info.title
			})
			var arr = [
				axios.get('swagger-resources/configuration/ui'),
				axios.get('swagger-resources'),
				axios.get('swagger-resources/configuration/security')]
			axios.all(arr)
				.then(axios.spread(function (ui, resources, security) {
			    vm.ui = ui.data;
			    vm.resources = resources.data;
			    vm.security = security.data;
			  }))
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