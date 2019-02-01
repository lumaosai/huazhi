
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    var PageModule = {
        init: function(){
            require(['jqGrid_my'], function (jqGridAll) {
                var html = $('.ibox-content').html();
                window.pageLoad = function () { //Api.mtrl +"/api/mv/FormulaDef/form"
                    var  dataList = {
                        createDate:$('#createDate').val(),//日期
                        shiftDate:$('#shiftDate').val(),//班次
                    }
                    Api.ajaxJson("http://localhost/json/factoryModel/materialMove/class.json", {}, function (res) {
                        if(res.success){
                            $('.treeTable-num').text(res.count);
                            var colModel1 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "F","label": "F","align": "center"},
                                {"name": "name","label": "name","align": "center"},
                                {"name": "wuliao","label": "wuliao","align": "center"},
                                {"name": "yuanshi","label": "yuanshi","align": "center"},
                                {"name": "queren","label": "queren","align": "center"},
                                {"name": "guan","label": "guan","align": "center"},
                                {"name": "yibiao","label": "yibiao","align": "center"},
                                {"name": "liaoxian","label": "liaoxian","align": "center"},
                                {"name": "jiliang","label": "jiliang","align": "center"},
                                {"name": "caoche","label": "caoche","align": "center"},
                                {"name": "guidao","label": "guidao","align": "center"},
                                {"name": "qiche","label": "qiche","align": "center"},
                                {"name": "gongshi","label": "gongshi","align": "center"},
                                {"name": "ren","label": "ren","align": "center"},
                                {"name": "time","label": "time","align": "center"},
                                {"name": "zhuangtai","label": "zhuangtai","align": "center"},
                            ];
                            var optionsPot = {   //主表
                                colNames: ["id","F","进出厂名称","物料名称","原始值","确认量","罐量","仪表量","料线量","计量单量","槽车量","轨道衡量","汽车衡量","计量公式量","录入人","录入时间","提交状态"],
                                colModel: colModel1,
                                data: res.rows,
                                //gridComplete: function () {
                                //    var ids = $("#treeTable").getDataIDs();
                                //    for (var i = 0; i < ids.length; i++) {
                                //        var rowData = $("#treeTable").getRowData(ids[i]);
                                //        console.log(rowData,999);
                                //        if (rowData.sealFlag=="已提交" && rowData.submitFlag=="是") {//useable-- 单元格的name 或 index
                                //            $("#treeTable").find('#' + ids[i]).css("color",'#00CC66');
                                //            //$("#treeTable").setCell(ids[i],"enable",'已提交',{color:'green'});//setCell 设置单元格样式 值 或属性
                                //        }else if(rowData.sealFlag=="未提交"&& rowData.submitFlag=="是"){
                                //            $("#treeTable").find('#' + ids[i]).css("color",'#333333');
                                //            //$("#treeTable").setCell(ids[i],"enable",'未提交',{color:'red'});
                                //        }else{
                                //            $("#treeTable").find('#' + ids[i]).css("color",'#FF0000');
                                //            //$("#treeTable").setCell(ids[i],"enable",'未提交',{color:'red'});
                                //        }
                                //    }
                                //
                                //}
                            };
                            var colModel2 = [
                                {"name": "id","label": "id","align": "center","hidden":true},
                                {"name": "type","label": "type","align": "center","title":false},
                                {"name": "name","label": "name","align": "center"},
                                {"name": "zhi","label": "zhi","align": "center"},
                                {"name": "qianlaing","label": "qianlaing","align": "center"},
                                {"name": "qiantime","label": "qiantime","align": "center"},
                                {"name": "houliang","label": "houliang","align": "center"},
                                {"name": "houtime","label": "houtime","align": "center"}
                            ];
                            var optionsMMove = {   //子表
                                colNames: ["id","类型","计量名称","前后差值","前量","前量时间","后量","后量时间"],
                                colModel: colModel2,
                                rownumbers: true,
                            };
                            var config = {
                                url: 'http://localhost/json/factoryModel/materialMove/classSon.json',
                                //url: Api.mtrl+'/api/mv/TankSeal/view',
                                //otherId:'tankId',
                                contentType:'form',
                                //tableParentId:'.treeTableParent'
                            };
                            var subtable =[];
                            jqGridAll.jG_jqGridTableLevel('#treeTable',optionsPot,optionsMMove,config,subtable);
                        }
                    });
                };
                pageLoad();
                //提取班量数据
                $('#btn-tiqu').unbind('click').click(function(){
                    $('.ibox-content').empty().html(html);
                    pageLoad();
                });
                //保存
                $('#save-btn').unbind('click').click(function(){
                    var data = $('#treeTable').getRowData();
                    console.log(data);
                });
            });



        },

    }
    $(function () {
        if ($('#entryClasses').length > 0) {
            PageModule.init();
        }
    });
})
