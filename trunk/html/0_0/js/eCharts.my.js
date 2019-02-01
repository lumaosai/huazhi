define(['./echarts-all.js', './zrender.js', 'macarons'], function (echartAll, zrender, theme) {
    /*/echarts-2.2.7/build/dist,/zrender-master/zrender-master/dist*/
    /**
     * 说明：
     * 1、本封装方法是按照js的执行顺序先后进行排列，公共方法放在最后
     * */


    var echartsAll = {
        //请求方法
        /**
         * 作者：贾旭光 时间：2019.1.3
         * @param containerId 容器id
         * @param apiCfg      传参信息：data contentType url
         * @param typeAttr    图表类型
         * @param timer       是否走定时器 传数字（秒）
         * @param myChart     二次调用时声明myChart用的 从ecRender方法中带入的参数 初始化没有这个参数
         */
        renderUrl: function (containerId, apiCfg, typeAttr, timer,myChart) {
            //请求接口
            var url = apiCfg.url,
                data = apiCfg.data || {},
                contentType = apiCfg.contentType || 'Json';
            if (contentType == "Json") {
                data = JSON.stringify(data);
            }
            if(myChart&&myChart!=''){
                Api.ajaxAdvance(apiCfg,function (result) {
                    options = echartsAll.options(typeAttr, result[typeAttr.type + '_rows']);
                    /**假数据*/
                    options.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
                    myChart.setOption(options, true);
                    return;
                },null,false)
            }else{
                Api["ajax" + contentType](url, data, function (result) {
                    if (result.success) {
                        echartsAll.ecRender.renderOne(containerId, result[typeAttr.type + '_rows'], typeAttr, timer, apiCfg);
                    } else {
                        Mom.layerMsg(result.meaasge);
                    }
                });
            }

        },
        /***图表渲染*/
        ecRender: {
            /*
             *********参数说明********：
             * 主要分为四个参数：
             * containerId（容器ID）、series_data（参数数据）、type（图表类型）、timer（定时刷新）
             */
            /*
             1、containerId:echarts外包容器的id,同时也仅限id
             */
            /*
             2、series_data：渲染图表参数 其中参数有三个
             |***** title:'xxx图形表' 表标题一般为字符串 也可以传数组 数组只能是两位[‘xxx年销售计划’（主标题），‘2017-2019’（副标题）]
             |***** rows:[] 是一个数组 数组内多个参数对象 表渲染所需数据 需要按照表的类型参数都不一样 现分类如下：
             |*** 饼图：
             参数为对象 {value: 59(需要渲染的数值), name: '1月生产'(饼图上渲染的提示标签), group: '第一季度'(用于区分单个图表还是组合图表 多个group就多个饼图)}
             实例：
             rows: [
             {value: 59, name: '1月生产', group: '第一季度'},
             {value: 34, name: '2月生产', group: '第一季度'},
             {value: 13, name: '3月生产', group: '第一季度'},
             {value: 31, name: '4月生产', group: '第二季度'},
             {value: 79, name: '5月生产', group: '第二季度'},
             {value: 33, name: '6月生产', group: '第二季度'}
             ]

             |*** 线图：
             参数为对象 对象内嵌套数组
             {
             value: [140, 160, 250, 233, 330, 220, 100],
             (每个对应x轴的数据)
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             （x轴显示的名称）
             group: '1月生产'
             （用来区分有几个数据 并且group名称会显示在线数据上以及右侧可操作分类标签中）
             }
             实例：rows: [
             {
             value: [140, 160, 250, 233, 330, 220, 100],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '1月生产'
             },
             {
             value: [130, 150, 110, 122, 230, 201, 150],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '2月生产'
             }
             ]
             |*** 柱图：
             参数为对象 对象内嵌套数组
             |** 柱状图：
             {
             value: [140, 160, 250, 233, 330, 220, 100],
             (每个对应x轴的数据)
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             （x轴显示的名称）
             group: '1月生产'
             （用来区分有几个数据 并且group名称会显示在线数据上以及右侧可操作分类标签中）
             }
             实例：rows: [
             {
             value: [140, 160, 250, 233, 330, 220, 100],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '1月生产'
             },
             {
             value: [130, 150, 110, 122, 230, 201, 150],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '2月生产'
             }
             ]
             |*** 线柱类混合图：
             参数为对象 对象内嵌套数组
             {
             value: [140, 160, 250, 233, 330, 220, 100],
             (每个对应x轴的数据)
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             （x轴显示的名称）
             group: '1周期'
             （用来区分有几个数据 并且group名称会显示在线数据上以及右侧可操作分类标签中）
             tableType: 'bar'
             （用来区分数据分别是什么类型的 比如是柱还是线）
             }
             实例：
             rows: [
             {
             value: [80, 70, 60, 50, 40, 30, 20],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '1周期',
             tableType: 'line'
             },
             {
             value: [10, 20, 30, 40, 50, 60, 70],
             name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
             group: '3周期',
             tableType: 'bar'
             }
             ]
             |*** 仪表盘类型：
             参数为对象
             {
             value: 50, （初始仪表盘显示参数）
             name: '温度'（初始仪表盘参数名）
             }
             实例：
             rows: [
             {value: 50, name: '温度'}
             ]
             |*** 特殊类型图表：
             a、搭配时间轴柱状图
             {
             name: ['北京', '天津', '河北', '山西', '成都', '西安', '深圳'],（显示在x轴的标签）
             data: [
             {value: [9846.81, 5252.76, 13607.32, 6024.45, 1252.76, 6607.32, 2024.45]},
             {value: [8117.78, 4462.74, 11467.6, 4878.61, 2252.76, 7607.32, 3024.45]},
             {value: [6969.52, 3905.64, 10012.11, 4230.53, 3252.76, 5607.32, 4024.45]},
             {value: [6033.21, 3110.97, 8477.63, 3571.37, 4252.76, 4607.32, 5024.45]},
             {value: [5007.21, 2578.03, 6921.29, 2855.23, 5252.76, 3607.32, 6024.45]},
             {value: [4315, 2150.76, 6018.28, 2324.8, 6252.76, 5607.32, 4024.45]}
             ],（
             1、时间轴timeLine参数数组中有几个数值这里就要在data中建立几个对象。
             2、name参数数组中有几个数值value的数组中就要有几个值 否则会显示不全默认补充0
             ）
             group: 'GDP'（用来区分有几组数据）
             }

             |***** timeLine: 用于带有时间轴的特殊动态图表
             timeLine: ['2002', '2003']（数组内的数据会显示在时间轴的标签上，并且时间轴会按照指定时间跳转数据）,
             实例：
             timeLine: ['2002', '2003', '2004', '2005', '2006', '2007'],

             */
            /*
             3、typeAttr: 格式是一个对象 其中有两个参数：
             a、type：图表类型
             图表类型：
             |***** 饼图类型：
             pie：饼图
             loopPie：环形图
             radiusPie：南丁格尔图
             pieAndLoop：环饼图
             loopAndLoop：环形嵌套图
             loopCom：环形组合图

             |***** 折线类型：
             line：折线图
             dataBreakLine：折点曲线图
             heapLine：堆积折线图
             heapAreaLine：堆积面积图
             areaLine：标准面积图
             maxMinLine：大小值折线图

             |***** 柱状类型：
             bar：柱状图
             manySeriesBar：多系列队列图
             manyColorBar：多系列彩虹柱形图
             seriesHeapBar：系列堆积图
             stackedBar：条形堆积图
             percentHeapBar：百分比堆积图
             timeLineBar：搭配时间轴图

             |***** 组合类型：
             lineAndBar：线柱组合图

             |***** 仪表盘类型：
             gauge：标准仪表盘图

             b、specialAttr：自定义option下的第一级属性，例如：
             title：{text: '未来一周气温变化',subtext: '纯属虚构'}
             legend：{data:['最高气温','最低气温']}
             等等所有特殊参数都可以替换默认设置

             实例：
             var obj = {
             type: 'loopAndLoop',
             specialAttr: {
             title: {
             text: '嵌套环图2',
             subtext: '测试',
             x: 'left'
             }
             }
             };
             echartsAll.ec_ecsRender('xxxxTest', data, obj);
             */
            /*
             4 timer:传时间（秒 默认乘以了1000毫秒）
             */
            //总渲染方法
            renderOne: function (containerId, series_data, typeAttr, timer,apiCfg) {
                echartsAll.containerId = containerId;
                var myChart = echarts.init(document.getElementById(containerId), theme);
                var options = echartsAll.options(typeAttr, series_data);
                //判断是否刷新图表（定时器）
                if (timer && timer != null) {
                    echartsAll.startTileInterval(containerId, timer, function () {
                        var options = echartsAll.options(typeAttr, series_data);
                        echartsAll.renderUrl(containerId,apiCfg,typeAttr,timer,myChart);
                        myChart.setOption(options, true);
                        return;
                    })
                }
                myChart.setOption(options, true);
            }
        },
        //判断类型渲染option
        options: function (typeAttr, seriesData) {
            var option, type = typeAttr.type;
            //饼类
            if (type == 'pie' || type == 'loopPie' || type == 'radiusPie' || type == 'pieAndLoop' || type == 'loopCom' || type == 'loopAndLoop') {
                option = echartsAll.optionTemplates.pie(seriesData, typeAttr);
            }
            //线、柱状类
            else if (
                /*线类*/
            type == 'line' || type == 'heapLine' || type == 'heapAreaLine' || type == 'areaLine' || type == 'maxMinLine' || type == 'lineAndBar'
            /*柱类*/
            || type == 'bar' || type == 'manySeriesBar' || type == 'manyColorBar' || type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar') {
                option = echartsAll.optionTemplates.lineAndBar(seriesData, typeAttr);
            }
            /*搭配时间轴柱类图*/
            else if (type == 'timeLineBar') {
                option = echartsAll.optionTemplates.timeLineBar(seriesData, typeAttr);
            }
            //仪表类
            else if (type == 'gauge') {
                option = echartsAll.optionTemplates.gauge(seriesData);
            }
            else if(type=='radar'||type=='wormhole'){
                option = echartsAll.optionTemplates.radar(seriesData, typeAttr);
            }
            return option
        },
        //设置参数模板
        optionTemplates: {
            //通用的图表基本配置
            commonOption: {
                //标题方法
                title: function (title) {
                    var titles = {
                        text: typeof(title) == 'string' ? title : title[0] || ' ',
                        subtext: typeof(title) == 'string' ? ' ' : title[1],
                        x: 'center'
                    };
                    return {'title': titles}
                },
                //图表工具栏
                toolbox: function () {
                    return {
                        toolbox: {
                            show: true,
                            feature: {
                                mark: {show: true},
                                dataView: {show: true, readOnly: false},
                                restore: {show: true},
                                saveAsImage: {show: true}
                            }
                        }
                    }
                },
                //有特殊配置的话执行操作 没有的话走默认渲染图表
                specialSettings: function (option, settings) {
                    if (settings) {
                        var options = $.extend(true, option, settings);
                        return options;
                    }
                    return option
                }
            },
            //通用的折线图表的基本配置
            commonLineOption: {},
            //饼图
            pie: function (series_data, typeAttr) {
                var pieData = echartsAll.FormatData(series_data, typeAttr);
                //把导航从Datas中提取出来使用
                var option = {
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        y: 'center',
                        data: pieData.category
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    series: pieData.series
                };
                var options = echartsAll.optionTemplates.commonOption.specialSettings(option, typeAttr.specialAttr);
                console.log(options)
                //合并所有项
                return $.extend({}, echartsAll.optionTemplates.commonOption.title(series_data.title), echartsAll.optionTemplates.commonOption.toolbox(), options);
            },
            //线图与柱状
            lineAndBar: function (series_data, typeAttr) {
                var lineOrBData = echartsAll.FormatData(series_data, typeAttr);
                var option = {
                    legend: {
                        data: lineOrBData.category,
                        orient: 'vertical',
                        x: '86%',
                        y: 'center'
                    },
                    grid: {
                        x: '10%',
                        x2: '20%'

                    },
                    xAxis: [{
                        type: 'category', //X轴均为category，Y轴均为value
                        data: lineOrBData.xAxis,
                        boundaryGap: lineOrBData.boundaryGap  //数值轴两端的空白策略
                    }],
                    yAxis: [{
                        name: '',
                        type: 'value'
                    }],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    series: lineOrBData.series
                };
                if (typeAttr.type == 'bar' || typeAttr.type == 'manySeriesBar' || typeAttr.type == 'manyColorBar' || typeAttr.type == 'seriesHeapBar' || typeAttr.type == 'percentHeapBar' || typeAttr.type == 'stackedBar') {
                    option.tooltip.axisPointer.type = 'shadow';
                    if (typeAttr.type == 'manyColorBar') {
                        var colorList = [
                            '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                            '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'
                        ];
                        option.tooltip = {
                            trigger: 'axis',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            axisPointer: {
                                type: 'shadow'
                            },
                            formatter: function (params) {
                                // for text color
                                var color = colorList[params[0].dataIndex];
                                var res = '<div style="color:' + color + '">';
                                res += '<strong>' + params[0].name + '</strong>';
                                for (var i = 0, l = params.length; i < l; i++) {
                                    res += '<br/>' + params[i].seriesName + ' : ' + params[i].value
                                }
                                res += '</div>';
                                return res;
                            }
                        }
                    }
                    if (typeAttr.type == 'stackedBar') {
                        option.xAxis = [{
                            type: 'value'
                        }];
                        option.yAxis = [{
                            type: 'category',
                            data: lineOrBData.xAxis
                        }];
                    }
                    if (typeAttr.type == 'percentHeapBar') {
                        option.yAxis[0].axisLabel = {
                            show: true,
                            formatter: '{value}%'
                        }
                    }
                }

                var options = echartsAll.optionTemplates.commonOption.specialSettings(option, typeAttr.specialAttr);
                //合并所有项
                return $.extend({}, echartsAll.optionTemplates.commonOption.title(series_data.title), echartsAll.optionTemplates.commonOption.toolbox(), options);
            },
            timeLineBar: function (series_data, typeAttr) {
                var lineOrBData = echartsAll.FormatData(series_data, typeAttr);
                var option = {
                    timeline: {
                        data: lineOrBData.timeLine,
                        autoPlay: true,
                        playInterval: lineOrBData.playInterval, /**改成活的*/
                        x: '1%'
                    },
                    options: [{
                        toolbox: echartsAll.optionTemplates.commonOption.toolbox(),
                        legend: {
                            data: lineOrBData.category,
                            orient: 'vertical',
                            x: '86%',
                            y: 'center'
                        },
                        grid: {
                            x: '8%',
                            y: '10%',
                            y2: '25%',
                            x2: '22%'
                        },
                        xAxis: [{
                            type: 'category', //X轴均为category，Y轴均为value
                            data: lineOrBData.xAxis,
                            boundaryGap: lineOrBData.boundaryGap  //数值轴两端的空白策略
                        }],
                        yAxis: [
                            {
                                'type': 'value',
                                'name': ''
                            },
                            {
                                'type': 'value',
                                'name': ''
                            }
                        ],
                        calculable: true,
                        tooltip: {'trigger': 'axis'},
                        series: lineOrBData.series
                    }]
                };
                var datas = series_data.rows;
                for (var x = 1; x < datas[0].data.length; x++) {
                    var obj = {};
                    var series = [];
                    for (var i = 0; i < datas.length; i++) {
                        var objInner = {
                            data: datas[i].data[x].value
                        };
                        series.push(objInner)
                    }
                    obj.series = series;
                    option.options.push(obj)
                }
                var options = echartsAll.optionTemplates.commonOption.specialSettings(option, typeAttr.specialAttr);
                //合并所有项
                return options;
            },
            //仪表盘
            gauge: function (series_data) {
                var option = {
                    series: [
                        {
                            name: series_data.rows[0].name,
                            type: 'gauge',
                            detail: {formatter: '{value}℃'},
                            data: series_data.rows
                        }
                    ]
                };
                //合并所有项
                return $.extend({}, echartsAll.optionTemplates.commonOption.title(series_data.title), echartsAll.optionTemplates.commonOption.toolbox(), option);
            },
            //雷达
            radar: function (series_data, typeAttr) {
                var radarData = echartsAll.FormatData(series_data, typeAttr);
                var option = {
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        orient: 'vertical',
                        x : 'left',
                        y :'center',
                        data:radarData.category
                    },
                    calculable : true,
                    polar : [
                        {
                            indicator :radarData.indicator,
                            radius: '60%'
                        }
                    ],
                    series:radarData.series
                };
                if(typeAttr.type=='wormhole'){
                    option.tooltip.trigger='item';
                    option.tooltip.backgroundColor='rgba(0,0,250,0.2)';
                }
                //合并所有项
                return $.extend({}, echartsAll.optionTemplates.commonOption.title(series_data.title), echartsAll.optionTemplates.commonOption.toolbox(), option);
            }
        },
        //数据格式处理
        FormatData: function (data, typeAttr) {
            var type = typeAttr.type;
            /*——————————————————————————————饼类————————*/
            //饼图用内含样式+百分比hover显示 不显示外连线
            var pieStyle = {
                normal: {
                    label: {
                        position: 'inner',
                        formatter: function (params) {
                            return (params.percent - 0).toFixed(0) + '%'
                        }
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        formatter: "{b}"
                    }
                }

            };
            //环图样式 hover显示标签在圆心
            var loopStyle = {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        position: 'center',
                        textStyle: {
                            fontSize: '15',
                            fontWeight: 'bold'
                        }
                    }
                }
            };
            //普通饼图、环图、半径饼、饼环组合图
            if (type == 'pie' || type == 'loopPie' || type == 'radiusPie' || type == 'pieAndLoop' || type == 'loopAndLoop') {
                var datas = data.rows;
                var name = [];
                var group = [];
                var tempAll = [];
                for (var i = 0; datas && i < datas.length; i++) {
                    for (var k = 0; k < name.length && name[k] != datas[i].name; k++);
                    if (k == name.length) name.push(datas[i].name);
                    for (var k = 0; k < group.length && group[k] != datas[i].group; k++);
                    if (k == group.length) group.push(datas[i].group);
                }
                for (var i = 0; i < group.length; i++) {
                    var temp = [];
                    for (var j = 0; j < datas.length; j++) {
                        if (group[i] == datas[j].group) {
                            temp.push({
                                name: datas[j].name,
                                value: datas[j].value
                            });
                        }
                    }
                    tempAll.push(temp);
                }
                //搭建series参数
                var series = [];
                for (var i = 0; i < tempAll.length; i++) {
                    var obj = {
                        type: 'pie',
                        name: group[i],
                        data: tempAll[i]
                    };
                    //控制饼图位置、形状
                    if (type == 'pieAndLoop' || type == 'loopAndLoop') {
                        obj.center = ['50%', '50%'];
                        if ((i + 1) % 2 == 0) {
                            obj.radius = ['45%', '55%'];
                        } else {
                            if (type == 'loopAndLoop') {
                                obj.radius = ['25%', '35%'];
                                obj.itemStyle = loopStyle;
                            } else {
                                obj.radius = '35%';
                                obj.itemStyle = pieStyle;
                            }


                        }
                    } else {
                        //判断有多少个图
                        if (tempAll.length > 1) {
                            obj.center = [(i + 1) * (36 - (tempAll.length - 2) * 7) + '%', '50%'];
                            //判断类型
                            if (type == 'pie') {
                                obj.radius = '33%'
                            } else if (type == 'loopPie') {
                                obj.radius = ['25%', '35%'];
                            } else if (type == 'radiusPie') {
                                obj.radius = ['5%', '25%'];
                                obj.roseType = 'area';
                            }
                        } else {
                            obj.center = ['50%', '50%'];
                            if (type == 'pie') {
                                obj.radius = '55%';
                            } else if (type == 'loopPie') {
                                obj.radius = ['55%', '65%'];
                            } else if (type == 'radiusPie') {
                                obj.radius = ['35%', '65%'];
                                obj.roseType = 'area';
                            }
                        }
                    }
                    series.push(obj)
                }
                return {
                    category: name,
                    series: series
                };
            }
            //多环形组合
            else if (type == 'loopCom') {
                var datas = data.rows;
                var name = [];
                var tempAll = [];
                for (var i = 0; datas && i < datas.length; i++) {
                    for (var k = 0; k < name.length && name[k] != datas[i].name; k++);
                    if (k == name.length) name.push(datas[i].name);
                }
                for (var i = 0; i < name.length; i++) {
                    var temp = [];
                    for (var j = 0; j < datas.length; j++) {
                        if (name[i] == datas[j].name) {
                            temp.push({
                                name: datas[j].name,
                                value: datas[j].value
                            }, {
                                name: 'hidden',
                                value: 100 - datas[j].value,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0,0,0,0)',
                                        label: {show: false},
                                        labelLine: {show: false}
                                    },
                                    emphasis: {
                                        color: 'rgba(0,0,0,0)'
                                    }
                                }
                            });
                        }
                    }
                    tempAll.push(temp);
                }
                var series = [];
                var radiusArr = [25, 32];
                for (var i = 0; i < tempAll.length; i++) {
                    var obj = {
                        type: 'pie',
                        name: name[i],
                        data: tempAll[i],
                        itemStyle: {
                            normal: {
                                label: {show: false},
                                labelLine: {show: false}
                            }
                        }
                    };
                    obj.center = ['50%', '50%'];
                    obj.clockWise = true;
                    if (i == 0) {
                        obj.radius = ['25%', '32%']
                    } else {
                        obj.radius = [radiusArr[0] + i * (radiusArr[1] - radiusArr[0]) + '%', radiusArr[1] + i * (radiusArr[1] - radiusArr[0]) + '%']
                    }
                    series.push(obj);
                }
                return {
                    category: name,
                    series: series
                };

            }
            /*——————————————————————————————线柱类————————*/
            //线图、堆积折线图、堆积面积图、标准面积图、柱状图、线柱组合图
            else if (
                /*线类*/
            type == 'line' || type == 'heapLine' || type == 'heapAreaLine' || type == 'areaLine' || type == 'maxMinLine'
            /*柱类*/
            || type == 'bar' || type == 'manySeriesBar' || type == 'manyColorBar' || type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar' || type == 'lineAndBar') {
                var group = [];
                var series = [];
                var datas = data.rows;
                var boundaryGap = true;
                for (var i = 0; datas && i < datas.length; i++) {
                    for (var k = 0; k < group.length && group[k] != datas[i].group; k++);
                    if (k == group.length) group.push(datas[i].group);
                    var series_temp = {
                        name: datas[i].group,
                        data: datas[i].value,
                        type: type
                    };
                    /*线类判断*/
                    if (type == 'heapLine') {
                        series_temp.stack = 'allValue';
                        series_temp.type = 'line';
                        boundaryGap = false;
                    }
                    else if (type == 'heapAreaLine') {
                        series_temp.stack = 'allValue';
                        series_temp.type = 'line';
                        series_temp.itemStyle = {normal: {areaStyle: {type: 'default'}}};
                        boundaryGap = false;

                    }
                    else if (type == 'areaLine') {
                        series_temp.type = 'line';
                        series_temp.itemStyle = {normal: {areaStyle: {type: 'default'}}};
                        boundaryGap = false;
                    }
                    else if (type == 'maxMinLine') {
                        series_temp.type = 'line';
                        series_temp.markPoint = {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        };
                        series_temp.markLine = {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        };

                        boundaryGap = false;
                    }
                    /*柱类判断*/
                    else if (type == 'manySeriesBar') {
                        series_temp.type = 'bar';
                        series_temp.markPoint = {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        };
                        series_temp.markLine = {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        };
                    }
                    else if (type == 'manyColorBar') {
                        series_temp.type = 'bar';
                        var colorList = [
                            '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                            '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'
                        ];
                        var itemStyle = {
                            normal: {
                                color: function (params) {
                                    if (params.dataIndex < 0) {
                                        // for legend
                                        return zrender.color.lift(
                                            colorList[colorList.length - 1], params.seriesIndex * 0.2);
                                    }
                                    else {
                                        // for bar
                                        return zrender.color.lift(
                                            colorList[params.dataIndex], params.seriesIndex * 0.2
                                        );
                                    }
                                }
                            }

                        };
                        series_temp.itemStyle = itemStyle;
                    }
                    else if (type == 'seriesHeapBar' || type == 'stackedBar' || type == 'percentHeapBar') {
                        series_temp.type = 'bar';
                        series_temp.stack = '总量';
                        series_temp.itemStyle = {normal: {label: {show: true, position: 'insideRight'}}};
                        if (type == 'percentHeapBar') {
                            series_temp.itemStyle = {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'insideRight',
                                        formatter: '{c}%'
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                }

                            };
                        }
                        if (type == 'seriesHeapBar') {
                            series_temp.barWidth = 30;
                        }

                    }

                    else if (type == 'lineAndBar') {
                        series_temp.type = datas[i].tableType;
                    }

                    series.push(series_temp);
                }
                var dataAll = {
                    category: group,
                    xAxis: datas[0].name,
                    series: series,
                    boundaryGap: boundaryGap
                };
                return dataAll
            }
            /*动态时间轴*/
            else if (type == 'timeLineBar') {
                var group = [];
                var series = [];
                var datas = data.rows;
                var boundaryGap = true;

                for (var i = 0; i < datas.length; i++) {
                    group.push(datas[i].group);
                    for (var x = 0; x < datas[i].data.length; x++) {
                        if (x == 0) {
                            var obj = {
                                name: datas[i].group,
                                type: 'bar',
                                data: datas[i].data[x].value
                            };
                            if (i == 1) {
                                obj.yAxisIndex = 1;
                            }
                            series.push(obj)
                        }
                    }
                }
                var dataAll = {
                    category: group,
                    xAxis: datas[0].name,
                    series: series,
                    boundaryGap: boundaryGap,
                    timeLine: data.timeLine,
                    playInterval:data.playInterval*1000
                };
                return dataAll
            }
            /*雷达图*/
            else if(type=='radar'||type=='wormhole'){
                var group = [],indicator=[],seriesData=[];
                var datas = data.rows;
                for (var i = 0; i < datas.length; i++) {
                    group.push(datas[i].group);
                    var obj = {
                        name: datas[i].group,
                        value: datas[i].value
                    };
                    seriesData.push(obj)
                }

                if(type=='wormhole'){
                    for(var x=0;x<datas[0].name.length;x++){
                        var indicatorobj={
                            text:datas[0].name[x],
                            max:datas[0].max
                        };
                        indicator.push(indicatorobj)
                    }
                    var series=[
                        {
                            type: 'radar',
                            symbol:'none',
                            itemStyle: {

                                normal: {
                                    lineStyle: {
                                        width:1
                                    },
                                    color:(function (){
                                        return zrender.color.lift(
                                            '#ef0123',0.5);
                                    })()
                                },
                                emphasis : {
                                    areaStyle: {color:'rgba(0,250,0,0.3)'}
                                }
                            },
                            data:seriesData
                        }
                    ];
                }else{
                    for(var x=0;x<datas[0].name.length;x++){
                        var indicatorobj={
                            text:datas[0].name[x]
                        };
                        indicator.push(indicatorobj)
                    }
                    var series=[
                        {
                            type: type,
                            itemStyle: {
                                normal: {
                                    areaStyle: {
                                        type: 'default'
                                    }
                                }
                            },
                            data:seriesData
                        }
                    ];
                }

                var dataAll = {
                    category: group,
                    series: series,
                    indicator:indicator
                };
                return dataAll

            }
        },

        /*——————————————————————————————————公共方法————————*/
        //开启磁贴定时刷新
        tileInterValArr: [],
        startTileInterval: function (id, timer, callback) {
            if (timer && timer > 0) {
                var tileInterv = setInterval(function () {
                    if (callback && document.getElementById(id).clientWidth) {
                        callback();
                    }
                }, timer * 1000);
                echartsAll.tileInterValArr.push({id: id, tileInterv: tileInterv});
            }
        },
        //关闭磁贴定时刷新
        clearTileInterval: function (id) {
            $(echartsAll.tileInterValArr).each(function (i, o) {
                if (o.id == id) {
                    clearInterval(o.tileInterv);
                    echartsAll.tileInterValArr.splice(i, 1);
                }
            });
        }
    };
    return {
        ec_ecsRender: echartsAll.renderUrl/*ecRender.renderOne*/
    }
});
