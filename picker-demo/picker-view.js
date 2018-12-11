// console.log('地区', data);
/*let areaData = [];
let currentPTitleIndex = 0;
let currentCTitleIndex = 0;
let currentProvinceIndex = -1;
let currentCityIndex = -1;
// console.log(data);
data.forEach(function (item, index) {
  if (item.pid === 0) {
    currentProvinceIndex = currentProvinceIndex + 1;
    currentPTitleIndex = index;
    currentCityIndex = -1;
    const provinceData = {};
    provinceData[item.title] = [];
    areaData.push(provinceData);
  } else if (item.pid === data[currentPTitleIndex].area_id) {

    currentCityIndex = currentCityIndex + 1;
    currentCTitleIndex = index;
    const cityData = {};
    cityData[item.title] = [];
    areaData[currentProvinceIndex][data[currentPTitleIndex].title].push(cityData);
    //比较上下两个地区
    data[index + 1].pid !== item.area_id && (areaData[currentProvinceIndex][data[currentPTitleIndex].title][currentCityIndex][data[currentCTitleIndex].title].push(' '));
  } else {
    const county = item.title === null ? ' ' : item.title;
    areaData[currentProvinceIndex][data[currentPTitleIndex].title][currentCityIndex][data[currentCTitleIndex].title].push(county);
  }
});*/


/*arr = [
  {area_id: 1, title: '北京', pid: 0, sort: 1},
  {area_id: 2, title: '北京市', pid: 1, sort: 1},
  {area_id: 3, title: '东城区', pid: 2, sort: 1},
  {area_id: 4, title: '西城区', pid: 2, sort: 1},
  {area_id: 5, title: '崇文区', pid: 2, sort: 1},
  {area_id: 6, title: '宣武区', pid: 2, sort: 1},
  {area_id: 7, title: '朝阳区', pid: 2, sort: 1},
  {area_id: 8, title: '丰台区', pid: 2, sort: 1},
  {area_id: 9, title: '石景山区', pid: 2, sort: 1},
  {area_id: 10, title: '海淀区', pid: 2, sort: 1},
  {area_id: 11, title: '门头沟区', pid: 2, sort: 1},
  {area_id: 12, title: '房山区', pid: 2, sort: 1},
  {area_id: 13, title: '通州区', pid: 2, sort: 1},
  {area_id: 14, title: '顺义区', pid: 2, sort: 1},
  {area_id: 15, title: '昌平区', pid: 2, sort: 1},
  {area_id: 16, title: '大兴区', pid: 2, sort: 1},
  {area_id: 17, title: '怀柔区', pid: 2, sort: 1},
  {area_id: 18, title: '平谷区', pid: 2, sort: 1},
  {area_id: 19, title: '密云县', pid: 2, sort: 1},
  {area_id: 20, title: '延庆县', pid: 2, sort: 1},
  {area_id: 21, title: '上海', pid: 0, sort: 1},
  {area_id: 22, title: '上海市', pid: 21, sort: 1},
  {area_id: 23, title: '黄浦区', pid: 22, sort: 1},
  {area_id: 24, title: '卢湾区', pid: 22, sort: 1},
  {area_id: 25, title: '徐汇区', pid: 22, sort: 1},
  {area_id: 26, title: '长宁区', pid: 22, sort: 1},
  {area_id: 27, title: '静安区', pid: 22, sort: 1},
  {area_id: 28, title: '普陀区', pid: 22, sort: 1},
  {area_id: 29, title: '闸北区', pid: 22, sort: 1},
  {area_id: 30, title: '虹口区', pid: 22, sort: 1},
  {area_id: 31, title: '杨浦区', pid: 22, sort: 1},
  {area_id: 32, title: '闵行区', pid: 22, sort: 1},
  {area_id: 33, title: '宝山区', pid: 22, sort: 1},
  {area_id: 34, title: '嘉定区', pid: 22, sort: 1},
  {area_id: 35, title: '浦东新区', pid: 22, sort: 1},
  {area_id: 36, title: '金山区', pid: 22, sort: 1},
  {area_id: 37, title: '松江区', pid: 22, sort: 1},
  {area_id: 38, title: '青浦区', pid: 22, sort: 1},
  {area_id: 39, title: '南汇区', pid: 22, sort: 1},
  {area_id: 40, title: '奉贤区', pid: 22, sort: 1},
  {area_id: 41, title: '崇明县', pid: 22, sort: 1},
];*/


/*
let currentPTitleIndex = 0;
let currentCTitleIndex = 0;
let currentCityIndex = 0;
this.data.arr.forEach((item, index) => {
  if (item.pid === 0) {
    // console.log(item,'省【直辖市】？？？')
    currentPTitleIndex = index;
    this.setData({
      [`arr[${currentPTitleIndex}]`]: {...this.data.arr[currentPTitleIndex], city: []},
    });
  } else if (item.pid !== this.data.arr[currentPTitleIndex].area_id) {
    // console.log(item, '区【县】？？？？');
    currentCityIndex = index;
    this.setData({
      [`arr[${currentPTitleIndex}]`]: {
        ...this.data.arr[currentPTitleIndex], city: [
          {
            ...this.data.arr[currentCTitleIndex],
            area: [...this.data.arr[currentPTitleIndex].city[0].area, this.data.arr[currentCityIndex]],
          },
        ],
      },
    });
    // console.log(this.data.arr[currentCityIndex], 'this.data.arr[currentCityIndex]');
  } else {
    // console.log(item, '市？？？');
    currentCTitleIndex = index;
    this.setData({
      [`arr[${currentPTitleIndex}]`]: {
        ...this.data.arr[currentPTitleIndex],
        city: [{...this.data.arr[currentCTitleIndex], area: []}],
      },
    });
  }
});
console.log(this.data.arr, 'this.data.arr');
this.data.placeArray = this.data.arr.filter(item => {
  if (item.pid === 0) {
    return item;
  }
});
console.log(this.data.placeArray, 'this.data.placeArray');
*/



/*

<view>选择的地区为 {{province}}--{{city}}--{{area}}</view>


<view style="display:flex;" class="">
  <picker-view indicator-style="height: 50px;" style="width: 100%; height: 150px;" value="{{value}}"
bindchange="changeProvinces">
  <picker-view-column>
  <view wx:for="{{provinceArray}}" style="line-height: 50px">{{item.title}}</view>
</picker-view-column>
<picker-view-column>
<view wx:for="{{provinceArray[currentProvinceId].city}}" style="line-height: 50px">{{item.title}}
</view>
</picker-view-column>
<picker-view-column>
<view wx:for="{{provinceArray[currentProvinceId].city[currentCityId].area}}"
  style="line-height: 50px">{{item.title}}
</view>
</picker-view-column>
</picker-view>
</view>*/

// js
/*data({
  provinceArray: [],
  cityArray: [],
  areaArray: [],
  province: '',
  city: '',
  area: '',
  currentProvinceId: 0,
  currentCityId: 0,
  currentAreaId: 0,
  value: [0, 0, 0],
})*/;
/*api.get_area({}).then(({meta, data}) => {
      const dataProvince =
        data.filter(item => item.pid === 0)
            .map(item => ({...item, city: []}));

      const dataCity = [];
      const dataArea = [];
      data.filter(item => item.pid !== 0)
          .forEach(function (item) {
            const provinceMatched = dataProvince.find(function (province) {
              return province.area_id === item.pid;
            });
            if (provinceMatched) {
              dataCity.push({...item, area: []});
              // provinceMatched.item.push({...item,area:[]})
            } else {
              dataArea.push(item);
            }

          });

      dataArea.forEach(function (area) {
        dataCity.find(function (city) {
          return area.pid === city.area_id;
        }).area.push(area);
      });

      dataCity.forEach(function (city) {
        dataProvince.find(function (province) {
          return city.pid === province.area_id;
        }).city.push(city);
      });

      this.setData({
        provinceArray: dataProvince,
        province: dataProvince[0].title || '',
        city: dataProvince[0].city[0].title || '',
        area: dataProvince[0].city[0].area[0].title || '',
      });
      console.log(dataProvince, '问卷请求数据');
    });*/
/*changeProvinces(e) {
    let val = e.detail.value;
    if (this.data.currentProvinceId !== val[0]) {
      this.data.currentProvinceId = val[0];
      this.data.currentCityId = 0;
      this.data.currentAreaId = 0;
      this.data.value = [val[0], 0, 0];
    } else {
      if (this.data.currentCityId !== val[1]) {
        this.data.currentCityId = val[1];
        this.data.currentAreaId = 0;
        this.data.value = [val[0], val[1], 0];
      } else {
        this.data.currentAreaId = val[2];
        this.data.value = val;
      }
    }
    console.log(val, 'e.detail.value');

    const areas = this.data.provinceArray[val[0]].city[val[1]].area;
    this.setData({
      province: this.data.provinceArray[val[0]].title,
      city: this.data.provinceArray[val[0]].city[val[1]].title,
      area: areas.length > 0 ? areas[val[2]].title : '',
      currentProvinceId: this.data.currentProvinceId,
      currentCityId: this.data.currentCityId,
      currentAreaId: this.data.currentAreaId,
      value: this.data.value,
      selected: true,
    });
  },*/



