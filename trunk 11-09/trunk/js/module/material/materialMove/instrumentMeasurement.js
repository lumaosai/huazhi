require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        init:function () {
            PageModule.loadshift();
            $("#measureDate").val(Mom.shortDate);
            var templateArr = [];
            var dataTable = [];
            window.pageLoad = function () {
                var measureDate = $("#measureDate").val();
                var shift = $("#shift option:selected").val();
                var begShiftDate = measureDate+" "+shift.slice(0,8);
                var endShiftDate = measureDate+" "+shift.slice(9,17);
                var data = {
                    begShiftDate:begShiftDate,
                    endShiftDate:endShiftDate,
                };
                Api.ajaxForm(Api.mtrl+"/api/mv/SmtinoutInstrMeas/queryInoutputInstrList",data,function (result) {   //列表数据
                    if(result.success){
                        dataTable = result.rows;
                        PageModule.createTable(dataTable,false);
                    }else{
                        Mom.layMsg(result.message)
                    }
                });
            };
            $("#searchLoad").unbind("click").on("click",function () {
                window.pageLoad();
            });
            //删除班次记录
            $("#delete-btn").unbind("click").on("click",function () {
                var data =$("#treeTable").jqGrid("getRowData");
                var ids = [];
                var str = "";
                for(var i=0;i<data.length;i++){
                    ids.push(data[i].id);
                };
                for(var j=0;j<ids.length;j++){
                    str += "," + ids[j];
                }
                if($("#measureDate").val() == ""){
                    Mom.layMsg("请选择日期");
                }else if( $("#shift option:selected").val() == ""){
                    Mom.layMsg("请选择班次");
                }else{
                    var dataTime = $("#measureDate").val();
                    var shift = $("#shift option:selected").val();
                    var data = {
                        ids: str.substr(1),
                        begShiftDate:dataTime+" "+shift.slice(0,8),
                        endShiftDate:dataTime+" "+shift.slice(9,17)
                    };
                    Api.ajaxForm(Api.mtrl+"/api/mv/SmtinoutInstrMeas/delete",data,function (result) {
                        if(result.success){
                            Mom.layMsg("删除成功");
                            pageLoad();
                        }else{
                            Mom.layMsg(result.message);
                        }
                    })
                }
            });
            //自动采集
            $("#collect-btn").unbind("click").on("click",function () {
                var rowData =$("#treeTable").jqGrid("getRowData");
                var dataTime = "";
                var tagInfo = [];
                dataTime = rowData[0].tagDate;
                for(var i=0;i<rowData.length;i++){
                        var tagInfoObj = {};
                        tagInfoObj.tagName = rowData[i].tag;
                        tagInfoObj.timeStep ="3600";
                        tagInfo.push(tagInfoObj);
                };
                var data = {
                    cltTime:dataTime,
                    tagInfo:JSON.stringify(tagInfo)
                };
                Api.ajaxForm(Api.pi+"/api/PiApi/tagNearLocal",data,function(result) {
                        if(result.success){
                            var tableArr = [];
                            Mom.layMsg("采集成功");
                            var instrument = {};
                            for(var i=0;i<result.rows.length;i++){
                                if(result.rows[i].tagName == rowData[i].tag){
                                    rowData[i].tag = result.rows[i].val
                                }
                            }
                            PageModule.createTable(rowData);
                        }else{
                            Mom.layMsg(result.message)
                        }
                })
            });
            //保存
            $("#save-btn").unbind("click").on("click",function () {
                var dataTime = $("#measureDate").val();
                var shift = $("#shift option:selected").val();
                var begShiftDate = dataTime+" "+shift.slice(0,8);
                var endShiftDate = dataTime+" "+shift.slice(9,17);
                var rowData =  $("#treeTable").jqGrid('getRowData');
                for(var i=0;i<rowData.length;i++){
                    rowData[i].begShiftDate = begShiftDate;
                    rowData[i].endShiftDate = endShiftDate;
                    delete  rowData[i].button;
                }
                var data = {
                    instrMeas:JSON.stringify(rowData)
                };
                Api.ajaxForm(Api.mtrl+"/api/mv/SmtinoutInstrMeas/save",data,function (result) {
                    if(result.success){
                        Mom.layMsg("操作成功");
                    }else{
                        Mom.layMsg(result.message);
                    }
                })
            })
        },
        loadshift:function () {
            var url_ = Api.aps+'/api/ctrl/Shift/list';
            Api.ajaxJson(url_, {}, function(result){
                if(result.success){
                    var rows = result.rows;
                    var options = new Array();
                    $(rows).each(function(i,o){
                        var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                        var value = o['startTime']+'-'+o['endTime'];
                        if(o['id'] != "4"){
                            options.push({'value':value, 'label':label});
                        }
                    });
                    Bus.appendOptions($('#shift'), options);
                    pageLoad();
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },
        createTable:function (dataTable) {
            require(['jqGrid_my'], function (jqGridAll) {
                var quatRankType = [];
                Api.ajaxForm(Api.admin+"/api/sys/SysDict/type/QUAT_RANK_TYPE",{},function (result) {
                    if(result.success){
                        quatRankType = result.rows;
                    }
                })
                //主表
                var colModel = [
                    {"name": "id","id": "id", "align": "center","hidden":true},
                    {"name": "saveFlag","label": "F", "align": "center"},
                    {"name": "instrName","label": "仪表名称", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            if(rowObject.instrument){
                                return rowObject.instrument.instrName;
                            }else{
                                return rowObject.instrName;
                            }
                        }
                    },
                    {"name": "tagDate","label": "采集时间", "align": "center"},
                    {"name": "frontVal","label": "前读数", "align": "center"},
                    {"name": "conPreRead","label": "C", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            return "<i></i>";
                        }
                    },
                    {"name": "rtdbVal","label": "RTDB读数", "align": "center"},
                    {"name": "conPreRead","label": "C", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            return "<i></i>";
                        }
                    },
                    {"name": "behindVal","label": "后读数", "align": "center"},
                    {"name": "pureVal","label": "净读数", "align": "center"},
                    {"name": "resetFrtVal","label": "回零/开工前值", "align": "center"},
                    {"name": "resetBhdVal","label": "回零/开工后值", "align": "center"},
                    {"name": "coefficient","label": "系数", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            if(rowObject.instrument){
                                return rowObject.instrument.coefficient;
                            }else{
                                return rowObject.coefficient;
                            }
                        }
                    },
                    {"name": "realFlagName","label": "虚实标识", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            if(rowObject.instrument){
                                return rowObject.instrument.realFlagName;
                            }else{
                                return rowObject.realFlagName;
                            }
                        }
                    },
                    {"name": "accuInstrFlagName","label": "累计表标示", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            if(rowObject.instrument){
                                return rowObject.instrument.accuInstrFlagName;
                            }else{
                                return rowObject.accuInstrFlagName;
                            }
                        }
                    },
                    {"name": "tag","label": "工位号", "align": "center",
                        formatter:function (cellvalue, options, rowObject) {
                            if(rowObject.instrument){
                                return rowObject.instrument.tag;
                            }else{
                                return rowObject.tag;
                            }
                        }
                    },
                    {"name": "submitDate","label": "提交时间", "align": "center"},
                ];
                //子表
                var colMode2 = [
                    { "name": "id", "label": "id", "align": "center","hidden":true},
                    { "name": "mtrlId", "label": "mtrlId", "align": "center","hidden":true},
                    { "name": "nodeId", "label": "nodeId", "align": "center","hidden":true},
                    {
                        "name": "saveFlag",
                        "label": "saveFlag",
                        "align": "center",
                        "hidden":true
                    },
                    { "name": "saveFlag", "label": "F", "align": "center"},
                    {"name": "","label": "进出厂点名称", "align": "center",
                        formatter: function (cellvalue, options, rowObject) {
                            return rowObject.node.nodename;
                        }
                    },
                    {"name": "", "label": "物料", "align": "center",
                        formatter: function (cellvalue, options, rowObject) {
                            return rowObject.mtrl.mtrlName;
                        }
                    },
                    {
                        "name": "quatRankType",
                        "label": "等级质量",
                        "align": "center",
                        formatter: function (cellvalue, options, rowObject) {
                            return "<select id='quatRankType'></select>";
                        }
                    }
                ];
                var config = {      //获取子集的时候需要的参数以及接口配置
                    url:Api.mtrl+"/api/mv/SmtinoutInstrMeas/queryInoutPutByInstrMeasId",
                    dataParams: {
                        id:"id"
                    },
                    contentType:"Form"
                };
                var  settings1 = {   //主表配置
                    data:dataTable,
                    colModel:colModel
                };
                var settings2={
                    colModel:colMode2
                }
                var subtable = [];
                jqGridAll.jG_jqGridTableLevel("#treeTable",settings1,settings2,config,subtable,quatRankTypeSelect);
                jqGridAll.jG_loadTable("#treeTable",dataTable);
                function quatRankTypeSelect() {
                    Bus.appendOptionsValue('#quatRankType',quatRankType,'value','label');
                    $("#quatRankType").unbind("change").on("change",function () {
                        var id = $(this).parent('td').parent('tr').find('td').eq(0).text();
                        var mtrlId = $(this).parent('td').parent('tr').find('td').eq(1).text();
                        var nodeId = $(this).parent('td').parent('tr').find('td').eq(2).text();
                        var data = {
                            id:id,
                            quatRankType:$(this).val(),
                            mtrlId:mtrlId,
                            nodeId:nodeId,
                        }
                        Api.ajaxJson(Api.mtrl+"/api/mv/SmtinoutInstrMeas/update",JSON.stringify(data),function (result) {
                            console.log(result);

                        })
                    })
                }
            });

        }
    }
    $(function () {
        if($("#instrumentMeasurement").length>0){
            PageModule.init();
        }
    })
  })