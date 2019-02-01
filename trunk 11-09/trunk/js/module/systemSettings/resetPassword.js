require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            //引入Page插件
            require(['Page'],function(){
                var page = new Page();
                window.pageLoad = function (){
                    var data = {
                        userName: $('#userName').val(),
                        userTel: $('#phoneNumber').val(),
                        status: $("#reset").val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/ResetPassword/resetPasswordList",data,true,function(tableData, result){
                        renderTableData(tableData);
                        //点击列表重置密码按钮提示
                        $(".btn-reset").click(function () {
                            var id = $(this).attr('id');
                            var data={ids:id};
                            Mom.layConfirm("确定要重置吗 ？",function(index){
                                Api.ajaxForm(Api.admin+'/api/sys/ResetPassword/resetPassword',data,function(result){
                                    if(result.success == true){
                                        Mom.layMsg('重置成功！');
                                        pageLoad();
                                    }
                                });
                                layer.close(index);
                            });
                        });
                    });
                };
                //点击重置按钮
                $('#reset-btn').click(function(){
                    Mom.clearForm(".toolbar-form");
                    page.reset(["userName","userTel","status"]);
                });
                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();
            });

            function renderTableData(tableData){
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 2, 6]}
                    ],
                    "data":tableData,
                    "aoColumns": [
                        {"data": "userName",'sClass':"center","width":"12%"},
                        {"data": "loginName",'sClass':"center","width":"12%"},
                        {"data": "userTel",'sClass':"center","width":"15%"},
                        {"data": "startTime",'sClass':"center","width":'15%'},
                        {"data": "applyTime",'sClass':"center","width":'25%',
                            "render": function (data, type, row, meta) {
                                return row.startTime+ ' 至  '+row.endTime;
                            }},
                        {"data": "status",'sClass':"center", "orderable": false, "defaultContent": "","width":'8%',
                            "render": function (data, type, row, meta) {
                                return "<span class='newspapers'>"+(row.status=='1'?'已重置':'待重置')+"</span>";
                            }
                        },
                        {"data": "resetTime",'sClass':"center","width":'15%',
                            "render": function(value, type, row, meta){
                                if(row.status=='1'){
                                    return value;
                                }
                                return '';
                            }
                        },
                        {"data": "", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                            "render": function (data, type, row, meta) {
                                var html = '';
                                if(row.status == "0"){
                                    var  html = "<a class='btn btn-info btn-xs btn-reset' id=" + row.id + "><i class='fa fa-refresh'></i>重置</a >"
                                }
                                return html;
                            }
                        }
                    ]
                });
                renderIChecks();
            }
        },

    };

    $(function(){
        //重置密码列表
        if($('#resetPassword').length > 0){
            PageModule.listInit();
        }
    });

});