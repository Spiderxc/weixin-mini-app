export const UNAVAILABLE = 'Unavailable';

export const dummaryImage = (w = 600, h = 400, txt, bc = 'ff66a5', fc = 'fff', f = 'jpg') => `https://dummyimage.com/${w}x${h}/${bc}/${fc}.${f}${txt ? `&text=${txt}` : ''}`;

export const getUntilAvailable = (func, checkInterval = 200, trynum = 10) => (...params) => {
  return new Promise((resolve, reject) => {
    let counter = trynum > 0 ? trynum : 10;
    const timer = setInterval(() => {
      const rv = func(...params);
      if (rv !== UNAVAILABLE) {
          resolve(rv);
          clearInterval(timer);
      }
      if (!--counter) {
        reject('Timeout.');
        clearInterval(timer);
      }
    }, checkInterval);
  });
}

/**
 * @param version 目标版本号。如： '1.4.0'
 */
export const getRemainTime = function (time, end) {
    const beginTime = new Date(time *  1000);
    const endTime = new Date(end * 1000);
    const currentTime = new Date();
    return currentTime < beginTime ? 0 : (currentTime < endTime ? 1 : 2)
};
export const checkVersion = getUntilAvailable((version) => {
  const app = getApp();
  console.log(app.sysInfo);
  if (!app.sysInfo) return UNAVAILABLE;
  const v1 = app.sysInfo.SDKVersion.split('.');
  const v2 = version.split('.');
  const len = Math.max(v1.length, v2.length);
  while (v1.length < len) v1.push('0');
  while (v2.length < len) v2.push('0');
  return (v1[0] - v2[0]) || (v1[1] - v2[1]) || (v1[2] - v2[2]);
});


export const getSysInfo = (refresh = false) => {
  const app = getApp();
  return new Promise((resolve, reject) => {
    if (app.sysInfo && !refresh) return resolve(app.sysInfo);
    const success = ({errMsg, ...sysInfo}) => {
      if (errMsg !== 'getSystemInfo:ok') {
        app.sysInfo = null;
        return reject({code: 1, msg: errMsg});
      }
      app.sysInfo = sysInfo;
      resolve(sysInfo);
    };
    const fail = (err) => {
      reject({code: 2, msg: '接口调用失败！'});
    };
    wx.getSystemInfo({success, fail});
  });
};

export const showModal = (title, content, [confirm, cancel] = []) => {
  return new Promise((resolve, reject) => {
    const params = {title, content, showCancel: !!cancel};
    if (confirm) {
      confirm.text && (params.confirmText = confirm.text);
      confirm.color && (params.confirmColor = confirm.color);
    }
    if (cancel) {
      cancel.text && (params.cancelText = cancel.text);
      cancel.color && (params.cancelColor = cancel.color);
    }
    params.success = resp => resolve(resp);
    params.fail = ({errMsg}) => reject(errMsg);
    wx.showModal(params)
  })
};

export const wxLogin = () => new Promise((resolve, reject) => {
  const success = ({code}) => resolve(code);
  const fail = ({errMsg}) => reject({status: 1, msg: errMsg});
  wx.login({success, fail});
});

export const wxUserInfo = () => new Promise((resolve, reject) => {
  const success = ({errMsg, userInfo, signature, encryptedData, iv}) => resolve({
    user: userInfo,
    auth: {signature, encryptedData, iv},
  });
  const fail = ({errMsg}) => reject({status: 2, msg: errMsg});
  wx.getUserInfo({withCredentials: true, success, fail});
});

export const wxStorage = {
  save: (key, data, domain = 'default') => {
    return new Promise(resolve => {
      const success = () => resolve(true);
      const fail = ({errMsg}) => {
        console.warn(errMsg, `Key: ${key}.${domain}, Data: `, data);
        resolve(false);
      };
      wx.setStorage({key: `${domain}.${key}`, data, success, fail});
    })
  },
  get: (key, domain = 'default') => {
    return new Promise(resolve => {
      const success = (resp) => resolve(resp.data);
      const fail = ({errMsg}) => {
        console.warn(errMsg, `Key: ${key}.${domain}`);
        resolve('');
      };
      wx.getStorage({key: `${domain}.${key}`, success, fail});
    })
  },
  remove: (key, domain = 'default') => {
    return new Promise(resolve => {
      const success = () => resolve(true);
      const fail = ({errMsg}) => {
        console.log(errMsg);
        resolve(false);
      };
      wx.removeStorage({key: `${domain}.${key}`, success, fail});
    })
  },
  clear: () => {
    return new Promise(resolve => {
      try {
        wx.clearStorageSync();
        resolve(true);
      } catch (err) {
        console.warn(err);
        resolve(false);
      }
    });
  },
  desc: () => {
    return new Promise(resolve => {
      const success = ({errMsg, ...info}) => resolve(info);
      const fail = ({errMsg}) => {
        console.warn(errMsg);
        resolve({});
      };
      wx.getStorageInfo({success, fail});
    });
  },
};
