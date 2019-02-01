
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        init: function(){
            require(['jqGrid_my'], function (jqGridAll) {
                var html = $('.table-content').html();
                Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/getTypeSel", {}, function (result) {
                    if(result.success){
                        Bus.appendOptionsValue('#transType',result.transTypeList,'value','label');
                        Bus.appendOptionsValue('#inoutType',result.inoutTypeList,'value','label');
                        var data = {
                            inoutput:{
                                inoutType:result.inoutTypeList[0].value
                            },
                            transType:result.transTypeList[0].value
                        };
                        Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/mtrlInoutputList", JSON.stringify(data), function (res) {
                            if(res.success){
                                appendOptions('#nodename',res.mtrlInoutPutList);
                                Bus.appendOptionsValue('#mtrlName',res.mtrlInoutPutList[0].mtrlList,'id','mtrlName');
                                function appendOptions(obj, options){
                                    if(options){
                                        $(options).each(function(i,o){
                                            $(obj).append("<option value='"+o.nodeInoutput.id+"'>"+o.nodeInoutput.nodename+"</option>");
                                        });
                                    }
                                };

                                var  dataList = {
                                    startDate:$("#startDate").val(),//开始日期
                                    endDate:$("#endDate").val(),//结束日期
                                    smtinoutBillStatus:$("#smtinoutBillStatus").val(),//状态
                                    groupBy:$("#groupBy").val(),//分组
                                    inoutput:{
                                        inoutType:result.inoutTypeList[0].value //进出
                                    },
                                    transType:result.transTypeList[0].value,//运输类型
                                    nodeId:res.mtrlInoutPutList[0].nodeInoutput.id,//进出厂点
                                    mtrlId:res.mtrlInoutPutList[0].mtrlList[0].id,//物料
                                }
                                pageLoad(dataList);
                            }

                        });
                    }

                });

                $('#inoutType,#transType').change(function(){
                    var data = {
                        inoutput:{
                            inoutType:$('#inoutType').val()
                        },
                        transType:$('#transType').val()
                    };
                    Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/mtrlInoutputList", JSON.stringify(data), function (res) {
                        $('#nodename').html('');
                        $('#mtrlName').html('');
                        appendOptions('#nodename',res.mtrlInoutPutList);
                        Bus.appendOptionsValue('#mtrlName',res.mtrlInoutPutList[0].mtrlList,'id','mtrlName');
                        function appendOptions(obj, options){
                            if(options){
                                $(options).each(function(i,o){
                                    $(obj).append("<option value='"+o.nodeInoutput.id+"'>"+o.nodeInoutput.nodename+"</option>");
                                });
                            }
                        }
                    });

                });
                $('#nodename').change(function(){
                    var data = {
                        inoutput:{
                            inoutType:$('#inoutType').val()
                        },
                        transType:$('#transType').val()
                    };
                    Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/mtrlInoutputList", JSON.stringify(data), function (res) {
                        res.mtrlInoutPutList.forEach(function(item,index){
                            if(item.nodeInoutput.id == $('#nodename').val()){
                                $('#mtrlName').html('');
                                appendOptionsMtrlList('#mtrlName',item.mtrlList);
                            }
                        });
                        function appendOptionsMtrlList(obj, options){
                            if(options){
                                $(options).each(function(i,o){
                                    $(obj).append("<option value='"+o.id+"'>"+o.mtrlName+"</option>");
                                });
                            }
                        }
                    });

                });
                window.pageLoad = function (data) {
                    var  dataList = {
                        startDate:$("#startDate").val(),//开始日期
                        endDate:$("#endDate").val(),//结束日期
                        smtinoutBillStatus:$("#smtinoutBillStatus").val(),//状态
                        inoutput:{
                            inoutType:$("#inoutType").val() //进出
                        },
                        transType:$("#transType").val(),//运输类型
                        groupBy:$("#groupBy").val(),//分组
                        nodeId:$("#nodename").val(),//进出厂点
                        mtrlId:$("#mtrlName").val(),//物料
                    }
                    if(data){
                        dataList = data;
                    }
                    Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutBill/instrList", JSON.stringify(dataList), function (res) {
                        if(res.success){
                            $('.treeTable-num').text(res.count);
                            var colModel1 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "title","label": "title","align": "center","hidden":true},
                                {"name": "conNo","label": "单据编号","align": "center"},
                                {"name": "begShiftDate","label": "业务开始班次时间","align": "center"},
                                {"name": "endShiftDate","label": "业务结束班次时间","align": "center"},
                                {"name": "nodename","label": "进出厂点","align": "center",formatter:function(cellvalue, options, rowObject){
                                    return rowObject.node.nodename;
                                }},
                                {"name": "mtrlName","label": "主物料名称","align": "center",formatter:function(cellvalue, options, rowObject){
                                    return rowObject.mtrl.mtrlName;
                                }},
                                {"name": "amount","label": "单据总量","align": "center"},
                                {"name": "conAmount","label": "确认总量","align": "center"},
                                {"name": "smtinoutBillStatus","label": "单据状态","align": "center"},
                                {"name": "crtBy","label": "创建人","align": "center"},
                                {"name": "createDate","label": "创建时间","align": "center"},
                                {"name": "clsBy","label": "关闭人","align": "center"},
                                {"name": "clsDate","label": "关闭时间","align": "center"},
                                {"name": "remark","label": "备注","align": "center"},
                            ];
                            var optionsPot = {   //主表
                                colModel: colModel1,
                                data: res.rows,
                                viewrecords: true,
                                grouping:true,
                                groupingView : {
                                    groupField : ['title'],
                                    groupColumnShow : [false],
                                    groupCollapse : true,
                                }
                            };
                            var colModel2 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "num","label": "表(车,罐)号","align": "center"},
                                {"name": "gaugeTypeLabel","label": "计量方式","align": "center"},
                                {"name": "frontVal","label": "前读数(空车)","align": "center"},
                                {"name": "behindVal","label": "后读数(重车)","align": "center"},
                                {"name": "mearVal","label": "计量量","align": "center"},
                                {"name": "conVal","label": "确认量","align": "center"},
                                {"name": "preReadDate","label": "前量(空车)时间","align": "center"},
                                {"name": "aftReadDate","label": "后量(重车)时间","align": "center"},
                                {"name": "begShiftDate","label": "班次开始时间","align": "center"},
                                {"name": "endShiftDate","label": "班次结束时间","align": "center"},
                                {"name": "measBy","label": "测量人","align": "center"},
                                {"name": "measDate","label": "计量时间","align": "center"},
                                {"name": "crtBy","label": "录入人","align": "center"},
                                {"name": "createDate","label": "录入时间","align": "center"},
                                {"name": "conBy","label": "确认人","align": "center"},
                                {"name": "remark","label": "备注","align": "center"},
                            ];
                            var optionsMMove = {   //子表
                                colModel: colModel2,
                                rownumbers: true,
                            };
                            var config = {
                                url: Api.mtrl+'/api/mv/SmtinoutBill/subList',
                                contentType:'form',
                            };
                            var subtable =[];
                            jqGridAll.jG_jqGridTableLevel('#treeTable',optionsPot,optionsMMove,config,subtable);
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                };
                //查询按钮
                $('#btn-search').unbind('click').click(function(){
                    if($('#endDate').val() != ''){
                        var startTime = $('#startDate').val().split('-').join(''),
                            endTime = $('#endDate').val().split('-').join('');
                        if(startTime > endTime){
                            Mom.layMsg('开始时间不允许比结束时间大');
                            return;
                        }
                    }
                    $('.table-content').empty().html(html);
                    pageLoad();
                });

            });
        },
    }
    $(function () {
        if ($('#meteringSearch').length > 0) {
            PageModule.init();
        }
    });
})
