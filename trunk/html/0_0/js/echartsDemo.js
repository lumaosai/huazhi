require([cdnDomain+'/js/zlib/app.js'], function (App) {
    var PageModule = {
        init: function () {
            require(['echartsv2_my'], function (echartsAll) {
                var apiCfg={
                    url:'http://114.115.165.184/html/0_0/json/echartsDemo.json',
                    contentType:'Form',
                    data:{}
                };
                var obj = {
                    type:"pie",
                    title:"标准饼图"
                };
                // echartsAll.ec_ecsRender('pieTest', apiCfg, obj,5);
                echartsAll.ec_ecsRender('pieTest', apiCfg, obj);

                /**————————————————————————饼类图表————————————————————————————*/


                //环形图
                echartsAll.ec_ecsRender('loopPieTest', apiCfg, {type: "loopPie",title:"环形图"});


                //南丁格尔图
                echartsAll.ec_ecsRender('radiusPieTest', apiCfg, {type: "radiusPie",title:"南丁格尔图"});


                //嵌套环图
                var obj = {
                    type: 'loopAndLoop',
                    specialAttr: {
                        title: {
                            text: '嵌套环图2',
                            subtext: '测试',
                            x: 'center'
                        }

                    },
                    title:"嵌套环图"
                };
                echartsAll.ec_ecsRender('loopAndLoopTest', apiCfg, obj);


                //饼环图
                var obj = {
                    type: 'pieAndLoop',
                    title:"饼环图"
                };
                echartsAll.ec_ecsRender('pieAndLoopTest', apiCfg, obj);


                //环形组合图
                var obj = {
                    type: 'loopCom',
                    title:"环形组合图"
                };
                echartsAll.ec_ecsRender('loopComTest', apiCfg, obj);
                /**————————————————————————线类图表————————————————————————————*/
                    //线图
                var obj = {
                        type: 'line',
                        title:"线图"
                    };
                echartsAll.ec_ecsRender('lineTest', apiCfg, obj);

                //折点曲线图
                var obj = {
                    type: 'line',
                    title:"折点曲线图"
                };
                echartsAll.ec_ecsRender('dataBreakLineTest', apiCfg, obj);

                //堆积折线图
                var obj = {
                    type: 'heapLine',
                    title:"堆积折线图"
                };
                echartsAll.ec_ecsRender('heapLineTest', apiCfg, obj);

                //堆积面积图
                var obj = {
                    type: 'heapAreaLine',
                    title:"堆积面积图"
                };
                echartsAll.ec_ecsRender('heapAreaLineTest', apiCfg, obj);

                //标准面积图
                var obj = {
                    type: 'areaLine',
                    title:"标准面积图"
                };
                echartsAll.ec_ecsRender('areaLineTest', apiCfg, obj);

                //大小值折线图
                var obj = {
                    type: 'maxMinLine',
                    title:"大小值折线图"
                };
                echartsAll.ec_ecsRender('maxMinLineTest', apiCfg, obj);

                /**————————————————————————柱类图表————————————————————————————*/

                    //柱状图
                var obj = {
                        type: 'bar',
                        title:"柱状图"
                    };
                echartsAll.ec_ecsRender('barTest', apiCfg, obj);

                //多系列队列图
                var obj = {
                    type: 'manySeriesBar',
                    title:"多系列队列图"
                };
                echartsAll.ec_ecsRender('manySeriesBarTest', apiCfg, obj,{title:"多系列队列图"});

                //多系列彩虹柱形图
                var obj = {
                    type: 'manyColorBar',
                    title:"多系列彩虹柱形图"
                };
                echartsAll.ec_ecsRender('manyColorBarTest', apiCfg, obj,{title:"多系列彩虹柱形图"});


                //系列堆积图
                var obj = {
                    type: 'seriesHeapBar',
                    title:"系列堆积图"
                };
                echartsAll.ec_ecsRender('seriesHeapBarTest', apiCfg, obj,{title:"系列堆积图"});


                //条形堆积
                var obj = {
                    type: 'stackedBar',
                    title:"条形堆积"
                };
                echartsAll.ec_ecsRender('stackedBarTest', apiCfg, obj,{title:"条形堆积"});


                //百分比堆积图
                var obj = {
                    type: 'percentHeapBar',
                    title:"百分比堆积图"
                };
                echartsAll.ec_ecsRender('percentHeapBarTest', apiCfg, obj,{title:"百分比堆积图"});


                //搭配时间轴
                var obj = {
                    type: 'timeLineBar',
                    title:"搭配时间轴"
                };
                echartsAll.ec_ecsRender('timeLineBarTest', apiCfg, obj,{title:"配时间轴"});

                /**————————————————————————线柱组合图表————————————————————————————*/
                //线柱图
                var obj = {
                        type: 'lineAndBar',
                        title:"线柱图"
                    };
                echartsAll.ec_ecsRender('lineAndBarTest', apiCfg, obj,{title:"线柱图"});

                /**————————————————————————仪表类图表————————————————————————————*/
                    //仪表盘
                var obj = {
                        type: 'gauge',
                        title:"仪表盘"
                    };
                echartsAll.ec_ecsRender('gaugeTest', apiCfg, obj);


                //多个仪表盘
                var obj = {
                    title:"多个仪表盘",
                    type: 'moreGauge',

                };
                echartsAll.ec_ecsRender('moreGaugeTest',apiCfg, obj,2);


                 //正负轴交错
                var obj = {
                    title:"",
                    type: 'staggered',
                    specialAttr:{

                    }
                };
                echartsAll.ec_ecsRender('staggered',apiCfg,obj);//5s刷新一次


                //条形队列图
                var obj = {
                    type: 'barqueue',
                    title:"世界人口"
                };
                echartsAll.ec_ecsRender('barqueue',apiCfg,obj);


                //人口图(完成)
            var obj = {
                type: 'populationMap',
                title:"人口比例图",
                specialAttr:{
                    // calculable:"哈哈哈"
                    // series:[
                    //     {barWidth:15}
                    // ]
                }
            };
            echartsAll.ec_ecsRender('populationMap',apiCfg,obj);


             /**————————————————————————雷达图表————————————————————————————*/
             var apiCfg={
                 url:'http://localhost/html/0_0/json/tsconfig.json',
                 contentType:'Form',
                 data:{}
             };
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
        },
    };
    $(function () {
        if ($('#echartsTest').length > 0) {
            PageModule.init();
        }

    });

});