require([cdnDomain+'/js/zlib/app.js'], function(App) {
    var PageModule = {
        init: function(){
            require(['SmallPage'],function(){
                Api.ajaxForm(Const.admin+"/api/mes/AlertMsg/alarm",{},function(result){
                    if(result.success == true){
                        // $('.info-num i').empty().text(result.rows);
                        new SmallPage().init({
                            dataList: result.rows,
                            pageSize:20,
                            container: '.page-container'
                        },function (pagerenderRows) {
                            renderTableData(pagerenderRows)
                        });
                        $('.btn-handle').click(function(){
                            var id = $(this).attr('id');
                            Bus.openEditDialog('取消报警','mes/cancelAlarm.html?dataId='+id,'400px','240px',cancelAlarm_callback);

                            function cancelAlarm_callback(layerIdx, layero){
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getFormData();
                                if(formData){
                                    var data = formData.data;
                                    console.log(data);
                                    if($.trim(data.DealInstruction) == ""){
                                        Mom.layMsg("请填写取消原因！");
                                        return;
                                    }
                                    Api.ajaxJson(formData.url, JSON.stringify(data), function(result){
                                        if(result.success == true){
                                            Mom.layMsg('操作成功', 1000);
                                            //刷新父层
                                            var frameActive = top.TabsNav.getActiveTab();
                                            var obj = $('#search-btn,#btn-search', frameActive[0].contentDocument);
                                            if (obj.length == 0) {
                                                obj = $('#refresh-btn', frameActive[0].contentDocument);
                                                if (obj.length == 0) {
                                                    top.TabsNav.refreshActiveTab();
                                                }
                                            }
                                            obj.trigger('click');
                                            //关闭弹出层
                                            top.layer.close(layerIdx);
                                        }else{
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                                return false;
                            }
                        });
                    }else{
                        Mom.layMsg(result.message);
                    }
                });
            });

            function renderTableData(tableData){
                $('#dataTable').dataTable({
                    "data":tableData,
                    //定义列 宽度 以及在json中的列名
                    "aoColumns": [
                        {"data": null,'sClass':"center","width":"40px"},
                        {"data": "source",'sClass':"center","width":"10%"},
                        {"data": "Status",'sClass':"center","width":"10%"},
                        {"data": "OrgOrDevice","width":"25%",
                            "render":function (data, type, row, meta) {
                                var orgOrDevice=row.OrgOrDevice;
                                var divhtml="<div style='width: 100%;height: 30px;overflow: hidden;text-overflow: ellipsis' >"+orgOrDevice+"</div>";
                                return divhtml;}
                        },
                        {"data": "Name","width":"25%",
                            "render":function (data, type, row, meta) {
                                var orgOrDevice=row.Name;
                                var divhtml="<div style='width: 100%;height: 30px;overflow: hidden;white-space: nowrap; text-overflow: ellipsis' >"+orgOrDevice+"</div>";
                                return divhtml;}
                        },
                        {"data": "DateTime",'sClass':"center","width":"15%"},
                        {"data": "id", "orderable": false, "defaultContent": "",'sClass':" center autoWidth",
                            "render": function (data, type, row, meta) {
                                return "<a class='btn btn-handle' id=" + row.ID + " ><i class='fa fa-exclamation-triangle' ></i>处理</a >"
                            }
                        }],
                    "fnDrawCallback" : function(){
                        this.api().column(0).nodes().each(function(cell, i) {
                            cell.innerHTML =  i + 1;
                        });
                    }
                });
            }
        }
    };

    $(function(){
        PageModule.init();
    });

});