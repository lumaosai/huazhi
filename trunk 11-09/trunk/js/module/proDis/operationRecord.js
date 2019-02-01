require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            var userId = Mom.getCookie("loginUserid");
            //获取班次数据
            loadShift();
            //获取班组数据
            Bus.createSelect(Api.aps+'/api/aps/Groups/list',$('#team'),'id','name');
            //获取工序数据
            Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#process'),'value','name');
            //Page插件
            require(['Page'],function(){
                window.pageLoad = function () {
                    var data = {
                        process:$("#process").val()==""?"":$("#process option:selected").text(),//工序
                        groupName:$("#team").val()==""?"":$("#team option:selected").text(), //班组
                        shift:{                                        //班次
                            id:$("#time").val()==""?"":$("#time option:selected").val()
                        },
                        startOverDate:$("#startDateParam").val(),   //开始时间
                        endOverDate:$("#endDateParam").val(),//结束时间
                        bigKind:"CZ"
                    };
                    new Page().init(Api.aps+"/api/ctrl/ShiftMain/page",data,true,function (tableDta, result) {
                        createTable(tableDta, result);
                    })
                };
                pageLoad();
            });

            //获取班次数据
            function loadShift(){
                var url_ = Api.aps+'/api/ctrl/Shift/list';
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
                        {"data": "reciveDate", 'sClass': "center","width":"15%"}
                    ]
                });
            }
            $('i').click(function(){
                return false
            })
        },


    };

    $(function(){
        //应用管理列表
        if($('#operationRecord').length > 0){
            PageModule.listInit();
        }

    });
});