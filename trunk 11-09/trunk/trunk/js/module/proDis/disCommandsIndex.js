require(['/js/zlib/app.js'], function(App) {
    //引入用户登录校验
    require(['checkUser']);

    var PageModule = {
        listInit: function(){
            var userId = Mom.getCookie("loginUserid");
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveLeaveyType',$('#grade'));
            Bus.createSelect(Api.admin+'/api/sys/SysAuthProperty/getAttributeValue/'+userId+'/GXJQ/syswp',$('#proc'),'value','name');
            Bus.createSelect(Api.admin+'/api/sys/SysDict/type/directiveCassifyType',$('#kind'));
            //Page插件
            require(['Page'],function(){
                $("#btn-search").click(function () {
                    var procValue=$('#proc').val(), gradeValue=$('#grade').val(),kindValue=$('#kind').val(),contentParme=$('#contentParam').val();
                    var data={
                        "proc":procValue=="请选择"?"":procValue,
                        "grade":gradeValue=="请选择"?"":gradeValue,
                        "kind":kindValue=="请选择"?"":kindValue,
                        "contentParam":contentParme=="请选择"?"":contentParme
                    };
                    new Page().init(Api.aps+"/api/ctrl/BaseDirective/page",data,true,function(tableData, result){
                        renderTableData(tableData, result);
                    })
                });
                $("#btn-search").trigger('click');
            });
            //渲染表格
            function renderTableData(data) {
                //↓接口到后修改↓
                var datas=data;
                var tableStr = "";
                for (var i = 0; i < datas.length; i++) {
                    tableStr += "<tr class='center' >"
                        + "<td class='i-Checks center' id='" + datas[i].id + "'>" + datas[i].proc + "</td>"
                        + "<td class='center'>"+data[i].content+"</td>"
                        + "<td class='center'>" + data[i].gradeLabel+"</td>"
                        + "<td>" + datas[i].kind + "</td>"
                        + "<td>" + datas[i].createDate + "</td>"
                        + "</tr>";
                }
                if (tableStr.length == 0) {
                    var len = $("#treeTable thead tr").children("th").length;
                    tableStr = "<tr style='text-align: center'><td colspan='" + len + "'><font color='#cd0a0a'>暂无记录，请重新选择查询条件</font></td></tr>";
                }
                $('#treeTableBody').html(tableStr);
            }
        },

    };

    $(function(){
        //调度指令列表
        if($('#disCommandsIndex').length > 0){
            PageModule.listInit();
        }

    });
});