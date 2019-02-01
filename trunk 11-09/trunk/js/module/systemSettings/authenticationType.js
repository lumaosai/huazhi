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
                        nameParam: $("#authNameParam").val(),
                        codeParam: $("#authCodeParam").val(),
                        enable:$("#authEnable").val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin+"/api/sys/SysAuthClass/authClassPage",data,true,function(tableData){
                        renderTableData(tableData);
                        $('.btn-check').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openDialog('查看鉴权类','systemSettings/authTypeInner.html?id='+id+'&api=view','692px','340px')
                        });
                        $('.btn-change').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改鉴权类','systemSettings/authTypeInner.html?id='+id,'692px','340px');
                        });
                        $('.btn-delete').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该鉴权类吗',Api.admin+'/api/sys/SysAuthClass/delete',{ids:id});
                        });
                        $('.btn-add').click(function(){
                            var id = $(this).parents("tr").find('.i-checks').attr('id'),
                                authName =  $(this).parents("tr").find('.authName').text();
                            Bus.openDialog(authName+'：分配属性','systemSettings/authTypeOfAllotPro.html?id='+id,'866px','450px')

                        });
                    });
                };
                //点击重置按钮
                $('#reset-btn').click(function(){
                    $("#authEnable option:first").prop("selected", 'selected');
                    $("#authNameParam").val("");
                    $("#authCodeParam").val("");
                    page.reset(["nameParam","codeParam","enable"]);
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
                        {"bSortable": false, "aTargets": [0, 4, 6]}
                    ],
                    "data":tableData,
                    "aoColumns": [
                        {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                            "render":function(data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "name",'sClass':" center authName"},
                        {"data": "code",'sClass':"center","width":"12%"},
                        {"data": "sysApplication.appName",'sClass':"center","width":"18%"},
                        {"data": "sort",'sClass':"center","width":"10%"},
                        {"data": "enable",'sClass':"center ", "width":"10%","defaultContent": "","render":function (data, type, row, meta){
                                var chahgeType;
                                return chahgeType = row.enable==0?"否":"是";
                            }
                        },
                        {
                            "data": "id", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                    "<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >" +
                                    "<a class='btn btn-danger btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >" +
                                    "<a class='btn btn-xs btn-add btn-allotApp'><i class='fa fa-wrench'></i>分配属性</a >";
                            }
                        }],
                });
                renderIChecks();
            }
        },

        formInit: function(){
            var id =Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form',
                html = "<option value = ''>请选择</option>";
            var url = Api.admin+"/api/sys/SysAuthClass/"+api+"/"+id;
            Api.ajaxJson(url,{},function(result){
                if(result.success){
                    var data = result.SysAuthClass;
                    if(id){
                        var  selVal =data.sysApplication.id,
                            selText = data.sysApplication.appName;
                    }
                    if(api == 'view'){
                        html += "<option value='"+selVal+"'>"+selText+"</option>";
                    }else if(api == 'form'){
                        var selArr = result.sysAppList;
                        for(var i=0;i<selArr.length;i++) {
                            selValFor = selArr[i].id;
                            selTextFor = selArr[i].appName;
                            html += "<option value='" + selValFor + "'>" + selTextFor + "</option>";
                        }
                    }
                    $("#selApp").empty().append(html).val(selVal);
                    Validator.renderData(data,$('#inputForm'));
                }else{
                    Mom.layMsg(result.message);
                }
            });
        },

        listInitPro: function(){
            //引入Page插件
            var id =Mom.getUrlParam('id');
            require(['Page'],function(){
                window.pageLoad = function (){
                    var data = {
                        nameParam:$("#authProName").val(),
                        codeParam:$("#authPro").val(),
                        id: id
                    };
                    //修改默认每页显示条数
                    var page = new Page();
                    page.pageShowNum = 0;
                    page.init(Api.admin+"/api/sys/SysAuthClass/authPropertyPage",data,true,function(tableData){
                        renderTableDataPro(tableData);
                        $('#allot-btn').click(function(){
                            allotCancelItem("#treeTable","dist","是",Api.admin+"/api/sys/SysAuthClass/ajaxSaveDist");
                        });
                        $('#cancel-btn').click(function(){
                            allotCancelItem("#treeTable","cancel","否",Api.admin+"/api/sys/SysAuthClass/ajaxSaveDist");
                        });
                        //点击重置按钮
                        $('#reset-btn').click(function(){
                            $("#authProName").val("");
                            $("#authPro").val("");
                            page.reset(["nameParam","codeParam"]);
                        });
                    });
                };
                $("#search-btn").click(function(){
                    pageLoad();
                });
                pageLoad();

                function renderTableDataPro(tableData){
                    $('#treeTable').dataTable({
                        "bSort": true,
                        "aoColumnDefs": [
                            {"bSortable": false, "aTargets": [0,3,4,5]}
                        ],
                        "data":tableData,
                        "aoColumns": [
                            {"data": null, "defaultContent":"", 'sClass': "autoWidth center",
                                "render":function(data, type, row, meta) {
                                    return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                                }
                            },
                            {"data": "name",'sClass':" center"},
                            {"data": "code",'sClass':"center "},
                            {"data": "null",'sClass':"center", "defaultContent": "","render":function (data, type, row, meta){
                                    return tierType = row.tierType==0?"单一维度":"层级维度";
                                }
                            },
                            {"data": "des",'sClass':"center"},
                            {"data": "null",'sClass':"center autoWidth ifAllot", "defaultContent": "","render":function (data, type, row, meta){
                                    return distStatus = row.distStatus==1?"是":"否";
                                }
                            }
                        ]
                    });
                    renderIChecks();
                }

                //分配、撤销功能
                function allotCancelItem(tableId,opflag,ifAllot,url){
                    var str="",flag = true;
                    $(tableId +" tbody tr td input.i-checks:checkbox").each(function(){
                        if(true == $(this).is(':checked')) {
                            var ifAllotText = "";
                            ifAllotText = $(this).parents("tr").find('.ifAllot').text();
                            str += "," + $(this).attr("id");
                            if (ifAllotText == ifAllot) {
                                var tit = "";
                                if(ifAllot == "是"){
                                    tit = "您所选的已有分配！"
                                }else{
                                    tit ="您所选的已有撤销的！"
                                }
                                Mom.layAlert(tit, 0);
                                flag = false;
                                return;
                            }
                        }
                    });
                    if(str == ""){
                        Mom.layAlert('请至少选择一条数据!');
                        return;
                    }
                    if(flag){
                        var data = {
                            opflag: opflag,
                            class_id: id,
                            property_ids: str.substr(1)
                        };
                        Api.ajaxForm(url,data,function (result) {
                            if (result.success == true) {
                                pageLoad()
                            }else{
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                };
            });
        },


    };

    $(function(){
        //鉴权类管理列表
        if($('#authenticationType').length > 0){
            PageModule.listInit();
        }
        //鉴权类新增、编辑
        else if($('#authTypeInner').length > 0){
            PageModule.formInit();
        }
        //鉴权类-分配属性
        else if($('#authTypeOfAllotPro').length > 0){
            PageModule.listInitPro();
        }

    });

});