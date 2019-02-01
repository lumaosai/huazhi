
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        init: function(){
            require(['jqGrid_my'], function (jqGridAll) {
                console.log(Const.enterDate,4454545);
                var dateTime = Mom.getCookie(Const.enterDate)==""?Mom.shortDate:Mom.getCookie(Const.enterDate);
                $("#createDate").val(dateTime); //设置日期，如果cookie中有就存cookie的日期，没有保存当前日期
                Mom.setCookie(Const.enterDate, dateTime); //保存日期到cookie
                PageModule.loadClass();
                var html = $('.table-content').html();
                window.pageLoad = function (result) {
                    var dataList = {
                        date:Mom.getCookie(Const.enterDate),//日期
                        shift:$("#shiftHidden").val(),//班次
                    }
                    Api.ajaxForm(Api.mtrl +"/api/mv/ShiftVal/shiftStatus", dataList, function (da) {
                        if(da.message == 1){//1标识已经提交，0标识未提交
                            $('#btn-submit').attr('disabled',true);
                            $('#btn-tiqu').attr('disabled',true);
                            $('#save-btn').attr('disabled',true);
                            $('#btn-relieve').attr('disabled',false);
                        }else{
                            $('#btn-relieve').attr('disabled',true);
                            $('#btn-submit').attr('disabled',false);
                            $('#btn-tiqu').attr('disabled',false);
                            $('#save-btn').attr('disabled',false);
                        }
                    });
                    Api.ajaxForm(Api.mtrl +"/api/mv/ShiftVal/queryCurrShift", dataList, function (res) {
                        if(res.success){
                            if(result){
                                res = result;
                            }
                            $('.treeTable-num').text(res.count);
                            var colModel1 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "nodeId","label": "nodeId","align": "center","hidden":true},
                                {"name": "mtrlId","label": "mtrlId","align": "center","hidden":true},
                                {"name": "f","label": "F","align": "center"},
                                {"name": "nodeName","label": "进出厂名称","align": "center"},
                                {"name": "mtrlName","label": "物料名称","align": "center"},
                                {"name": "shiftVal","label": "原始值","align": "center"},
                                {"name": "aditShiftVal","label": "确认量","align": "center","editable": true},
                                {"name": "tankMvVal","label": "罐量","align": "center"},
                                {"name": "instrMeasVal","label": "仪表量","align": "center"},
                                {"name": "slineMvVal","label": "料线量","align": "center"},
                                {"name": "measMvVal","label": "计量单量","align": "center"},
                                {"name": "wagonMeasVal","label": "槽车量","align": "center"},
                                {"name": "tracMeasVal","label": "轨道衡量","align": "center"},
                                {"name": "truckMeasVal","label": "汽车衡量","align": "center"},
                                {"name": "formualVal","label": "计量公式量","align": "center"},
                                {"name": "createBy","label": "录入人","align": "center"},
                                {"name": "createDate","label": "录入时间","align": "center"},
                                {"name": "submitStatus","label": "提交状态","align": "center",formatter:function(cellvalue, options, rowObject){
                                    if(rowObject.submitStatus == ''){
                                        return "";
                                    }else if(rowObject.submitStatus == 1){
                                        return "已提交";
                                    }else if(rowObject.submitStatus == 0){
                                        return "未提交";
                                    }
                                }},
                            ];
                            var lastsel;
                            var optionsPot = {   //主表
                                colModel: colModel1,
                                data: res.rows,
                                cellEdit: false,
                                onSelectRow: function (id,status) {
                                    if (id && id != lastsel) {
                                        $('#treeTable').saveRow(lastsel, false, 'clientArray');
                                        $('#treeTable').restoreRow(lastsel);
                                        $('#treeTable').editRow(id, false);
                                        lastsel = id;
                                    }
                                },
                            };
                            var colModel2 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "mtrlMvOprtType","label": "类型","align": "center","title":false},
                                {"name": "dfName","label": "计量名称","align": "center"},
                                {"name": "aftPreDiff","label": "前后差值","align": "center"},
                                {"name": "preCont","label": "前量","align": "center"},
                                {"name": "preTime","label": "前量时间","align": "center"},
                                {"name": "aftCont","label": "后量","align": "center"},
                                {"name": "aftTime","label": "后量时间","align": "center"}
                            ];
                            var optionsMMove = {   //子表
                                colModel: colModel2,
                                rownumbers: true,
                            };
                            var config = {
                                url: Api.mtrl+'/api/mv/ShiftVal/queryDetail',
                                otherId:'nodeId',
                                dataParams:{
                                    date:Mom.getCookie(Const.enterDate),//日期
                                    shift:$("#shiftHidden").val(),//班次
                                },
                                contentType:'form',
                            };
                            var subtable =[];
                            jqGridAll.jG_jqGridTableLevel('#treeTable',optionsPot,optionsMMove,config,subtable);
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                };
                 // 日期改变
                $('#createDate').change(function(){
                    var startTime = $(this).val().split('-').join('');
                        endTime = Mom.shortDate.split('-').join('');
                    if(startTime > endTime){
                        Mom.layMsg('不允许选择未来班次');
                        $('#createDate').val(dataTime);
                        return;
                    }
                })
                //查询按钮
                $('#btn-search').unbind('click').click(function(){
                    $('.table-content').empty().html(html);
                    // 保存日期和班次
                    Mom.setCookie(Const.enterDate, $('#createDate').val());
                    $("#shiftHidden").val($('#shift').val());  //设置隐藏班次
                    pageLoad();
                });
                //提取班量数据
                $('#btn-tiqu').unbind('click').click(function(){
                    var dataList = {
                        date:Mom.getCookie(Const.enterDate),//日期
                        shift:$("#shiftHidden").val(),//班次
                    }
                    Api.ajaxForm(Api.mtrl+"/api/mv/ShiftVal/extract", dataList, function (res) {
                        if(res.success){
                            $('.table-content').empty().html(html);
                            pageLoad(res);
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                });
                //保存
                $('#save-btn').unbind('click').click(function () {
                    if($('#treeTable tbody tr').length == 1 ){
                        Mom.layMsg('无数据可以保存');
                        return;
                    }
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                        $(this).remove();
                    });
                    var data = $('#treeTable').getRowData();
                    var dataList = {
                        date:Mom.getCookie(Const.enterDate),//日期
                        shift:$("#shiftHidden").val(),//班次
                        shiftVal:JSON.stringify(data)
                    }
                    Api.ajaxForm(Api.mtrl+"/api/mv/ShiftVal/save", dataList, function (res){
                        if(res.success){
                            Mom.setCookie(Const.enterDate,$('#createDate').val()); //保存日期到cookie
                           Mom.layMsg(res.message);
                            $('.table-content').empty().html(html);
                            pageLoad();
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                });
                //提交
                $('#btn-submit').unbind('click').click(function(){
                    if($('#treeTable tbody tr').length == 1 ){
                        Mom.layMsg('无数据可以提交');
                        return;
                    }
                    var dataList = {
                        date:Mom.getCookie(Const.enterDate),//日期
                        shift:$("#shiftHidden").val(),//班次
                    }
                    Api.ajaxForm(Api.mtrl+"/api/mv/ShiftVal/submitShift", dataList, function (res){
                        if(res.success){
                            $('.table-content').empty().html(html);
                            pageLoad();
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                });
                //解除提交
                $('#btn-relieve').unbind('click').click(function(){
                    if($('#treeTable tbody tr').length == 1 ){
                        Mom.layMsg('无数据可以解除提交');
                        return;
                    }
                    var dataList = {
                        date:Mom.getCookie(Const.enterDate),//日期
                        shift:$("#shiftHidden").val(),//班次
                    }
                    Api.ajaxForm(Api.mtrl+"/api/mv/ShiftVal/relieve", dataList, function (res){
                        if(res.success){
                            $('.table-content').empty().html(html);
                            pageLoad();
                        }else{
                            Mom.layMsg(res.message);
                        }
                    });
                });
            });



        },
        loadClass:function () {
            var url_ = Api.aps+'/api/ctrl/Shift/list';
            Api.ajaxJson(url_, {}, function(result){
                if(result.success){
                    var rows = result.rows;
                    var options = new Array();
                    $(rows).each(function(i,o){
                        var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                        var value = o['startTime']+'-'+o['endTime'];
                        options.push({'value':value, 'label':label});
                    });
                    Bus.appendOptions($('#shift'), options);
                    $("#shiftHidden").val($('#shift').val());  //设置隐藏班次
                    pageLoad();
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },

    }
    $(function () {
        if ($('#entryClasses').length > 0) {
            PageModule.init();
        }
    });
})
