
const test = {
  // host: 'https://tst1.hbbclub.com/bcast/openapi',
  app:'test',
  host: 'http://39.106.166.13:8040/bcast/openapi',
  wxAppId: 'wxb31424cc75f6d025',
  timAppId: '1400056450',
  version: '2.0.3',
  ossEndpoint: 'https://hbb-dev.oss-cn-beijing.aliyuncs.com',
  APP_KEY:'25256934',
  SECRET_KEY :'IpsMUfxYw9HqhHWyuYHL83HZ7wUJTPFS',
};

//爱亲test

const aq_test = {
  app:'aq_test',
  host: 'http://39.106.166.13:8040/bcast/openapi',
  wxAppId: 'wxdf9453c808cf12d3',
  timAppId: '1400056450',
  version: '2.0.3',
  ossEndpoint: 'https://hbb-dev.oss-cn-beijing.aliyuncs.com',
  APP_KEY:'aiqin_miniapp',
  SECRET_KEY :'b906ebf27c26d582a532dddaf14638e1',
};

//hbbtest

const hbb_test = {
  app:'hbb_test',
  host: 'http://39.106.166.13:8040/bcast/openapi',
  wxAppId: 'wx8e292036c482cc6f',
  timAppId: '1400056450',
  version: '2.0.7',
  ossEndpoint: 'https://hbb-dev.oss-cn-beijing.aliyuncs.com',
  APP_KEY:'hbb_miniapp',
  SECRET_KEY :'4c731752ccb974dec18f84223be14856',
};
//  爱亲爸妈课堂
const release = {
  app:'aq',
  host: 'https://api.hbbclub.com/v4/bcast/openapi',
  wxAppId: 'wxdf9453c808cf12d3',
  timAppId: '1400065980',
  version: '2.0.6',
  ossEndpoint: 'https://hbb-deploy.oss-cn-beijing.aliyuncs.com',
  APP_KEY:'aiqin_miniapp',
  SECRET_KEY :'b906ebf27c26d582a532dddaf14638e1',

};
// 好呗呗
const hbb = {
  app:'hbb',
  host: 'https://api.hbbclub.com/v4/bcast/openapi',
  wxAppId: 'wx8e292036c482cc6f',
  timAppId: '1400065980',
  version: '2.0.10',
  ossEndpoint: 'https://hbb-deploy.oss-cn-beijing.aliyuncs.com',
  APP_KEY:'hbb_miniapp',
  SECRET_KEY :'4c731752ccb974dec18f84223be14856',
};

const Config = {
  ...aq_test,
  setOssEndpoint: function (endpoint) {
    this.ossEndpoint = endpoint;
  },
};

export default Config;

