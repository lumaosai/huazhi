require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        init: function(){
            window.pageLoad = function () {
                Api.ajaxJson(Api.mtrl +"/api/mv/GaugeDftCfg/list", {}, function (res) {
                    if(res.success){
                        renderTableData(res.gaugeDftCfgList, res.gaugeTypeList);
                    }
                });
            };
            pageLoad();
            // 保存按钮
            $('#save-btn').unbind('click').click(function(){
                var arr = [];
                $('#treeTable tbody tr').each(function(index,item){
                    var obj = {};
                    obj.nodeName = $(this).find('td').eq(1).text();
                    obj.gaugeType = $(this).find('select').val();
                    obj.id = $(this).find('select').attr('id');
                    obj.nodeId = $(this).find('select').attr('data-id');
                    arr.push(obj);
                })
                var data = {
                    gaugeDftCfgs:JSON.stringify(arr)
                };
                Api.ajaxForm(Api.mtrl +"/api/mv/GaugeDftCfg/save",data,function (res) {
                    if(res.success){
                        Mom.layMsg(res.message);
                    }else{
                        Mom.layMsg(res.message);
                    }
                });
            });
            function renderTableData(tableData, selectrow) {
                $('#treeTable').dataTable({
                    "bFilter":true,
                    "data": tableData,
                    "fnDrawCallback": function(){
                        var api = this.api();
                        api.column(0).nodes().each(function(cell, i) {
                            cell.innerHTML =  i + 1;
                        });
                    },
                    "aoColumns": [
                        {"data": null,"targets": 0, 'sClass': "center","width": "40px"},
                        {"data": "nodeName", 'sClass': "center"},
                        {
                            "data": null, "defaultContent": "", 'sClass': "center" ,"width": "40%",
                            "render": function (data, type, row, meta) {
                                var optionArr = [];
                                selectrow.forEach(function(item,index){
                                    var seled = row.gaugeType == item.value?" selected":"";
                                    optionArr.push("<option value='"+item.value+"'"+seled+">"+ item.label+"</option>");
                                })
                                return "<select id='"+row.id+"' data-id='"+row.nodeId+"' class='select2' data-allowClear='false'>'"+optionArr.join('')+"'</select>"
                            }
                        }
                    ],

                });
                //重新渲染select2
                renderSelect2($('.select2'));
            };
        },

    }
    $(function () {
        if ($('#measurementConfig').length > 0) {
            PageModule.init();
        }
    });
})
