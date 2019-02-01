/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        momWorkshop: function(){

            //引入Page插件
            require(['Page'], function () {
                var page = new Page();
                Api.ajaxJson(Api.mtrl + "/api/fm/Fctr/fctrSelect",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctrId',result.rows,'id','fctrName');
                    }
                });
                window.pageLoad = function () {
                    var data = {
                        enable: $("#enable option:selected").val(),
                        wspName: $('#wspName').val(),
                        fctr: {
                            id:$("#fctrId option:selected").val()
                        }
                    };
                    //修改默认每页显示条数http://localhost/json/fwork/chejian.json
                    page.init(Api.mtrl + "/api/fm/Workshop/page", data, true, function (tableData) {
                        renderTableData(tableData);
                        $('.btn-edit').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.openEditDialog('修改MOM车间', '/material/factoryModels/momWorkshopView.html?id=' + id, '700px', '300px',callback);
                        });
                        $('.btn-delete').click(function () {
                            var id = $(this).parents("tr").find('.i-checks').attr('id');
                            Bus.deleteItem('确定要删除改MOM车间吗', Api.mtrl + '/api/fm/Workshop/delete/', {ids:id});
                        });
                        //编辑
                        $("#btn-edit").unbind("click").on("click",function () {
                            Bus.editCheckedTable('修改MOM车间','/material/factoryModels/momWorkshopView.html','700px', '300px','#treeTable',callback);
                        });
                    });
                };
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            function callback(layerIdx,layero){
                var iframeWin = layero.find('iframe')[0].contentWindow;
                var formData = iframeWin.getFormData();
                if(formData){
                    var data = formData.data;
                    Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                        if(result.success == true){
                            Mom.layMsg('操作成功', 1000);
                            //关闭弹出层
                            pageLoad();
                            top.layer.close(layerIdx);
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
                        {"bSortable": false, "aTargets": [0,5,8]}
                    ],
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "wspNo", 'sClass': " center", "width": "12%"},
                        {"data": "wspCode", 'sClass': "center ", "width": "12%"},
                        {"data": "wspName", 'sClass': "center", "width": "12%"},
                        {"data": "wspAlias", 'sClass': "center","width": "12%"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<div>"+ row.fctr.fctrName+"</div>"
                            }
                        },
                        {"data": "enable", 'sClass': "center", "width": "12%",
                            "render": function (data, type, row, meta) {
                                return "<i class='fa gray-check-"+row.enable+"'></i>";
                            }
                        },
                        {"data": "displayOrder", 'sClass': "center", "width": '8%'},
                        {"data": "remark", 'sClass': "center"},
                        {
                            "data": "id", "orderable": false, "defaultContent": "", 'sClass': " center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn-edit' title='编辑'><i class='fa fa-edit '></i></a >" +
                                    "<a class='btn-delete' title='删除'><i class='fa fa-trash-o '></i></a >";
                            }
                        }]
                });
                renderIChecks();
            };
        },
        //编辑页面
        momWorkshopView: function() {
            var id =Mom.getUrlParam('id');
            if(id){
                    Api.ajaxJson(Api.mtrl + "/api/fm/Workshop/form/" + id,{},function(result){
                        if(result.success){
                            Bus.appendOptionsValue('#fctr',result.fctrList,'id','fctrName');
                            Validator.renderData(result.Workshop, $('#inputForm'));
                        }
                        $('#wspNo').attr('disabled','disabled');
                        $('#fctr').attr('disabled','disabled');
                    });
            }else{
                Api.ajaxJson(Api.mtrl + "/api/fm/Workshop/form/0",{},function(result){
                    if(result.success){
                        Bus.appendOptionsValue('#fctr',result.fctrList,'id','fctrName');
                    }
                });
            }
            window.getFormData = function(){
                $('#fctr').attr('disabled',false);
                if(!Validator.valid(document.forms[0],1.3)){
                    return;
                }
                var formObj = $('#inputForm');
                return {
                    url: formObj.attr('action'),
                    data: formObj.serializeJSON()
                }
            };

        }
    }
    $(function () {
        if ($('#momWorkshop').length > 0) {
            PageModule.momWorkshop();
        }else if($('#momWorkshopView').length > 0){
            PageModule.momWorkshopView();
        }
    });
})