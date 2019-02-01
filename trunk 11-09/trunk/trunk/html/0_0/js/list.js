require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    // require(['checkUser']);

    var PageModule = {
        listInit: function () {
            //动态添加Select的option
            Bus.createSelect(Api.admin + "/api/sys/SysDict/allType", "#type", 'type', 'type');

            //弹出树选择
            $('#companyButton').click(function(){
                var options = {defaultVals: $('#companyId').val() };//配置选中的值
                Bus.openOrgSelect('选择公司',{},options,function(selResult, layIdx, layero){
                    $('#companyId').val(selResult.id);
                    $('#companyName').val(selResult.name);
                    return true;
                },function(){
                    $('#companyId').val('');
                    $('#companyName').val('');
                });
            });

            //引入Page插件
            require(['Page'], function() {
                var page = new Page();
                window.pageLoad = function () {
                    var data = {
                        type: $("#type option:selected").val(),
                        descriptionParam: $('#description').val()
                    };
                    //修改默认每页显示条数
                    page.init(Api.admin + "/api/sys/SysDict/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改字典', '../0_0/form.html?id=' + id, '665px', '386px', saveCallback);
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除该字典吗', Api.admin + '/api/sys/SysDict/delete', {ids:id});
                        });
                    });

                };
                //点击重置按钮
                $('#reset-btn').click(function () {
                    Mom.clearForm($('.toolbar-form'));
                    page.reset(["type", "descriptionParam"]);
                });
                $("#search-btn").click(function () {
                    pageLoad();
                });
                pageLoad();
            });

            //保存回调函数
            function saveCallback(layerIdx, layero){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var formData = iframeWin.getFormData();//获取内页表单数据
                if(formData){
                    var data = formData.data;
                    Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                        if(result.success == true){
                            Mom.layMsg('操作成功', 1000);
                            setTimeout(function(){
                                top.layer.close(layerIdx);
                            },1000);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                }
                return false;
            }

            function renderTableData(tableData) {
                $('#treeTable').dataTable({
                    "bSort": true,
                    "aoColumnDefs": [
                        {"bSortable": false, "aTargets": [0, 2, 6]}
                    ],
                    "data": tableData,
                    //定义列 宽度 以及在json中的列名
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "value", 'sClass': "center", "width": "12%"},
                        {"data": "label", 'sClass': "center ", "width": "12%"},
                        {"data": "type", 'sClass': "center", "width": "12%"},
                        {"data": "enable", 'sClass': "center", "width": "12%",
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+row.enable+"'></i>";
                            }
                        },
                        {"data": "description", 'sClass': "center"},
                        {"data": "sort", 'sClass': "center", "width": '8%'},
                        {
                            "data": "id","width": '10%', "defaultContent": "", 'sClass': " center ",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                    "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                            }
                        }]
                });
                renderIChecks();
            }
        },

        formInit: function () {
            var id = Mom.getUrlParam('id'),
                api = Mom.getUrlParam('api') || 'form';
            if (id) {
                var url = Api.admin + "/api/sys/SysDict/" + api + "/" + id;
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        Validator.renderData(result.SysDict, $('#inputForm'));
                    } else {
                        Mom.layMsg(result.message);
                    }
                });
            }

            //组织机构选择
            var selectOrg = function(){
                var options = {defaultVals: $('#orgId').val() };
                Bus.openOrgSelect('选择机构',{},options,function(selResult, layIdx, layero){
                    $('#orgId').val(selResult.id);
                    $('#orgName').val(selResult.name);
                    return true;
                },function(){
                    $('#orgId').val('');
                    $('#orgName').val('');
                });
            };
            $('#orgName').on('dblclick',selectOrg);
            $('#companyButton').on('click',selectOrg);

            //用户选择1
            function selectUser1(){
                var options = { defaultVals:$('#userId1').val() };
                Bus.openSelUserWin('选择用户',{},options,function(selResult, layIdx, layero){
                    $('#userId1').val(selResult.id);
                    $('#userName1').val(selResult.name);
                    return true;
                },function(){
                    $('#userId1').val('');
                    $('#userName1').val('');
                });
            };
            $('#userName1').on('dblclick',selectUser1);
            $('#userButton1').on('click',selectUser1);

            //用户选择2
            function selectUser2(){
                var checkedVals = $('#userId2').val();
                Bus.openSelUserWin2('选择用户',false,checkedVals,function(selResult, layIdx, layero){
                    $('#userId2').val(selResult.id);
                    $('#userName2').val(selResult.name);
                    return true;
                });
            };
            $('#userName2').on('dblclick',selectUser2);
            $('#userButton2').on('click',selectUser2);

            //用户选择3
            function selectUser3(){
                var options = {
                    multiple: false,//单选
                    hasUserOptions:{
                        checkDefaultVal: {id:$('#userId3').val(), name:$('#userName3').val()}
                    }
                }
                Bus.openSelUserWin3('选择用户', options, function(selResult, layIdx, layero){
                    console.log(selResult);
                    if(selResult.success){
                        var selUser = selResult.newValues[0];
                        $('#userId3').val(selUser.id);
                        $('#userName3').val(selUser.name);
                        return true;
                    }
                },function(){
                    $('#userId3').val('');
                    $('#userName3').val('');
                });
            };
            $('#userName3').on('dblclick',selectUser3);
            $('#userButton3').on('dblclick',selectUser3);


            window.getFormData = function(){
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            };

        },



    };
    $(function () {
        //列表
        if ($('#list').length > 0) {  //XX列表页
            PageModule.listInit();
        }
        //查看、编辑
        else if ($('#form').length > 0) {  //XX弹窗页（新增）
            PageModule.formInit();
        }


    });

});