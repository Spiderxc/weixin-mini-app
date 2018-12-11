import api from './utils/api';
import tim from './utils/tim';
import Config from './utils/Config';
import {wxLogin, wxUserInfo, showModal, wxStorage} from './utils/common';

let app = null;
if(Config.app!=='test'){
  // console.log = function () {};

}

class MyApp {
  isLoggingIn = false;

  data = {};

  /****** life cycle callbacks. ******/
  onLaunch(options) {
    app = this;
    this.data.launchOptions = options;
  }

  doLogin = () => {
    this.getUserInfo(false, true).then(({uid}) => {
      api.updateUid(uid);
      this.afterAuth();
    }).catch(({status, msg}) => {
      if (status === 2 && /(auth|deny)/g.test(msg.toLowerCase())) {
        if (/unauthorized/g.test(msg.toLowerCase())) {
          setTimeout(() => wx.navigateTo({url: '/pages/auth/auth?stage=AuthorizeUserInfo'}), 500);
          return;
        }
        return showModal('提示', '必须授权登录之后才能继续操作，是否重新授权登录？', [
          {text: '前往设置'},
          {text: '取消'},
        ]).then(({confirm}) => {
          if (confirm) {
            wx.openSetting({
              success: ({authSetting}) => {
                if (authSetting['scope.userInfo']) this.doLogin();
              },
            });
          }
        });
      }
      if (status === 1000) {
        return showModal('提示', '名字不合法，将为您随机生成一个用户名。');
      }
      showModal('登录失败', msg);
    });
  };

  onShow = (options) => {
    // console.log(options, 'app onshow');
    const {scene, query} = options;
    if (scene === 1036) {
      api.updateShareToken(query.share_id);
      app.shareFrom = query;
      wxStorage.save('canBackApp', true);
    } else if (scene !== 1089 && scene !== 1090) {
      api.updateShareToken(null);
      app.shareFrom = null;
      wxStorage.save('canBackApp', false);
    }

    this.doLogin();
  };

  onError(...error) {
    // console.warn('小程序出错了', ...error);
  }

  afterAuth = () => {
    const timUid = 'wx_' + app.user.uid;
    api.getOssToken(app.user.uid).then(({meta, data}) => {
      if (meta.state === 'success') {
        Config.setOssEndpoint(`https://${data.buketName}.${data.endpoint}`)
      }
    });
    api.getTimIdentifier(timUid).then(({meta, data}) => {
      if (meta.state !== 'success') {
        console.log('tim user can not sign', meta);
        return;
      }
      return tim.init({
        appId: Config.timAppId,
        uid: timUid,
        sig: data.sign_result,
      });
    }).catch(console.log);
  };
  getUserInfo = (refresh = false , callInApp = false) => {
    if (app.user && !refresh) return Promise.resolve(app.user);
    if (this.isLoggingIn && !callInApp) {
      return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
          if (this.isLoggingIn) return;
          clearInterval(timer);
          if (app.user) resolve(app.user);
          else reject({status: 1, msg: '获取用户信息失败。'});
        }, 50);
      });
    }
    this.isLoggingIn = true;
    return wxLogin().then(code => {
      return wxUserInfo().then(({user, auth}) => {
        return api.login(code, user.nickName, user.avatarUrl, auth).then(({meta, data}) => {
          if (meta.code === '999') {
            return Promise.reject({status: 1000, msg: meta.message});
          }

          if (meta.state !== 'success') {
            return Promise.reject({status: 1002, msg: meta.message});
          }
          app.inReview = Config.version === data.version;
          user.avatarUrl = data.avatar_url;
          user.uid = data.uid;
          user.nickName = data.uname;
          // this.data.need_phone = 1;
          //TODO 获取手机号失败
          if (data.need_phone === 1) {
            this.data.uid = data.uid;
            this.data.open_id = data.open_id;
            this.data.need_phone = 1;
          }
          return user;
        });
      });
    }).then(user => {
      return api.getUserVipInfo(user.uid).then(({meta, data}) => {
        return meta.state === 'success' ? {...user, vip: data} : user;
      });
    }).then(user => {
      this.isLoggingIn = false;
      app.user = user;
      return user;
    }).catch(error => {
      this.isLoggingIn = callInApp;
      return Promise.reject(error);
    });
  };
}

App(new MyApp());
