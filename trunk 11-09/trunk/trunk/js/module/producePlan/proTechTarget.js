require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        //全厂主要生产技术指标计划
        proTechTargetInit:function(){
            require(['easyui_my'], function (easyui) {
                var year = Mom.getUrlParam('year'),
                    month = Mom.getUrlParam('month'),
                    id = Mom.getUrlParam('id');
                var data = JSON.stringify({"id": id});
                var tit = month < 10 ? month.substr(1, 1) : month;
                Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjustTech/queryMonthAdjustTech", data, function (result) {
                    if (result.success) {
                        var changeColTitleArr = [
                            {'monthPlan': month + '月计划'}
                        ];
                        if (result.success) {
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
                    }
                });
            });
        },
        //全厂主要生产技术指标计划(新增、编辑)
        proTechTargetEInit:function () {
            require(['easyui_my'], function (easyui) {
                var year = $("#yearPlan option:selected", window.parent.document).attr('adyear') || '',
                    month = $("#getMonth", window.parent.document).val() || '',
                    monthName = $("#monthName", window.parent.document).val() || '',
                    id = $("#mainId", window.parent.document).val() || '',
                    yearId = $("#yearPlan", window.parent.document).val() || "";
                var btnArr = [{selector: '.btn-submit', code: "PPMYPP_PSO"}];  //调整按钮;

                var checkDGArr = [];  //提交时验证表单必填项

                var data = JSON.stringify({
                    "id": id,
                    "adYear": year,
                    "adMonth": month,
                    "yearId": yearId
                });
                Api.ajaxJson(Api.aps + "/api/aps/ApsMonthAdjustTech/queryMonthAdjustTech", data, function (result) {
                    if (result.success) {
                        var changeColTitleArr = [
                            {'monthPlan': month + '月计划'}
                        ];
                        if (result.success) {
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
                                var dgValidator = columnObj.validator;
                                if (!($.isEmptyObject(dgValidator))) { //$.isEmptyObject(data)  判断对象的是否为空，为空是放回值为true;
                                    dgValidator.dgName = itemData.name;
                                    dgValidator.dgId = '#td' + ii;
                                    checkDGArr.push(dgValidator);
                                }

                                var html = $('<div class="tableItemBox" ><table id="td' + ii + '" class="tableItem" data-table="'+itemCode+'" ></table></div>');
                                $('.datagridsContent').append(html);
                                var tdCfg_ = easyui.dg_dataGridOptions('#td' + ii, itemData.name, columnObj.columnArr, merCellArr);
                                $('#td' + ii).datagrid(tdCfg_);
                                //动态修改表头中某列（或多列）的值
                                editColumnTitle('#td' + ii, changeColTitleArr[0]);
                                //渲染table
                                $('#td' + ii).datagrid('loadData', itemData.groupList);
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
                        $("#btn-adjust").click(function () { //月计划调整功能
                            function adjustMonth(title, url, width, height) {
                                top.layer.open({
                                    type: 2,
                                    area: [width, height],
                                    title: title,
                                    maxmin: true, //开启最大化最小化按钮
                                    content: url,
                                    btn: ['确定', '关闭'],
                                    yes: function (index, layero) {
                                        var iframeInnerWin = layero.find('iframe')[0].contentWindow;
                                        top.layer.close(index);
                                        var data = iframeInnerWin.getInnerVal();
                                        $('.tableItem').each(function (i, o) {
                                            if ($(this).attr('data-table') == 'clzbjh') {
                                                dgId = '#' + $(this).attr('id');
                                                var ParameArr = ["scscwd", "bsbswd"];  //获取到调整之后的月计划数据  scscwd：实产（万吨）
                                                $(ParameArr).each(function (index, item) { //把获取的数据作为指定表格（#td0）的数据，重新对表格进行数据渲染。
                                                    $(dgId).datagrid('updateRow', {
                                                        index: index,
                                                        row: {monthPlan: data.colMonthVal[item]}
                                                    });
                                                });
                                                return false;
                                            }
                                        });
                                    },
                                    cancel: function (index) {
                                    }
                                });
                            }

                            var year = $('#whichYear', window.parent.document).val();
                            var month = $('#getMonth', window.parent.document).val();
                            var yearId = $('#yearPlan option:selected', window.parent.document).val();
                            if (year != "" && month != "" && yearId != "") {
                                adjustMonth(year + "年月计划", "producePlan/monthAdjust.html?year=" + year + "&month=" + month + "&yearId=" + yearId, "1230px", "500px");
                                year = '';
                                month = '';
                                yearId = '';
                            } else {
                                var alertText = "";
                                if (yearId == "") {
                                    alertText = "年计划";
                                } else if (month == "") {
                                    alertText = "计划周期";
                                }
                                Mom.layAlert(alertText + "选择之后才可进行调整操作！")
                            }
                        });
                    }
                });
                //权限
                Bus.permissionContorl('PPMMPP_PAC', btnArr);

                $(".btn-save").click(function () {
                    if (!checkSave()) {
                        return;
                    }
                    submitData("0");
                });

                window.submitFn = function () {
                    if (!checkSave()) {
                        return;
                    }
                    if (monthName == "") {
                        Mom.layAlert('月计划名称不能为空！');
                        return;
                    }

                    var checkFlag = easyui.dg_eachCheckDataGrid(checkDGArr);
                    if (checkFlag == false) {
                        return false;
                    }
                    Mom.layConfirm("确认提交吗?", function () {
                        submitData("1");
                        return true;
                    });

                };

                //保存
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

                //提交
                function submitData(status) {
                    var editItems = easyui.dg_getAllData();
                    var data = {
                        "status": status,
                        "adYear": year,
                        "adMonth": month,
                        "yearId": yearId,
                        "monthName": monthName,
                        "mainId": id,
                        "techPlans": JSON.stringify(editItems)
                    };
                    console.log(data);
                    // return false;
                    Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustTech/saveTechInfo", data, function (result) {
                        if (result.success) {
                            var msgStr = status == '0' ? '保存成功!' : "提交成功，即将返回月计划列表页面!";
                            top.layer.msg(msgStr, {
                                icon: 1,
                                time: 500
                            });
                            var mainId = $('#mainId', window.parent.document).val();
                            if (!mainId) {
                                $('#mainId', window.parent.document).val(result.mainId);
                                $("#yearPlan,#getMonth", window.parent.document).attr("disabled", "disabled").css({"cursor": "not-allowed"});
                            }
                            setTimeout(function () {
                                if (status == '0') {
                                    location.href = location.href;
                                } else {
                                    top.TabsNav.refreshActiveTab();
                                }
                            }, 1000)
                        }
                    });
                }
            });
        },

    };

    $(function () {
        //全厂主要生产技术指标计划
        if ($('#proTechTarget').length > 0) {
            PageModule.proTechTargetInit();
        }
        //全厂主要生产技术指标计划(新增、编辑)
        else if ($('#proTechTargetEdit').length > 0) {
            PageModule.proTechTargetEInit();
        }
    });
});