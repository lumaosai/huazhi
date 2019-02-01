/**
 * Created by admin on 2018/11/20.
 */
require([cdnDomain+'/js/zlib/app.js'], function (App) {
var PageModel = {
    init:function () {
        $(".maindiskUser").val(Mom.getCookie("userName"));   //显示主盘人
        PageModel.inventoryDate();//盘存下拉
        //返回按钮
        $("#back-btn").click(function () {
            location.href = "./invDataCollection.html";
        });
        PageModel.loadData();//加载数据
    },
    inventoryDate:function () {
        var url = Const.admin + "/api/sys/SysDict/type/STOCKTAKE_DATE";
        Api.ajaxForm(url, {}, function (result) {
            var date = [15, 30];
            var dateArr = [];
            var myDate = new Date();
            var year = myDate.getFullYear();//获取当前月
            var month = myDate.getMonth() + 1;//获取当前日
            var rows = result.rows;
            for (var i = 0; i < rows.length; i++) {
                for (var c = 0; c < date.length; c++) {
                    var now = year + '-' + month + "-" + date[c] + " " + rows[i].value;
                    dateArr.push(now)
                }
            }
            $(dateArr).each(function (i, o) {
                $('#startDate').append("<option value='" + dateArr[i] + "'>" + dateArr[i] + "</option>");
            });
        });
    },
    loadData:function () {
        var id = Mom.getUrlParam("id");
        var url = "";
        if(id){     //查看或者修改
            url = "/api/aps/collect/collectView/"+id;
        }else{
            url = "/api/stocktake/PageView/collectInMaterial";
        }
        Api.ajaxForm(Const.aps+url,{},function (result) {
            PageModel.createTable(result.rows);//tab切换按钮
        })
    },
    createTab:function (tabList) {
        for(var i=0;i<tabList.length;i++){
            var li = $("<li type='"+tabList[i].code+"'>"+tabList[i].name+"</li>");
            $(".tab-nav").append(li);
        }
        $(".tab-nav li").each(function (index,item) {
            $(item).unbind("click").on("click",function () {
                $(this).addClass("active").siblings("li").removeClass("active");      //当前选中tab添加calss
                $(".datagridsContent").eq(index).removeClass("hide").siblings(".datagridsContent").addClass("hide");  //设置table显示隐藏
                $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
            });
            if(index==0){
                $(item).addClass("active");
                $(".datagridsContent").eq(index).removeClass("hide").siblings(".datagridsContent").addClass("hide");
                $('.tab-btns li').eq(index).addClass('active').siblings().removeClass('active'); //tab后边的操作按钮显示隐藏
            }
        });
    },
    createTable:function (dataTable) {
        require(["jqGrid_my"], function (jqGridAll) {
            //遗留问题：默认每个表格创建一遍不然直接点击矿堆保存的时候后两个表格数据拿不到，保存的时候三个表一块发送
        for (var i = 0; i < dataTable.length; i++) {
            var tableHtml = "<table class='datatable' id='jqGridTable"+i+"'></table>";
            $(".datagridsContent").eq(i).append(tableHtml);
        }
        var tableTemplatr = [
            [
                {"name":"delFlag","label":"delFlag", "align":"center","hidden":true},
                {"name":"code","label":"code","align":"center","hidden":true},
                {"name":"groupCode","label":"groupCode","align": "center","hidden":true},
                {"name": "id", "label": "id", "align": "center", "hidden":true},
                {"name": "name", "label": "名称", "align": "center",
                    cellattr: function (rowId, tv, rawObject, cm, rdata) {
                        //合并单元格
                        return 'id=\'name' + rowId + "\'";
                    }
                },
                {"name": "subName", "label": "子项", "align": "center"},
                {"name": "unit", "label": "单位", "align": "center"},
                {"name": "monthValue", "label": "本月值", "align": "center", "editable": true},
                {"name": "monthTotal", "label": "累计值", "align": "center"}
            ],
            [
                {"name":"code","label":"code","align":"center","hidden":true},
                {"name":"groupCode","label":"groupCode","align":"center","hidden":true},
                {"name":"id","label":"id","align":"center","hidden":true},
                {"name":"name","label":"名称","align":"center",
                    cellattr: function (rowId, tv, rawObject, cm, rdata) {
                        //合并单元格
                        return 'id=\'name' + rowId + "\'";
                    }
                },
                {"name":"subName","label":"子项","align":"center"},
                {"name":"unit","label":"单位","align":"center"},
                {"name":"monthValue","label":"本月值","align":"center","editable":true},
                {"name": "monthTotal", "label": "累计值", "align": "center"}
            ],
            [
                {"name": "code", "label": "code", "align": "center", "hidden":true},
                {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                {"name": "id", "label": "id", "align": "center", "hidden":true},
                {"name": "name", "label": "名称", "align": "center",
                    cellattr: function (rowId, tv, rawObject, cm, rdata) {
                        //合并单元格
                        return 'id=\'name' + rowId + "\'";
                    }
                },
                {"name": "subName", "label": "子项", "align": "center"},
                {"name": "unit", "label": "单位", "align": "center"},
                {"name": "monthValue", "label": "本月值", "align": "center", "editable": true},
                {"name": "monthTotal", "label": "累计值", "align": "center"}
            ],
            [
                {"name": "code", "label": "code", "align": "center", "hidden":true},
                {"name": "groupCode", "label": "groupCode", "align": "center", "hidden":true},
                {"name": "id", "label": "id", "align": "center", "hidden":true},
                {"name": "name", "label": "名称", "align": "center",
                    cellattr: function (rowId, tv, rawObject, cm, rdata) {
                        //合并单元格
                        return 'id=\'name' + rowId + "\'";
                    }
                },
                {"name": "subName", "label": "子项", "align": "center"},
                {"name": "unit", "label": "单位", "align": "center"},
                {"name": "monthValue", "label": "本月值", "align": "center", "editable": true},
                {"name": "monthTotal", "label": "累计值", "align": "center"}
            ]
        ];
        for(var j=0;j<dataTable.length;j++){
            var gridComplete = jqGridAll.jG_gridComplete("jqGridTable"+j, "name");  //单元格合并
            var editRowFn = jqGridAll.jG_editRowFn("#jqGridTable"+j,'',true);//设置可编辑，但是不可以输入汉字
            var configData = jqGridAll.jG_configData(dataTable[j].nodes);  //创建table的数据
            var len = dataTable[j].nodes.length;
            var gridConfig = jqGridAll.jG_config('',[],tableTemplatr[j],len);
            $("#jqGridTable" + j).jqGrid($.extend(configData, gridConfig,editRowFn,gridComplete));
        };
        PageModel.createTab(dataTable);//tab切换按钮

            //保存按钮
            $(".btn-save").unbind("click").on("click",function () {
                $('td.edit-cell').each(function (i, item) {
                    $(this).siblings('td').siblings('td').eq(0).trigger('click');
                });
                $('input[type=text].editable').each(function (i, item) {
                    $(this).parents('td').text($(this).val());
                    $(this).remove()
                });
                var ids = [];
                $(".datatable").each(function (index,item) {
                    ids.push($(item).attr("id"));
                });
                PageModel.clickHandler(ids);
            })
        })
    },
    clickHandler:function (ids) {
        require(["jqGrid_my"],function (jqGridAll) {
            var contentArr = [];
            var arrfjc = '';
            for (var i = 0; i < ids.length; i++) {
                arrfjc = $('#' + ids[i]).jqGrid('getRowData');
                contentArr.push(arrfjc);
            }
            if($(".supervisionplate ").val()==""){
                Mom.layMsg("请填写监盘人员");
            }else if($("#startDate option:selected").val() == ""){
                Mom.layMsg("请选择盘存日期");
            }else if($("#otherPlate").val() == ""){
                Mom.layMsg("请填写参与盘存人员");
            }else {
                var dataArr = [];
                for(var i=0;i<contentArr.length;i++){
                    for(var j=0;j<contentArr[i].length;j++){
                        dataArr.push(contentArr[i][j]);
                    }
                }
                var data = {
                    id:$("#id").val(),
                    fstMan: Mom.getCookie("userName"),
                    secMan:$(".supervisionplate").val(),
                    stocktakeDate:$("#startDate option:selected").val(),
                    stocktakeType:"JCWL",
                    mtrlsData:JSON.stringify(dataArr),
                    status:$("#status").val()
                };
                Api.ajaxForm( Const.aps+"/api/aps/collectMtrl/save",data,function (result) {
                    if(result.success){
                        top.layer.msg('操作成功，即将返回盘存收集列表页！', {
                            icon: 1,
                            time: 800
                        });
                        setTimeout(function () {
                            Mom.winBack();
                        }, 1000)
                    }else{
                        Mom.layAlert(result.message);
                    }
                })
            }
        });
    }
}
$(function () {
    if($("#createField").length>0){
        PageModel.init();
    }
})
})