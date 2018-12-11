const webim = require('./im-sdk/webim');

const SESSION_TYPE = {
  INVALID: 0,
  C2C: 1,
  GROUP: 2,
  SYSTEM: 3,
};
const ACCOUNT_TYPE = 844;
const options = {
  'isAccessFormalEnv': true, //是否访问正式环境，默认访问正式，选填
  'isLogOn': false //是否开启控制台打印日志,默认开启，选填
};

class TimManager {

  currentSession = null;
  listeners = {};
  _callListener = (event, ...data) => {
    this.listeners[event] && this.listeners[event](...data);
  };

  on = (event, callback) => {
    this.listeners[event] = callback;
  };

  init = (config) => {
    return new Promise(resolve => {
      const loginInfo = {
        'sdkAppID': config.appId,      //用户所属应用id,必填
        'appIDAt3rd': config.appId,    //用户所属应用id，必填
        'accountType': ACCOUNT_TYPE,          //用户所属应用帐号类型，必填
        'identifier': config.uid,      //当前用户ID,必须是字符串，选填
        'userSig': config.sig,         //当前用户身份凭证，必须是字符串，选填
        'identifierNick': config.nickname,   //当前用户昵称，选填
      };
      const onSuccess = resp => {
        console.log(resp);
        resolve(true);
      };
      const onFail = error => {
        console.log(error);
        resolve(false);
      };
      webim.login(loginInfo, this.timListeners, options, onSuccess, onFail);
    });
  };

  joinRoom = (roomId) => {
    return new Promise((resolve) => {
      const onSuccess = resp => {
        if (!resp.JoinedStatus || resp.JoinedStatus !== 'JoinedSuccess') {
          console.warn('加入房间失败');
          return resolve('error');
        }
        this.currentSession = new webim.Session(webim.SESSION_TYPE.GROUP, roomId, roomId, '', Math.round(new Date().getTime() / 1000));
        resolve('ok');
      };
      const onFail = err => {
        console.warn(err.ErrorInfo);
        resolve('error');
      };
      webim.applyJoinBigGroup({GroupId: roomId}, onSuccess, onFail);
    })
  };

  quitRoom = (roomId) => {
    return new Promise((resolve) => {
      const onSuccess = resp => {
        console.log('退群成功', resp);
        this.currentSession = null;
        resolve('ok');
      };
      const onFail = err => {
        console.warn('退群失败', err);
        resolve('error');
      };
      webim.quitBigGroup({GroupId: roomId}, onSuccess, onFail);
    });
  };

  sendMessage = ({from, body}) => {
    return new Promise(resolve => {
      const random = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
      const timestamp = Math.round(new Date().getTime() / 1000);//消息时间戳
      const msg = new webim.Msg(this.currentSession, true, -1, random, timestamp, from, webim.GROUP_MSG_SUB_TYPE.COMMON, '');
      const elem = new webim.Msg.Elem.Text(JSON.stringify(JSON.stringify(body)));
      msg.addText(elem);
      const onSuccess = (resp) => {
        if (resp.ActionStatus === 'OK') {
          resolve(true);
        } else {
          console.log(resp);
          resolve(false);
        }
      };
      const onFail = (err) => {
        console.log('消息发送失败！', err);
        resolve(false);
      };
      webim.sendMsg(msg, onSuccess, onFail);
    })
  };

  _getBody = (elem) => {
    const content = elem.getContent();
    switch (elem.getType()) {
      case webim.MSG_ELEMENT_TYPE.TEXT:
        return JSON.parse(JSON.parse(content.getText().replace(/&quot;/g, '"')));
      case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
        return content.getOpType();
    }
  };

  _handleMessage = (msg) => {
    // if (from === '@TIM#SYSTEM') return;
    const session = msg.getSession();
    const elem = msg.getElems()[0];
    const message = {
      body: this._getBody(elem),
      chatType: SESSION_TYPE[session.type()],
      from: msg.getFromAccount(),
      id: 1822,
      seq: msg.getSeq(),
      timestamp: msg.getTime(), // 1519877580,
      to: session.id(),
    };
    this._callListener('message', message);
  };

  // SDK 监听器。
  onConnNotify = resp => {
    switch (resp.ErrorCode) {
      case webim.CONNECTION_STATUS.ON:
        console.log('连接状态正常...');
        this._callListener('connect');
        break;
      case webim.CONNECTION_STATUS.OFF:
        console.log('连接已断开，无法收到新消息，请检查下你的网络是否正常');
        this._callListener('disconnect');
        break;
      default:
        console.log('未知连接状态, status=', resp);
        break;
    }
  };
  onMsgNotify = (msgList) => {
    console.log('new Message receive: ', msgList);
  };
  onBigGroupMsgNotify = (msgList) => {
    for (var i = msgList.length - 1; i >= 0; i--) {//遍历消息，按照时间从后往前
      const msg = msgList[i];
      this._handleMessage(msg);
    }
  };
  onDestroyGroupNotify = console.log;
  onRevokeGroupNotify = console.log;
  onCustomGroupNotify = console.log;
  timListeners = {
    onMsgNotify: this.onMsgNotify,
    onBigGroupMsgNotify: this.onBigGroupMsgNotify,
    onGroupSystemNotifys: {
      "5": this.onDestroyGroupNotify, //群被解散(全员接收)
      "11": this.onRevokeGroupNotify, //群已被回收(全员接收)
      "255": this.onCustomGroupNotify//用户自定义通知(默认全员接收)
    },
  };
}

const manager = new TimManager();
export default {
  init: (config)  => manager.init(config),
  joinRoom: (roomId) => manager.joinRoom(roomId),
  quitRoom: (roomId) => manager.quitRoom(roomId),
  sendMessage: (message) => manager.sendMessage(message),
  on: (event, callback) => manager.on(event, callback),
};