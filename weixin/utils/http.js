
const {
  API_URL
} = require('../config/api.js')

// header 格式
const header = new Map([
  ['JSON', [{ 'content-type': 'application/json', 'token':'' }]],
  ['FORM', [{ 'content-type': 'application/x-www-form-urlencoded', 'token':''}]]
])

//GET请求  
function GET(options) {
  let head = header.get('JSON');
  request('GET', options, head[0])
}
//POST请求  
function POST(options) {
  let head = header.get('FORM')
  request('POST', options, head[0])
}
//POST请求  
function JSONPOST(options) {
  let head = header.get('JSON')
  request('POST', options, head[0], 'JSON')
}

//DELETE请求
function DELETE(options) {
  let head = header.get('JSON')
  request('DELETE', options, head[0])
}

//PUT请求
function PUT(options) {
  let head = header.get('FORM')
  request('PUT', options, head[0])
}

//JSONPUT 请求
function JSONPUT(options) {
  let head = header.get('JSON')
  request('PUT', options, head[0], 'JSON')
}

function request(method, options, header, type) {
  // 请求参数
  var url = API_URL + options.url
  var data
  data = options.params
  // 为所有请求设置token
  header.token = wx.getStorageSync('token') || ''
  wx.request({
    url: url,
    data: data,
    header: header,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
    success: function (res) {
      // 返回res.data方便取值
      if (res.data && typeof options.success === 'function') options.success(res.data)
    },
    fail: function (err) {
      if (typeof options.fail === 'function') options.fail(err)
    },
    complete: function (res) {
      // 登录失效跳转至登录页
      if (res.statusCode === 401) {
        // 这里写清除登录信息的代码
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }
      if (typeof options.complete === 'function') options.complete(res)
    }
  })
}

module.exports = {
  API_URL: API_URL,
  GET: GET,
  POST: POST,
  DELETE: DELETE,
  PUT: PUT,
  JSONPOST: JSONPOST,
  JSONPUT: JSONPUT,
  get: GET,
  post: POST,
  delete: DELETE,
  put: PUT,
  jsonpost: JSONPOST,
  jsonput: JSONPUT
}  