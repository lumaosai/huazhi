require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            //获取班次数据
            loadShift();
            //获取班组数据
            loadGroups();
            //获取工序数据
            loadProcess();
            //Page插件
            require(['Page'],function(){
                var page = new Page();
                window.pageLoad = function () {
                    var time = $('#time').val()==""?"":$("#time option:selected").text();
                    var temp,startTime,endTime;
                    var exctTime = $("#startDateParam").val();
                    if(time!=""){
                        temp = time.split("(")[1].split(")")[0];
                        startTime = temp.split("-")[0];
                        endTime = temp.split("-")[1];
                        startTime = exctTime +" "+ startTime;
                        endTime = exctTime + " "+endTime;
                    }else{
                        startTime = exctTime;
                        endTime = "";
                    }
                    var data = {
                        process:$("#process").val()==""?"":$("#process option:selected").text(),//工序
                        groupName:$("#team").val()==""?"":$("#team option:selected").text(), //班组
                        shift:{                                        //班次
                            id:$("#time").val()==""?"":$("#time option:selected").val()
                        },
                        startOverDate:$("#startDateParam").val(),   //开始时间
                        bigKind:"DD"
                    };
                    page.init(Api.aps+"/api/ctrl/ShiftMain/page",data,true,function (tableDta) {
                        createTable(tableDta);
                        $('.btn-check').click(function(){
                            var id = $(this).attr('id');
                            Bus.openDialog('查看','proDis/recordCheck.html?id='+id+'&api=view','800px','500px');
                        });
                    })
                };
                pageLoad();
            });

            require(['datetimepicker'], function () {
                //时间选择插件(获取年月日日期)
                $("#startDateParam").datetimepicker({
                    format: "yyyy-mm-dd",   //保留到日
                    language:'zh-CN',          //中文显示
                    minView: "month",      //月视图
                    todayBtn: true,       //切换到今天
                    clearBtn: true,       //清除全部
                    autoclose:true, //选择时间后自动隐藏
                });
            });

            //获取工序数据
            function loadProcess(){
                var userId = Mom.getCookie("loginUserid");
                Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#process'), 'value', 'name');
            }
            //获取班次数据
            function loadShift(){
                var url_ =Api.aps+'/api/ctrl/Shift/list';
                Api.ajaxJson(url_, {}, function(result){
                    if(result.success){
                        var rows = result.rows;
                        var options = new Array();
                        $(rows).each(function(i,o){
                            var label = o['name']+'('+o['startTime']+'-'+o['endTime']+')';
                            options.push({'value':o['id'], 'label':label});
                        });
                        Bus.appendOptions($('#time'), options);
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            }
            //获取班组数据
            function loadGroups(){
                Bus.createSelect(Api.aps+'/api/aps/Groups/list',$('#team'), 'id', 'name');
            }
            //创建table
            function createTable(data) {
                $('#treeTable').dataTable({
                    "data": data,
                    "aoColumns": [
                        {"data": "process", 'sClass': " center authName","width":"20%"},
                        {"data": "shift.name", 'sClass': "center ","width":"15%"},
                        {"data": "groupName", 'sClass': "center","width":"15%"},
                        {"data": "overUserName", 'sClass': "center","width":"10%"},
                        {"data": "reciveUserName", 'sClass': "center","width":"10%"},
                        {"data": "overDate", 'sClass': "center","width":"15%"},
                        {"data": "reciveDate", 'sClass': "center","width":"15%"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs btn-check'" + " id="+ row.id + " ><i class='fa fa-search-plus'></i>查看</a >";

                            }
                        }]
                });
            }
        },

        view: function(){
            var id = Mom.getUrlParam('id');
            var url = Api.aps+"/api/ctrl/ShiftMain/view/"+ id;
            Api.ajaxJson(url,{}, function (result) {
                if(result.success){
                    if(result.shiftLog.length === 0){
                        $('p').css('display','block');
                    }else{
                        var data1 ={
                            list:result.shiftLog
                        }
                        require(['jsrender'],function(){
                            jsRenderTpl = $.templates('#j-specCard');
                            finalTpl = jsRenderTpl(data1);
                            $('#tab').html(finalTpl);
                        });
                    }
                }
            });
        }
    };

    $(function(){
        //应用管理列表
        if($('#record').length > 0){
            PageModule.listInit();
        }
        //查看
        else if($('#recordCheck').length > 0){
            PageModule.view();
        }
    });
});