const ws = require("nodejs-websocket");
const colors = require('colors');

// 当前聊天室的用户
let chatUsers = []
// 临时存储聊天记录
let msgList = []

// 广播通知
const broadcast = (server, info, msg) => {
  // 保存记录
  msgList.push(msg)
  server.connections.forEach(function (conn) {
    conn.sendText(JSON.stringify(info))
  })
}

const server = ws.createServer(connection => {
  connection.on('text', function (result) {
    console.log('发送消息', result)
    const _result = JSON.parse(result)
    //进入房间
    if (_result.state === 'join') {
      if (!chatUsers.includes(_result.name)) {
        chatUsers.push(_result.name)
        const msg = {
          info: `欢迎${_result.name}加入房间！`,
          state: 'system',
          name: _result.name
        }
        // 广播消息
        broadcast(server, msg, msg)
      } else {
        // 返回所有的聊天记录
        msgList.forEach(function (list) {
          connection.sendText(JSON.stringify(list))
        })
      }
    }
    // 广播消息
    if (_result.state === 'notice') {
      // 广播消息
      broadcast(server, _result, _result)
    }
    // 离开房间
    if (_result.state === 'leave') {
      chatUsers = chatUsers.filter(p => p === _result.name)
      const msg = {
        info: `${_result.name}离开房间！`,
        state: 'system',
        name: _result.name
      }
      // 广播消息
      broadcast(server, msg, msg)
    }
  })

  connection.on('connect', function (code) {
    console.log('开启连接', code)
  })

  connection.on('close', function (code) {
    console.log('关闭连接', code)
  })

  connection.on('error', function (code) {
    try {
      connection.close()
    } catch (error) {
      console.log('close异常', error)
    }
    console.log('异常关闭', code)
  })

})

server.listen(10086, function () {
  console.log(colors.green('服务已启动！'))
})

// 断开所有连接
server.on('close', () => {
  chatUsers = []
})