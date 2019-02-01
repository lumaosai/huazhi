require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        init: function () {
            require(['/html/0_0/js/eCharts.my.js'], function (echartsAll) {
                /**————————————————————————饼类图表————————————————————————————*/
                var apiCfg={
                    url:'../../html/0_0/json/tsconfig.json',
                    contentType:'Form',
                    data:{}
                };
                //饼图
                echartsAll.ec_ecsRender('pieTest', apiCfg, {type: "pie"});

                //环形图
                echartsAll.ec_ecsRender('loopPieTest', apiCfg, {type: "loopPie",specialAttr: {
                    title: {
                        text: '我的环形图',
                            subtext: '属性环形图',
                            x: 'center'
                    },
                    series:[
                        {
                            //name:'面积模式',
                            //type:'pie',
                            //radius : [30, 80],
                            center : ['30%', '50%'],
                            roseType : 'area',
                        }
                    ]

                }});

                //南丁格尔图
                echartsAll.ec_ecsRender('radiusPieTest', apiCfg, {type: "radiusPie",specialAttr: {
                    title: {
                        text: '我的',
                        subtext: '属性',
                        x: 'center'
                    },
                    series:[
                        {
                            name:'面积模式',
                            //type:'pie',
                            radius : [30, 80],
                            center : ['80%', '50%'],
                            roseType : 'area',
                        }
                    ]

                }});

                //嵌套环图
                /**特殊传参*/
                var obj = {
                    type: 'loopAndLoop',
                    specialAttr: {
                        title: {
                            text: '嵌套环图2',
                            subtext: '测试',
                            x: 'center'
                        }

                    }
                };
                echartsAll.ec_ecsRender('loopAndLoopTest', apiCfg, obj);

                //饼环图
                var obj = {
                    type: 'pieAndLoop'
                };
                echartsAll.ec_ecsRender('pieAndLoopTest', apiCfg, obj);

                //环形组合图
                var obj = {
                    type: 'loopCom'
                };
                echartsAll.ec_ecsRender('loopComTest', apiCfg, obj);
                /**————————————————————————线类图表————————————————————————————*/
                //线图
                var obj = {
                    type: 'line'
                };
                echartsAll.ec_ecsRender('lineTest', apiCfg, obj);

                //折点曲线图
                var obj = {
                    type: 'line'
                };
                echartsAll.ec_ecsRender('dataBreakLineTest', apiCfg, obj);

                //堆积折线图
                var obj = {
                    type: 'heapLine'
                };
                echartsAll.ec_ecsRender('heapLineTest', apiCfg, obj);

                //堆积面积图

                var obj = {
                    type: 'heapAreaLine'
                };
                echartsAll.ec_ecsRender('heapAreaLineTest', apiCfg, obj);

                //标准面积图
                var obj = {
                    type: 'areaLine'
                };
                echartsAll.ec_ecsRender('areaLineTest', apiCfg, obj);

                //大小值折线图
                var obj = {
                    type: 'maxMinLine'
                };
                echartsAll.ec_ecsRender('maxMinLineTest', apiCfg, obj);

                /**————————————————————————柱类图表————————————————————————————*/

                //柱状图
                var obj = {
                    type: 'bar',
                    specialAttr: {
                        title: {
                            text: '我的柱状图',
                            subtext: '测试',
                            x: 'center'
                        },
                        legend: {
                            orient: 'horizontal',
                            x: '60%',
                            y: '1%'
                        },
                        grid: {
                            left: '30%',
                            right: '10%',
                            bottom: '30%',
                            containLabel: true
                        },
                        xAxis: [{
                            type: 'category', //X轴均为category，Y轴均为value
                            boundaryGap: ['1%','1%']  //数值轴两端的空白策略
                        }],

                    }
                };
                echartsAll.ec_ecsRender('barTest', apiCfg, obj);

                //多系列队列图

                var obj = {
                    type: 'manySeriesBar'
                };
                echartsAll.ec_ecsRender('manySeriesBarTest', apiCfg, obj);

                //多系列彩虹柱形图
                var obj = {
                    type: 'manyColorBar'
                };
                echartsAll.ec_ecsRender('manyColorBarTest', apiCfg, obj);

                //系列堆积图

                var obj = {
                    type: 'seriesHeapBar'
                };
                echartsAll.ec_ecsRender('seriesHeapBarTest', apiCfg, obj);

                //条形堆积
                var obj = {
                    type: 'stackedBar'
                };
                echartsAll.ec_ecsRender('stackedBarTest', apiCfg, obj);

                //百分比堆积图
                var obj = {
                    type: 'percentHeapBar'
                };
                echartsAll.ec_ecsRender('percentHeapBarTest', apiCfg, obj);

                //搭配时间轴柱状图
                var obj = {
                    type: 'timeLineBar'
                };
                echartsAll.ec_ecsRender('timeLineBarTest', apiCfg, obj);

                /**————————————————————————线柱组合图表————————————————————————————*/
                //线柱图
                var obj = {
                    type: 'lineAndBar'
                };
                echartsAll.ec_ecsRender('lineAndBarTest', apiCfg, obj);

                /**————————————————————————仪表类图表————————————————————————————*/
                //仪表盘
                var obj = {
                    type: 'gauge'
                };
                echartsAll.ec_ecsRender('gaugeTest', apiCfg, obj, 2);

                /**————————————————————————雷达图表————————————————————————————*/
                //雷达图
                var obj = {
                        type: 'radar'
                    };
                echartsAll.ec_ecsRender('radarTest', apiCfg, obj);

                //虫洞图
                var obj = {
                    type: 'wormhole'
                };
                echartsAll.ec_ecsRender('wormholeTest', apiCfg, obj);
                //虫洞公式： value:[(40 - i) * 10,(38 - i) * 4 + 60,i * 5 + 10,i * 9,i * i /2],
            });
        }









    };
    $(function () {
        if ($('#echartsTest').length > 0) {
            PageModule.init();
        }

    });

});