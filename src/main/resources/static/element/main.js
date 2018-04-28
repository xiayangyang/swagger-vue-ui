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
		info: {},
		paths: {},
		basePath: '',
		sidebarData: [],
	},
	methods: {
		selectMenu: function(index,indexPath){
			console.log('index: ',index);
			console.log('indexPath: ',indexPath);
		},
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
					_data[key] = {}
					_data[key].method = childKey
					for(var grandSonKey in data[key][childKey]){
						_data[key][grandSonKey] = data[key][childKey][grandSonKey]
					}
				}
			}
			return _data
		},
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
		initPageData: function(){
			var vm = this;
			axios.get('v2/api-docs')
			.then(function(res){
				console.log('res: ',res);
				var resData = deepcopy(res.data)
				vm.info = resData.info
				vm.basePath = resData.basePath
				vm.paths = vm.handleResData(resData.paths);
				vm.sidebarData = vm.initSidebarData(vm.handleResData2(resData.paths));
				window.document.title = vm.info.title
			})
		}
	},
	computed: {},
	created: function(){
		this.initPageData();
	},
	mounted: function(){}
})