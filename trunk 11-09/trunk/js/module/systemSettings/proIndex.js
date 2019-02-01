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
                        nameParam: $("#proName").val(),
                        codeParam: $('#proCode').val(),
                        // desParam: $('#proDescription').val(),
                        enable: $('#enable').val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/SysAuthProperty/page",data,true,function(tableData, result){
                        dataout(tableData);
                        $('tbody tr').attr('class','center');
                        $('.btn-check').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看属性信息', './systemSettings/proCheckView.html?id=' + id+'&api=view', '800px', '416px')
                        });
                        $('.btn-change').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改属性', './systemSettings/proCheckView.html?id=' + id+'&api=form', '800px', '416px')
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该属性吗', Api.admin+'/api/sys/SysAuthProperty/delete',{ids:id});
                        });
                        $('.btn-mainProVal').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('维护属性值', './systemSettings/proPreserveValue.html?id=' + id,'950px','520px');
                        });

                    });
                };
                //点击重置按钮
                $("#reset-btn").click(function () {
                    Mom.clearForm('.toolbar-form');
                    page.reset(["nameParam","codeParam","enable"]);
                });
                pageLoad();
            });
            //   ajax请求渲染datatable数据
            function dataout(data) {
                $('#treeTable').dataTable({
                    "data": data,
                    "columns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": null, "width": "5%"},
                        {"data": "name", "width": "12%",'sClass':"center"},
                        {"data": "code", "width": "12%",'sClass':"center"},
                        {
                            "data": null, "width": "10%",
                            "render":function (data, type, row, meta) {
                                if(data.tierType==0){
                                    return data = '单一维度'
                                }else{
                                    return data = '层级维度'
                                }
                            }
                        },
                        {
                            "data": null, "width": "10%",
                            "render":function (data) {
                                if(data.isTwins==0){
                                    return data = '否'
                                }else{
                                    return data = '是'
                                }
                            }
                        },
                        {
                            "data": null, "width": "10%",
                            "render":function (data) {
                                if(data.isLeafCheck==0){
                                    return data = '否'
                                }else{
                                    return data = '是'
                                }
                            }
                        },
                        {
                            "data": null, "width": "10%",
                            "render":function (data) {
                                if(data.enable==0){
                                    return data = '否'
                                }else{
                                    return data = '是'
                                }
                            }
                        },
                        {"data": "id", "orderable": false, "defaultContent": "", 'sClass':'autoWidth center',
                            "render": function (data, type, row, meta) {
                                return data = "<a class='btn btn-info btn-xs  btn-check'><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change'><i class='fa fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete'><i class='fa fa-trash' ></i>删除</a >"+
                                    "<a class='btn btn-primary btn-xs btn-mainProVal'><i class='fa icon-maintain' ></i>维护属性值</a >"
                            }
                        }],
                    "fnDrawCallback" : function(){
                        this.api().column(1).nodes().each(function(cell, i) {
                            cell.innerHTML =  i + 1;
                        });
                    }
                });
                renderIChecks();
            }
        },
        proCheckView: function(){
            var id = Mom.getUrlParam('id');
            var api= Mom.getUrlParam('api');
            $('#id').val(id);
            if (id) {
                /*此处后端接口  id为弹出窗口自带的id 通过浏览器方法传参得到*/
                var url = Api.admin+"/api/sys/SysAuthProperty/view/" + id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        Validator.renderData(result.SysAuthProperty, $('#inputForm'));
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
                $("#proCode").attr('readonly','readonly');
                if (api=='view'){
                    $("select").attr('disabled','disabled')
                }
            }
        }

    };

    $(function(){
        if($('#proIndex').length > 0){
            PageModule.listInit();
        }
        //查看和修改属性
        else if($('#proCheckView').length > 0){
            PageModule.proCheckView();
        }

    });

});