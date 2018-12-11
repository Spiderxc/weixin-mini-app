import md5 from './md5';

/**
 * wx.request 为发起网络请求的方法，参数为Object，字段如下：
 *   url
 *   data             Object/String/ArrayBuffer
 *   header
 *   method           Default: GET
 *   dataType         Default: json
 *   responseType     response data type. Default: text  (Support: text/arraybuffer, 1.7.0+)
 *   success
 *   fail
 *   complete
 */
import Config from './Config';

const request = (path, options) => {
  return new Promise((resolve, reject) => {
    const callback = (resp) => {
      if (resp.errMsg !== 'request:ok') {
        reject({status: -2, msg: resp.errMsg});
        return;
      }
      if (resp.statusCode !== 200) {
        reject({status: -1, code: resp.statusCode, msg: 'Bad Request.'});
        return;
      }
      resolve(resp.data);
    };

    wx.request({
      url: path,
      data: options,
      method: 'POST',
      success: callback,
      fail: callback,
    });
  });
};

const requestWXPayment = (options) => {
  return new Promise((resolve, reject) => {
    const callback = (resp) => {
      resolve(resp);
    };
    wx.requestPayment({...options, success: callback, fail: callback});
  });
};

export class Agent {

  static APP_KEY = Config.APP_KEY;
  static SECRET_KEY = Config.SECRET_KEY;

  constructor(baseURL) {
    this.baseURL = baseURL;
    this.commonParams = {
      app_id: Config.wxAppId,
      version: Config.version,
    };
  }

  signing = (options) => {
    const pairs = [];
    const params = {};
    Object.keys(options ? options : {}).forEach((key) => {
      if (options[key] !== undefined) {
        params[key] = options[key];
        pairs.push(key, options[key]);
      }
    });

    const timestamp = Math.floor(new Date().getTime() / 1000) + '';
    pairs.push('timestamp', timestamp, 'appkey', Agent.APP_KEY, Agent.SECRET_KEY);
    const str = encodeURIComponent(pairs.join('').toLowerCase()).toLowerCase().split('').sort().join('');
    params['token'] = md5(str);
    params['appkey'] = Agent.APP_KEY;
    params['timestamp'] = timestamp;
    return params;
  };

  _commonParam(param) {
    this.commonParams = {
      ...this.commonParams,
      ...param,
    };
  }

  post = (path, options) => {
    return request(this.baseURL + path, this.signing({...this.commonParams, ...options}));
  };
  postWX = (options) => {
    return requestWXPayment(options);
  };
}

class API {
  constructor(baseURL = '') {
    this.agent = new Agent(baseURL);
  }

  updateShareToken(shareId) {
    shareId && this.agent._commonParam({share_id: shareId});
  }

  updateScene(scene) {
    scene && this.agent._commonParam({scene});
  }

  updatePresentId(presentId){
    presentId && this.agent._commonParam({present_id: presentId});
  }

  updateUid(uid) {
    uid && this.agent._commonParam({uid});
  }

  exchangeShareParams(scene) {
    return this.agent.post('/exchange_params.do', {
      scene,
      app_id: Config.wxAppId,
    });
  }

  /***************** 接口封装后的使用例子 ****************/
  getHomeCourseCarousel() {
    return this.agent.post('/xxxxxx.do', {});
  }

  keyword_search_article({keyword, page_number}) {
    return this.agent.post('/xxxxxx.do', {keyword, page_number}).then(data => {
      return {
        ...data,
        data: data.data.article_list.map(item => ({
          id: item.article_id,
          subject: item.subject.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          source: item.source.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          abstract: item.content.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          hits: item.view_count,
          image: item.covers,
          comment_count: item.comment_count,
        })),
      };
    });
  }
}


const HOST = '';
export default new API(HOST || Config.host);
