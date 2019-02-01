define([
    'js/plugins/echarts/js/echarts.js',
    'js/plugins/echarts/js/macarons.js'
],function(echarts,theme){
    var ec = {
        chartBase64Img:null,
        isLoadImg:null,
        myChartArr:[],
        tileInterValArr:[],
        //echarts初始化
        init: function (id) {
            var index = -1; var existMyChart;
            for(var i =0;i<ec.myChartArr.length;i++){
                if(ec.myChartArr[i].id == id){
                    existMyChart = ec.myChartArr[i].myChart;
                    index = i;
                    break;
                }
            }
            if(existMyChart != null && existMyChart != "" && existMyChart != undefined) {
                existMyChart.dispose();
                existMyChart = null;

            }
            if($("#"+id)){
                existMyChart = echarts.init(document.getElementById(id),theme);
                if(index>-1){
                    ec.myChartArr[index] = {id:id, myChart:existMyChart};
                }else{
                    ec.myChartArr.push({id:id, myChart:existMyChart});
                }
            }
            return existMyChart;
        },
        //开启磁贴定时刷新
        startTileInterval:function(id, timer, execFn){
            if(timer && timer>0){
                var tileInterv = setInterval(function () {
                    if(execFn){
                        execFn();
                    }
                },timer*1000);
                ec.tileInterValArr.push({id:id, tileInterv: tileInterv});
            }
        },
        //关闭磁贴定时刷新
        clearTileInterval:function(id){
            $(ec.tileInterValArr).each(function(i,o){
                if(o.id == id){
                    clearInterval(o.tileInterv);
                    ec.tileInterValArr.splice(i,1);
                }
            });
        },

        //数据格式化
        dataFormate: {
            formateNoGroupData: function (data) { //data的格式如上的Result1，这种格式的数据，多用于饼图、单一的柱形图的数据源
                var categories = [];
                var datas = [];
                var chartName;

                for (var i = 0; i < data.length; i++) {
                    chartName =  data[i].name + data[i].group;
                    categories.push(chartName || "");
                    datas.push({
                        name: chartName,
                        value: data[i].value || 0
                    });
                }

                return {
                    category: categories,
                    data: datas
                };
            },

            formateGroupData: function (data, type, is_stack) { //data的格式如上的Result2，type为要渲染的图表类型：可以为line，bar，is_stack表示为是否是堆积图，这种格式的数据多用于展示多条折线图、分组的柱图
                var chart_type = 'line';
                if (type) {
                    chart_type = type || 'line'
                };
                var xAxis = [];
                var group = [];
                var series = [];
                for (var i = 0; data && i < data.length; i++) {
                    for (var j = 0; j < xAxis.length && xAxis[j] != data[i].name; j++);

                    if (j == xAxis.length)

                        xAxis.push(data[i].name);

                    for (var k = 0; k < group.length && group[k] != data[i].group; k++);

                    if (k == group.length)

                        group.push(data[i].group);

                }

                for (var i = 0; i < group.length; i++) {

                    var temp = [];

                    for (var j = 0; j < data.length; j++) {

                        if (group[i] == data[j].group) {

                            if (type == "map")

                                temp.push({
                                    name: data[j].name,
                                    value: data[i].value
                                });

                            else
                                temp.push(data[j].value);

                        }

                    }

                    switch (type) {
                        case 'bar':
                            var series_temp = {
                                name: group[i],
                                data: temp,
                                type: chart_type
                            };

                            if (is_stack)
                                series_temp = $.extend({}, {
                                    stack: 'stack'
                                }, series_temp);

                            break;

                        case 'map':
                            var series_temp = {
                                name: group[i],
                                type: chart_type,
                                mapType: 'china',
                                selectedMode: 'single',

                                itemStyle: {

                                    normal: {
                                        label: {
                                            show: true
                                        }
                                    },

                                    emphasis: {
                                        label: {
                                            show: true
                                        }
                                    }

                                },

                                data: temp

                            };

                            break;

                        case 'line':

                            var series_temp = {
                                name: group[i],
                                data: temp,
                                type: chart_type
                            };

                            if (is_stack)

                                series_temp = $.extend({}, {
                                    stack: 'stack'
                                }, series_temp);

                            break;

                        default:

                            var series_temp = {
                                name: group[i],
                                data: temp,
                                type: chart_type
                            };

                    }

                    series.push(series_temp);

                }

                return {
                    category: group,
                    xAxis: xAxis,
                    series: series
                };

            }

        },
        //配置项模板，初始化常用的图表类型
        optionTemplates: {
            commonOption: { //通用的图表基本配置

            },
            commonLineOption: { //通用的折线图表的基本配置

            },
            //饼图
            pie: function (data, tile) { //data:数据格式：{name：xxx,value:xxx}...
                var pie_datas = ec.dataFormate.formateNoGroupData(data);
                var option = {
                    title: {
                        //text: tile.title
                    },
                    animation:false,
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b} : {c} ({d}/%)',
                        show: true
                    },
                    legend: {
                        orient: 'horizontal',
                        x: 'left',
                        data: pie_datas.category,
                        right:0,
                    },
                    series: [
                        {
                            name: tile.title || "",
                            type: 'pie',
                            radius: '50%',
                            center: ['50%', '50%'],
                            hoverAnimation:true,
                            labelLine:{
                                length:-5
                            },
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            data: pie_datas.data
                        }
                    ]
                };

                return $.extend({}, ec.optionTemplates.commonOption, option);

            },
            //折线图
            lines: function (data, tile) { //data:数据格式：{name：xxx,group:xxx,value:xxx}...
                var stackline_datas = ec.dataFormate.formateGroupData(data, 'line');
                var option = {
                    title: {
                        // text: tile.title
                    },
                    legend: {
                        data: stackline_datas.category,
                        right:0,
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line'
                        }
                    },
                    xAxis: [{
                        type: 'category', //X轴均为category，Y轴均为value
                        data: stackline_datas.xAxis,
                        boundaryGap: false //数值轴两端的空白策略
                    }],
                    yAxis: [{
                        name: tile.name || '',
                        type: 'value',
                        splitArea: {
                            show: true
                        }
                    }],
                    series: stackline_datas.series
                };

                return $.extend({}, ec.optionTemplates.commonLineOption, option);

            },
            //柱状图
            bars: function (data, tile) { //data:数据格式：{name：xxx,group:xxx,value:xxx}...
                var bars_dates = ec.dataFormate.formateGroupData(data, 'bar');
                var option = {
                    title: {
                        //text: tile.title
                    },
                    legend: {
                        data: bars_dates.category,
                        right:0
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    xAxis: [{
                        type: 'category',
                        data: bars_dates.xAxis,
                        axisLabel: {
                            show: true,
                            interval: 'auto',
                            rotate: 0,
                            margion: 8
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        name: tile.name || '',
                        splitArea: {
                            show: true
                        }
                    }],
                    series: bars_dates.series
                };

                return $.extend({}, ec.optionTemplates.commonLineOption, option);

            },
            //仪表盘
            gauge: function (data,tile) {
                var name;
                if(data.length > 0 && data[0].group){
                    name = data[0].group ? data[0].group : '';
                }else{
                    name = '';
                }
                var gauge_datas = ec.dataFormate.formateNoGroupData(data);
                var option = {
                    title: {
                        //text: tile.title
                    },
                    tooltip: {
                        formatter: "{a} <br/>{b} : {c}%"
                    },
                    series: [{
                        name: name,
                        type: 'gauge',
                        detail: {
                            formatter: '{value}%'
                        },
                        data: gauge_datas.data
                    }]
                };

                return option;
            },
            //漏斗图
            funnel: function (data,tile) {
                var name = data[0].group;
                var funnel_datas = ec.dataFormate.formateNoGroupData(data);
                var option = {
                    title: {
                        text: tile.title
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c}%"
                    },
                    legend: {
                        data: funnel_datas.category
                    },
                    calculable: true,
                    series: [{
                        name: name,
                        type: 'funnel',
                        left: '10%',
                        bottom: 60,
                        width: '80%',
                        min: 0,
                        max: 100,
                        minSize: '0%',
                        maxSize: '100%',
                        sort: 'descending',
                        gap: 2,
                        label: {
                            normal: {
                                show: true,
                                position: 'inside'
                            },
                            emphasis: {
                                textStyle: {
                                    fontSize: 20
                                }
                            }
                        },
                        data: funnel_datas.data
                    }]
                };

                return option;

            }
        },
        //生成echarts
        render: {
            pie: function (data, container, tile) {
                var myChart = ec.init(container);
                var option = ec.optionTemplates.pie(data, tile);
                myChart.setOption(option);

            },
            bar: function (data, container, tile) {
                var myChart = ec.init(container);
                if(myChart){
                    var option = ec.optionTemplates.bars(data, tile);
                    myChart.setOption(option);
                }
            },
            line: function (data, container, tile) {
                var myChart = ec.init(container);
                var option = ec.optionTemplates.lines(data, tile);
                myChart.setOption(option);

            },
            gauge: function (data, container, tile) {
                var myChart = ec.init(container);
                var option = ec.optionTemplates.gauge(data, tile);
                myChart.setOption(option);
                if (ec.isLoadImg == 1) {
                    ec.chartBase64Img = myChart.getDataURL();
                }
            },
            funnel: function (data, container, tile) {
                var myChart = ec.init(container);
                var option = ec.optionTemplates.funnel(data, tile);
                myChart.setOption(option);
                if (ec.isLoadImg == 1) {
                    ec.chartBase64Img = myChart.getDataURL();
                }
            }
        }

    };
    return {
        startTileInterval:ec.startTileInterval,
        clearTileInterval:ec.clearTileInterval,
        line:ec.render.line,
        bar:ec.render.bar,
        pie:ec.render.pie,
        gauge:ec.render.gauge,

    }
});
