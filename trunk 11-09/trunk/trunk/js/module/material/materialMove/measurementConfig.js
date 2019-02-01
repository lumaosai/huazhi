/**
 * Created by lumaosai on 2018/10/27.
 */
/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        init: function(){

            window.pageLoad = function () { //Api.mtrl +"/api/mv/FormulaDef/form"
                Api.ajaxJson("http://localhost/json/factoryModel/materialMove/config.json", {}, function (res) {
                    if(res.success){
                        renderTableData(res.rows,res.select);
                        //添加按钮
                    }
                    Api.ajaxJson("http://localhost/json/factoryModel/materialMove/selectConfig.json", {}, function (res) {
                        if(res.success){
                            Bus.appendOptionsValue('#select',res.rows,'type','name');
                            //添加按钮
                        }
                    });
                });
            };
            pageLoad();
            $('#save-btn').unbind('click').click(function(){
                var arr = [];
                $('#treeTable tbody tr').each(function(index,item){
                    console.log(index,item);
                    var obj = {};
                    obj.name = $(this).find('td').eq(0).val();
                    obj.type = $(this).find('select').val();
                    obj.id = $(this).find('select').attr('id');
                    arr.push(obj);
                })
                console.log(arr);
            });
            function renderTableData(tableData,selectrow) {
                $('#treeTable').dataTable({
                    "bFilter":true,
                    "data": tableData,
                    "aoColumns": [
                        {"data": "name", 'sClass': "center", "width": "30%"},
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                var str = '';
                                selectrow.forEach(function(item,index){
                                    if(row.type === item.type){
                                        str += "<option value='"+item.type+"'  selected>"+ item.name+"</option>"
                                    }else{
                                        str += "<option value='"+item.type+"'>"+ item.name+"</option>"
                                    }
                                    //str += "<option value='"+item.type+"'>"+ item.name+"</option>"
                                })
                                return  "<select  id='"+row.id+"'  value='"+row.type+"'>'"+str+"'</select>"
                            }
                        }
                    ]
                });

                //renderIChecks();
            };
        },

    }
    $(function () {
        if ($('#measurementConfig').length > 0) {
            PageModule.init();
        }
    });
})
