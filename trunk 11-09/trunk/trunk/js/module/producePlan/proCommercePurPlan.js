require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        //商务采购指标计划
        proCPPInit:function(){
            require(['easyui_my'], function (easyui) {
                var year = Mom.getUrlParam('year'),
                    month = Mom.getUrlParam('month');
                id = Mom.getUrlParam('id');
                getmsg();

                function getmsg() {
                    var data = {
                        id: id
                    };
                    Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjustBus/queryMonthAdjustBus", JSON.stringify(data), function (result) {
                        if (result.success) {
                            var changeColTitleArr = [
                                {'monthPlan': month + '月计划'}
                            ];
                            $('.datagridsContent').empty();
                            var len = result.rows.length > 0 ? result.rows.length : 0;
                            var data = $.parseJSON(result.Template.jsonCfg);
                            var ii = 0;
                            for (var i = 0; i < len; i++) {
                                var itemData = result.rows[i];
                                var itemCode = itemData.code;
                                var columnObj = data[itemCode];
                                if (!columnObj) {
                                    continue;
                                }
                                var merCellArr = columnObj.mergeCell || [];
                                var html = $('<div class="tableItemBox"><table id="td' + ii + '" class="tableItem" ></table></div>');
                                $('.datagridsContent').append(html);
                                var tdCfg_ = easyui.dg_dataGridOptions('#td' + ii, itemData.name, columnObj.columnArr, merCellArr);
                                $('#td' + ii).datagrid(tdCfg_);
                                //动态修改表头中某列（或多列）的值
                                editColumnTitle('#td' + ii, changeColTitleArr[0]);
                                //渲染table
                                $('#td' + ii).datagrid('loadData', itemData.groupList);
                                ii++;
                            }
                            //浏览器窗口改变时dataGrid数据宽度重置
                            easyui.dg_dataGridResize('.tableItem');

                            function editColumnTitle(tdId, titleO) {
                                for (var t in titleO) {
                                    $(tdId).datagrid('getColumnOption', t).title = titleO[t];
                                    $(tdId).datagrid();
                                }
                            }

                            Mom.setFrameHeight();
                        }
                    })
                }
            });
        },
        //商务采购指标计划(新增、编辑)
        proCPPEInit:function () {
            require(['easyui_my'], function (easyui) {
                var arr = [];
                var msgobj = {};
                var year = $("#yearPlan option:selected", window.parent.document).attr('adyear') || '',
                    month = $("#getMonth", window.parent.document).val() || '',
                    monthName = $("#monthName", window.parent.document).val() || '',
                    id = $("#mainId", window.parent.document).val() || '',
                    yearId = $("#yearPlan", window.parent.document).val() || "";
                var data = {
                    "id": id,
                    "adYear": year,
                    "adMonth": month
                };
                Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjustBus/queryMonthAdjustBus", JSON.stringify(data), function (result) {
                    if (result.success) {
                        var changeColTitleArr = [
                            {'monthPlan': month + '月计划'}
                        ];
                        $('.datagridsContent').empty();
                        var len = result.rows.length > 0 ? result.rows.length : 0;
                        var data = $.parseJSON(result.Template.jsonCfg);
                        var ii = 0;
                        for (var i = 0; i < len; i++) {
                            var itemData = result.rows[i];
                            var itemCode = itemData.code;
                            var columnObj = data[itemCode];
                            if (!columnObj) {
                                continue;
                            }
                            var merCellArr = columnObj.mergeCell || [];
                            var html = $('<div class="tableItemBox"><table id="td' + ii + '" class="tableItem" ></table></div>');
                            $('.datagridsContent').append(html);
                            var tdCfg_ = easyui.dg_dataGridOptions('#td' + ii, itemData.name, columnObj.columnArr, merCellArr);
                            $('#td' + ii).datagrid(tdCfg_);
                            //渲染table
                            $('#td' + ii).datagrid('loadData', itemData.groupList);
                            //动态修改表头中某列（或多列）的值
                            editColumnTitle('#td' + ii, changeColTitleArr[0]);
                            //设置字段可编辑
                            $('#td' + ii).datagrid('addEditor', columnObj.editArr);
                            ii++;
                        }
                        //浏览器窗口改变时dataGrid数据宽度重置
                        easyui.dg_dataGridResize('.tableItem');

                        function editColumnTitle(tdId, titleO) {
                            for (var t in titleO) {
                                $(tdId).datagrid('getColumnOption', t).title = titleO[t];
                                $(tdId).datagrid();
                            }
                        }

                        Mom.setFrameHeight();
                    }
                });
                //点击时获取到信息
                $(".btn-save").click(function () {
                    if (!checkSave()) {
                        return;
                    }
                    submitData("0");
                });

                //**保存校验

                function checkSave() {
                    yearId = $('#yearPlan', window.parent.document).val();
                    year = $('#yearPlan option:selected', window.parent.document).attr('adYear');
                    month = $('#getMonth', window.parent.document).val();
                    monthName = $('#monthName', window.parent.document).val();
                    if (yearId == '' && month == '') {
                        Mom.layAlert("年计划、月计划周期不能为空！");
                        return false;
                    } else {
                        var str = yearId == "" ? "年计划不能为空" : month == "" ? '月计划周期不能为空！' : true;
                        if (str != true) {
                            Mom.layAlert(str);
                            return false;
                        } else {
                            return true;
                        }
                    }
                }

                //将点击状态添加到数组里边
                function submitData(status) {
                    var editItems = easyui.dg_getSaveItemArr();
                    var data = {
                        "status": status,
                        "adYear": year,
                        "adMonth": month,
                        "yearId": yearId,
                        "monthName": monthName,
                        "mainId": id,
                        "busPlans": JSON.stringify(editItems),
                    };
                    Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustBus/saveBusInfo", data, function (result) {
                        if (result.success) {
                            top.layer.msg('保存成功!', {icon: 1});
                            var mainId = $('#mainId', window.parent.document).val();
                            if (!mainId) {
                                $('#mainId', window.parent.document).val(result.mainId);
                                $("#yearPlan,#getMonth", window.parent.document).attr("disabled", "disabled").css({"cursor": "not-allowed"});
                            }
                            setTimeout(function () {
                                location.href = location.href;  //刷新当前页面
                            }, 2000)
                        }
                    });
                }
            });
        },

    };

    $(function () {
        //商务采购指标计划
        if ($('#proCommercePurPlan').length > 0) {
            PageModule.proCPPInit();
        }
        //商务采购指标计划(新增、编辑)
        else if ($('#proCommercePurPlanEdit').length > 0) {
            PageModule.proCPPEInit();
        }
    });
});