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

  /*****************课程相关****************/
  // 首页课程轮播图列表
  getHomeCourseCarousel() {
    return this.agent.post('/service_homepage_carousel.do', {});
  }

  // 首页课程类型列表
  getHomeCourseTags() {
    return this.agent.post('/course_tags.do', {});
  }

  // 系列课程
  getSeriesCourseInfo(room_id, uid, present_id, experiential_id) {
    return this.agent.post('/series_course_info.do', {room_id, uid, present_id, experiential_id});
  }

  // 专题课详情
  getCourseInfo(room_id, uid, present_id, experiential_id) {
    return this.agent.post('/course_info.do', {room_id, uid, present_id, experiential_id});
  }

  // 课程分享图片
  getCourseSharePictures(room_id, uid) {
    return this.agent.post('/course_share_pictures.do', {room_id, uid});
  }

  // 课程列表
  getCourseList({tag_id, page_number, page_size}) {
    return this.agent.post('/course_list.do', {
      tag_id: tag_id,
      page_number,
      page_size,
    });
  }

  // 课程列表
  getCourseListByExpertId(expert_id) {
    return this.agent.post('/course_list.do', {expert_id});
  }


  // 课程分享
  getCourseShareInfo(roomId, uid) {
    return this.agent.post('/mp_course_share_info.do', {
      room_id: roomId,
      uid,
    });
  }

  //我的体验课分享
  experiential_share_info({uid, eeid}) {
    return this.agent.post('/experiential_share_info.do', {uid, eeid});
  }


  shareCourseResult(share_id, success) {
    return this.agent.post(success ? '/mp_share_success.do' : '/mp_share_fail.do', {
      share_id,
    });
  }


  // 赠课信息
  getPresentCourseInfo(uid, present_id) {
    return this.agent.post('/find_present_info.do', {uid, present_id});
  }

  // 最近学习
  getRecentCourse(uid, page_number = 1) {
    return this.agent.post('/my_studies.do', {uid, page_number});
  }

  //删除最近学习课程
  delete_my_studies({uid, room_id, topic_id}) {
    return this.agent.post('/delete_my_studies.do', {uid, room_id, topic_id});
  }

  // 加入课程
  joinCourse(roomId, uid) {
    return this.agent.post('/join_course.do', {'room_id': roomId, 'uid': uid});
  }

  // 进入课程
  enterCourse(topicId, roomId, uid, experiential_id) {
    return this.agent.post('/enter_course.do', {
      'uid': uid,
      'room_id': roomId,
      'topic_id': topicId,
      'experiential_id': experiential_id,
    });
  }

  //退出课程
  quitCourse(heartbeat_id) {
    return this.agent.post('/study_heartbeat.do', {heartbeat_id});
  }

  // 购买记录（我的课程）
  // myCourse(uid, page_number = 1) {
  //   return this.agent.post('/my_courses.do', {'uid': uid, 'page_number': page_number});
  // }

  //我的-购买记录-购买
  getPurchaseHistory({uid, page_number, page_size}) {
    return this.agent.post('/my_room_order.do', {uid, page_number, page_size});
  }

  //我的-购买记录-赠课
  getGiveCourseHistory({uid, page_number, page_size}) {
    return this.agent.post('/my_present_room_order.do', {uid, page_number, page_size});
  }

  //我的-购买记录-vip
  getVipHistory({uid, page_number}) {
    return this.agent.post('/my_vip_member_card_order.do', {uid, page_number});
  }

  //vip课程
  getVipCourseList(page_number = 1, page_size) {
    return this.agent.post('/vip_course_list.do', {page_number, page_size});
  }

  getCourseMedia(room_id, topic_id) {
    return this.agent.post('/topic_media.do', {room_id, topic_id});
  }

// 课程评论列表
  getCourseCommentList(uid, topic_id, page_number, to_comment_id) {
    return this.agent.post('/course_comment_list.do', {uid, topic_id, page_number, to_comment_id});
  }

  //系列课程评论列表
  getSeriesCommentList(uid, room_id, page_number) {
    return this.agent.post('/room_comment_list.do', {uid, room_id, page_number});
  }

// 添加评论
  addCourseComment(topic_id, uid, content, to_comment_id, grade) {
    return this.agent.post('/course_comment.do', {
      topic_id,
      uid,
      content,
      to_comment_id,
      grade,
    });
  }

// 评论详情
  getCourseComment(comment_id, uid) {
    return this.agent.post('/course_comment_info.do', {comment_id, uid});
  }

// 撤销评论
  deleteCourseComment(uid, comment_id) {
    return this.agent.post('/delete_course_comment.do', {uid, comment_id});
  }

// 评论点赞
  diggCourseComment(uid, comment_id) {
    return this.agent.post('/course_comment_digg.do', {uid, comment_id});
  }

// 取消评论点赞
  undiggCourseComment(uid, comment_id) {
    return this.agent.post('/delete_course_comment_digg.do', {uid, comment_id});
  }

  /******************专家**********************/
  // 专家列表
  getExpertList({uid, page_number}) {
    return this.agent.post('/expert_list.do', {
      uid: uid,
      page_number: page_number,
    });
  }

  // 专家详情
  getExpertInfo(expert_id, uid) {
    return this.agent.post('/expert_info.do', {expert_id, uid});
  }

  // 关注的专家
  getMyFollowingExpert(uid, page_number = 1) {
    return this.agent.post('/my_follow_expert.do', {uid, page_number});

  }

  // 关注专家
  getFollowExpert(expert_id, uid) {
    return this.agent.post('/follow_expert.do', {expert_id, uid});
  }

  // 取消关注专家
  getUnFollowExpert(expert_id, uid) {
    return this.agent.post('/unfollow_expert.do', {expert_id, uid});
  }

  //明星专家
  getStarExpert(uid, page_number, page_size) {
    return this.agent.post('/star_expert_list.do', {uid, page_number, page_size});
  }

  /*******************用户、支付******************/

  // 获取小程序使用协议
  getMiniAppUseProtocal(){
    return this.agent.post('/aiqin_member_protocol.do',{})
  }
  // 用户登录
  login(code, nickname, avatar, auth) {
    return this.agent.post('/login_mini_program.do', {
      code,
      nick_name: nickname,
      avatar_url: avatar,
      ...auth,
    });
  }

  registerAiqinMember(open_id, uid, phone = '', captcha = '', encryptedData = '', iv = '', share_id = '', present_id = '', scene = '') {
    return this.agent.post('/register_aiqin_member.do', {
      open_id, uid, phone, captcha, encryptedData, iv, share_id, present_id, scene,
    });
  }

  sendCaptcha(phone) {
    return this.agent.post('/send_captcha.do', {phone})
  }

  // 是否是VIP会员
  getUserVipInfo(uid) {
    return this.agent.post('/is_vip_member.do', {
      uid,
    });
  }

// // 购买记录(课程)
//   getCoursePurchaseHistory(uid,type) {
//     console.log('uid', uid);
//     return this.agent.post('/my_purchase.do', {uid,type})
//   }
  // 会员权益图文
  getMemberCardDesc() {
    return this.agent.post('/vip_member_card_desc.do', {});
  }

  // 会员购买列表
  getVipMemberCardDetails() {
    return this.agent.post('/vip_member_card_details.do', {});
  }

  //会员购买记录
  getVipPurchaseHistory(uid) {
    return this.agent.post('/vip_member_card_charge_log.do', {uid});
  }

  // 服务条款相关html
  getServiceHtml(code = 'member-service-protocol') {
    return this.agent.post('/html.do', {code});
  }

  // 兑换VIP会员
  exchangeVipMember(uid, code) {
    return this.agent.post('/exchange_vip_member_card.do', {uid, code});
  }

  // 付款详情页面
  getPrePaymentInfo(uid, room_id, present) {
    return this.agent.post('/find_course_pre_pay_info.do', {uid, room_id, present});
  }

  // 小程序课程创建订单
  createPayment(uid, room_id, app_id, present, qty = 1) {
    return this.agent.post('/create_course_wxpay_order_for_mini.do', {
      uid, room_id, app_id, present, qty,
    });
  }


  // 小程序课程订单支付结果查询
  getPaymentResult(order_no, app_id) {
    return this.agent.post('/find_wxpay_order_status_for_mini.do', {
      order_no, app_id,
    });
  }


  // 小程序创建VIP订单
  createVIPOrder(price_id, uid) {
    return this.agent.post('/create_mc_wxpay_order_for_mini.do', {
      price_id, uid,
    });
  }

  // 微信支付
  performPayment(options) {
    return this.agent.postWX(options);
  }

  //创建亲豆或积分支付订单
  createPointPayment(room_id, uid, price_id, present, qty = 1) {
    return this.agent.post('/create_course_point_order.do', {
      room_id, uid, price_id, present, qty,
    });
  }

  /*********************直播*********************/

  getTimIdentifier(uid) {
    return this.agent.post('/gen_tls_sign.do', {uid});
  }

  getChatList(topicId, roomId, sequence, direction = 0) {
    return this.agent.post('/chat_log.do', {
      topic_id: topicId,
      room_id: roomId,
      msg_seq: sequence,
      direction,
    });
  }

  getDiscussList(topicId, roomId, sequence, direction = 0) {
    return this.agent.post('/chat_discuss.do', {
      topic_id: topicId,
      room_id: roomId,
      msg_seq: sequence,
      direction,
    });
  }

  getCoursePpt(topicId) {
    return this.agent.post('/course_ppt.do', {
      topic_id: topicId,
      enabled: 1, // always fetch enabled ones.
    });
  }

  getOssToken(uid) {
    return this.agent.post('/gen_sts.do', {uid});
  }

  //全文检索接口
  keyword_search_lite(keyword, page_number) {
    return this.agent.post('/keyword_search_lite.do', {keyword, page_number});
  }

  //免费畅听课列表接口
  free_course_list({page_size, page_number = 1}) {
    return this.agent.post('/free_course_list.do', {page_size, page_number});
  }

  //精品直播课接口
  quality_course_list({room_type, topic_type, page_number, page_size}) {
    return this.agent.post('/quality_course_list.do', {room_type, topic_type, page_number, page_size});
  }

  //明星专家列表
  expert_list(keyword, page_number) {
    return this.agent.post('/expert_list.do', {keyword, page_number});
  }

  //专家检索接口
  keyword_search_expert({keyword, page_number}) {
    return this.agent.post('/keyword_search_expert.do', {keyword, page_number}).then(data => {
      return {
        ...data,
        data: data.data.expert_list.map(item => ({
          expert_id: item.id,
          avatar_img: item.avatar_img,
          expert_name: item.expert_name.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          expert_info: item.career_info.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          speciality: item.speciality.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          follower_count: item.follower,
          followStatus: item.follow_status,

        })),
      };
    });
  }

  //课程检索接口
  keyword_search_room({keyword, page_number}) {
    return this.agent.post('/keyword_search_room.do', {keyword, page_number}).then(data => {
      //console.log(data);
      return {
        ...data,
        data: data.data.room_list.map(item => ({
          room_id: item.id,
          room_name: item.room_name.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          room_thumbnail: item.room_banner,
          sub_title: item.sub_title.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          expert_info: item.career_info.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          room_type: item.room_type,
          line_through_price: item.line_price,
          price: item.price,
          vip_price: item.vip_price,
          expert_name: item.expert_name.replace(new RegExp(`<em>|</em>`, 'g'), ``),
          look_numbers: item.look_numbers,
          begin_time: item.begin_time,
          icon: item.icon,
        })),
      };
    });
  }

  //文章检索接口
  keyword_search_article({keyword, page_number}) {
    return this.agent.post('/keyword_search_article.do', {keyword, page_number}).then(data => {
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

  //热门搜索
  hot_key(uid) {
    return this.agent.post('/hot_key.do', {uid});
  }

  //热门活动列表
  event_list(page_size, page_number = 1) {
    return this.agent.post('/event_list.do', {page_size, page_number});
  }

  //热门活动详情
  event_info(id) {
    return this.agent.post('/event_info.do', {id});
  }

  //我的学习--最近学习
  my_studies({uid, page_number, page_size}) {
    return this.agent.post('/my_studies.do', {uid, page_number, page_size});
  }

  // 购买记录（我的课程）
  myCourse({uid, page_number, page_size}) {
    return this.agent.post('/my_courses.do', {'uid': uid, 'page_number': page_number, 'page_size': page_size});
  }

  //热门活动详情公告
  event_notice_list(event_id, page_size, page_number) {
    return this.agent.post('/event_notice_list.do', {
      event_id, page_size, page_number,
    });
  }

  //直播ing
  living_course_list() {
    return this.agent.post('/living_course_list.do', {});
  }

  //关联咨询列表
  related_information_list({keywords, page_size = 10, page_number = 1}) {
    return this.agent.post('/related_information_list.do', {keywords, page_size, page_number});
  }

  //关联课程列表
  related_course_list({keywords, page_size = 10, page_number = 1}) {
    return this.agent.post('/related_course_list.do', {keywords, page_size, page_number});
  }

  //文章列表
  information_list({page_number, page_size = 10, cid}) {
    return this.agent.post('/information_list.do', {page_number, page_size, cid});
  }

  //文章类型
  information_cate() {
    return this.agent.post('/information_cate.do', {});
  }

  //文章详情
  information_info(information_id) {
    return this.agent.post('/information_info.do', {information_id});
  }

  //文章相关联课程
  related_course_list({keywords, page_size, page_number}) {
    return this.agent.post('/related_course_list.do', {page_number, keywords, page_size});
  }

  //文章评论列表
  information_comment_list(uid, information_id, page_number, page_size, to_comment_id) {
    return this.agent.post('/information_comment_list.do', {
      uid,
      page_number,
      information_id,
      to_comment_id,
      page_size,
    });
  }

  //文章评论
  information_comment(uid, information_id, content, to_comment_id) {
    return this.agent.post('/information_comment.do', {uid, information_id, content, to_comment_id});
  }

  //点赞
  information_comment_digg(uid, comment_id) {
    return this.agent.post('/information_comment_digg.do', {uid, comment_id});
  }

  //取消点赞
  delete_information_comment_digg(uid, comment_id) {
    return this.agent.post('/delete_information_comment_digg.do', {uid, comment_id});
  }

  //资讯评论详情
  information_comment_info(uid, comment_id) {
    return this.agent.post('/information_comment_info.do', {uid, comment_id});
  }

  //资讯分享
  information_info_share(uid, information_id) {
    return this.agent.post('/information_info_share.do', {uid, information_id});
  }

  //资讯分享
  check_course_grade(uid, room_id, topic_id) {
    return this.agent.post('/check_course_grade.do', {uid, room_id, topic_id});
  }

  //用户使用条款
  aiqin_member_vip_protocol({uid}) {
    const prefix = Config.app === 'aq' ? '/aiqin_member_vip_protocol.do' : '/hbb_member_vip_protocol.do';
    return this.agent.post(`${prefix}`, {uid});
  }

  //亲子故事
  parent_story_list({page_size, page_number = 1}) {
    return this.agent.post('/parent_story_list.do', {page_size, page_number});
  }

  //热门课程列表
  hot_course_list({page_size, page_number = 1}) {
    return this.agent.post('/hot_course_list.do', {page_size, page_number});

  }

  //体验课推广活动详情
  experiential_event_detail({eeid}) {
    return this.agent.post('/experiential_event_detail.do', {eeid});
  }

  //体验课推广活动列表
  experiential_event_list({uid, page_size, page_number}) {
    return this.agent.post('/experiential_event_list.do', {
      uid,
      page_size,
      page_number,
    });
  }

  //体验课分享图片
  experiential_share_pictures({uid, eeid}) {
    return this.agent.post('/experiential_share_pictures.do', {
      uid,
      eeid,
    });
  }

  //我的体验课列表
  my_experientials({uid, page_size, page_number = 1}) {
    return this.agent.post('/my_experientials.do', {uid, page_size, page_number});
  }

  //分享体验课
  experiential_event_list({uid, keyword, page_size, page_number = 1}) {
    return this.agent.post('/experiential_event_list.do', {uid, keyword, page_size, page_number});
  }

  //用户角色
  user_role({uid}) {
    return this.agent.post('/user_role.do', {uid});
  }

  //领取体验课
  find_experiential_info({uid, experiential_id}) {
    return this.agent.post('/find_experiential_info.do', {uid, experiential_id});
  }

  //体验课说明
  experiential_event_note({}) {
    return this.agent.post('/experiential_event_note.do', {});
  }

  //省市区级联表
  get_area({mode}) {
    return this.agent.post('/area_all.do', {mode});
  }

  //活动问卷提交
  submit_event_survey({uid, eid, survey_id, survey_content}) {
    return this.agent.post('/submit_event_survey.do', {
      uid, eid, survey_id, survey_content
    });
  }

  //活动列表
  list_event({page_size, page_number, type}) {
    return this.agent.post('/list_event.do', {page_size, page_number, type});

  }

  //上传图片
  get_oss_policy({}) {
    return this.agent.post('/get_oss_policy.do', {});
  }

  //活动晒单列表
  event_comment_list({eid, page_number, page_size = 10}) {
    return this.agent.post('/event_comment_list.do', {eid, page_number, page_size});
  }

  //活动详情
  event_list_info({eid}) {
    return this.agent.post('/event_list_info.do', {eid});
  }

  //活动报名接口
  enrollment_event({uid, eid}) {
    return this.agent.post('/enrollment_event.do', {uid, eid});
  }

  //取消报名接口
  unenrollment_event({uid, eid}) {
    return this.agent.post('/unenrollment_event.do', {uid, eid});
  }

  //活动晒单发表接口
  post_event_comment({eid, uid, content, imgs}) {
    return this.agent.post('/post_event_comment.do', {eid, uid, content, imgs});
  }

  //首页浮层接口
  homepage_ad() {
    return this.agent.post('/homepage_ad.do', {});
  }

  //我的亲豆
  query_coin_transfer({uid, page_number, page_size = 10}) {
    return this.agent.post('/query_coin_transfer.do', {
      uid,
      page_number,
      page_size,
    });
  }

  //我的积分
  query_point_transfer({uid, page_number, page_size = 10}) {
    return this.agent.post('/query_point_transfer.do', {
      uid,
      page_number,
      page_size,
    });
  }

  //课程分享
  mp_topic_share_info({uid, room_id, topic_id}) {
    return this.agent.post('/mp_topic_share_info.do', {uid, room_id, topic_id});
  }

  //我的余额
  my_assets({uid}) {
    return this.agent.post('/my_assets.do', {uid});
  }

  //分享卡片点击进去页面
  topic_can_enter({room_id,topic_id,uid}){
    return this.agent.post('/topic_can_enter.do',{
      'room_id': room_id,
      'topic_id': topic_id,
      'uid': uid,
    })
  }
}


const HOST = '';
export default new API(HOST || Config.host);
