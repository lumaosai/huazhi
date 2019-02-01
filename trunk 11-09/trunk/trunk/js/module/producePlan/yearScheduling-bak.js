require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        /**年计划排产*/
        yearSchedulingInit: function () {
            require(['easyui_my'],function(easyui){
                var id = Mom.getUrlParam('id');
                var status = Mom.getUrlParam('status');

                if (status == 2) {
                    $(".btn").hide();
                }
                PageModule.initData(id);
                //原料计划
                $("#td1").datagrid({
                    fitColumns: true,
                    collapsible: true,
                    singleSelect: true,
                    onClickRow: function (index) {
                        easyui.dg_startEditing(index, "#td1")
                    },
                    //创建table
                    columns: [[
                        {field: 'id', title: 'id',"hidden": true},
                        {field: 'mainId', title: 'mainId',"hidden": true},
                        {field: 'pName', title: '', width: 220, align: 'center'},
                        {field: 'itemName', title: '', width: 150, align: 'center'},
                        {field: 'value1', title: '1月', width: 110, align: 'center'},
                        {field: 'value2', title: '2月', width: 110, align: 'center'},
                        {field: 'value3', title: '3月', width: 110, align: 'center'},
                        {field: 'value4', title: '4月', width: 110, align: 'center'},
                        {field: 'value5', title: '5月', width: 110, align: 'center'},
                        {field: 'value6', title: '6月', width: 110, align: 'center'},
                        {field: 'value7', title: '7月', width: 110, align: 'center'},
                        {field: 'value8', title: '8月', width: 110, align: 'center'},
                        {field: 'value9', title: '9月', width: 110, align: 'center'},
                        {field: 'value10', title: '10月', width: 110, align: 'center'},
                        {field: 'value11', title: '11月', width: 110, align: 'center'},
                        {field: 'value12', title: '12月', width: 110, align: 'center'},
                        {field: 'valueSum', title: '合计', width: 130, align: 'center'}
                    ]],
                    onAfterEdit: function (rowIndex, rowData, changes) {
                        easyui.dg_pushRowData(rowData);
                        easyui.dg_setEditIndex("#td1", undefined);
                        easyui.dg_mergeCells(loadedData, "#td1", "pName");
                    },
                    //合并单元格
                    onLoadSuccess: function (data) {
                        loadedData = data;
                        easyui.dg_mergeCells(data, "#td1", "pName");
                    },
                    toolbar: [{
                        text: '保存', iconCls: 'icon-save', handler: function () {
                            //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                            $('#td1').datagrid('endEdit', easyui.dg_getEditIndex("#td1"));
                        }
                    }]
                });
                // 消耗计划
                $("#td2").datagrid({
                    fitColumns: true,
                    collapsible: true,
                    singleSelect: true,
                    onClickRow: function (index) {
                        easyui.dg_startEditing(index, "#td2")
                    },
                    //创建table
                    columns: [[
                        {field: 'id', title: 'id', hideColumn: 'id'},
                        {field: 'mainId', title: 'mainId', hideColumn: 'mainId'},
                        {field: 'pName', title: '', width: 150, align: 'center'},
                        {field: 'itemName', title: '', width: 150, align: 'center'},
                        {field: 'value1', title: '1月', width: 110, align: 'center'},
                        {field: 'value2', title: '2月', width: 110, align: 'center'},
                        {field: 'value3', title: '3月', width: 110, align: 'center'},
                        {field: 'value4', title: '4月', width: 110, align: 'center'},
                        {field: 'value5', title: '5月', width: 110, align: 'center'},
                        {field: 'value6', title: '6月', width: 110, align: 'center'},
                        {field: 'value7', title: '7月', width: 110, align: 'center'},
                        {field: 'value8', title: '8月', width: 110, align: 'center'},
                        {field: 'value9', title: '9月', width: 110, align: 'center'},
                        {field: 'value10', title: '10月', width: 110, align: 'center'},
                        {field: 'value11', title: '11月', width: 110, align: 'center'},
                        {field: 'value12', title: '12月', width: 110, align: 'center'},
                        {field: 'valueSum', title: '合计', width: 120, align: 'center'}
                    ]],
                    onAfterEdit: function (rowIndex, rowData, changes) {
                        easyui.dg_pushRowData(rowData);
                        easyui.dg_setEditIndex("#td2", undefined);
                    },
                    toolbar: [{
                        text: '保存', iconCls: 'icon-save', handler: function () {
                            //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                            $('#td2').datagrid('endEdit', easyui.dg_getEditIndex("#td2"));
                        }
                    }]
                });
                $('#td1,#td2').datagrid('hideColumn', 'id');
                $('#td1,#td2').datagrid('hideColumn', 'mainId');
                PageModule.hidebutton();////////////权限
                //点击时获取到信息
                $(".btn-save").click(function (e) {
                    var btn = $(e.target).context.textContent;
                    if (btn == "保存") {
                        status = "0";
                        PageModule.addstatus(status)
                    } else {
                        status = "1";
                        PageModule.addstatus(status)
                    }
                });
                $(window).resize(function () {  //浏览器窗口改变时dataGrid数据重置
                    $('#td1,#td2').datagrid('resize');
                });

                $(".btn-back").click(function () {
                    Mom.winBack();
                });
            });
        },
        //初始化内容
        initData: function (id) {
            var year = Mom.getUrlParam('year');
            var pcId = Mom.getUrlParam('pcId') || '';
            var data = {
                id: id
            };
            Api.ajaxForm(Api.aps + "/api/aps/ApsYearPlan/getYearValue", data, function (result) {
                $('#scValue').val(result.yhlsc).attr('disabled', 'disabled').css({"cursor": "not-allowed"});
                $('#psValue').val(result.yhlps).attr('disabled', 'disabled').css({"cursor": "not-allowed"});
                var $scValue = $.trim($("#scValue").val()), $psValue = $.trim($("#psValue").val());
                if ($scValue !== "" && $psValue !== "") {
                    var data = {}, url = "";
                    if (pcId) {
                        data = {
                            yearId: id
                        };
                        url = Api.aps + '/api/aps/ApsMonthPc/queryMonthPc';
                        Api.ajaxJson(url, JSON.stringify(data), function (result) {
                            PageModule.fnCallback(result);
                        });
                    } else {
                        data = {
                            mYear: year,
                            scTotal: $scValue,
                            psTotal: $psValue,
                            id: id
                        };
                        url = Api.aps + '/api/aps/ApsMonthPc/pcJs';
                        Api.ajaxForm(url, data, function (result) {
                            PageModule.fnCallback(result);
                        });
                    }

                    //提交按钮
                    var validFlag = true;//保存时校验
                    $("#btn-save").click(function () {
                        if (!validFlag) {
                            return;
                        }
                        var data = {
                            status: "1",
                            mainId: $(".datagrid-body").find('td').eq(1).text()
                        };
                        Mom.layConfirm("确认提交吗?", function () {
                            Api.ajaxForm(Api.aps + "/api/aps/ApsMonthPc/saveMonthInfo", data, function (result) {
                                if (result.success) {
                                    Mom.winBack();
                                }
                            });
                            return true;
                        })
                    });

                } else {
                    Mom.layAlert("实产合计或焙烧合计数值不能为空!")
                }
            });
        },
        //回调函数
        fnCallback: function (result) {
            if (result.success) {
                //装置运转计划
                PageModule.renderTableFn_zzyzjh(result.zzyzjh);
                //绑定事件
                PageModule.tableEventBind();
                //原料计划
                $('#td1').datagrid('loadData', result.yljh);
                // PageModule.renderTableFn_yljh(result.yljh);
                //消耗计划
                $('#td2').datagrid('loadData', result.xhjh);
                // PageModule.renderTableFn_xhjh(result.xhjh);
            }
        },
        //装置运转计划
        renderTableFn_zzyzjh: function (zzyzjh) {
            var editEleArr = ["scjxsj", "scfzcjczhsj", "sczhb", "scshsc", "xsps", "bsjxsj", "ahzhxs", "bsfzcjczhsj"];
            var zzyzjhArr = [], zzyzjhiCodeArr = [];
            //装置运转计划
            for (var i = 0; i < zzyzjh.length; i++) {
                zzyzjhiCodeArr.push(zzyzjh[i].itemCode);
                var itemmsg = {
                    "id": {value: zzyzjh[i].id, hidden: true},
                    "mainId": {value: zzyzjh[i].mainId, hidden: true},
                    "itemCode": {value: zzyzjh[i].itemCode, hidden: true},
                    "itemName": {value: zzyzjh[i].itemName, title: ''},
                    "value1": {value: zzyzjh[i].value1, title: '<span>1</span>月', edit: true},
                    "value2": {value: zzyzjh[i].value2, title: '<span>2</span>月', edit: true},
                    "value3": {value: zzyzjh[i].value3, title: '<span>3</span>月', edit: true},
                    "value4": {value: zzyzjh[i].value4, title: '<span>4</span>月', edit: true},
                    "value5": {value: zzyzjh[i].value5, title: '<span>5</span>月', edit: true},
                    "value6": {value: zzyzjh[i].value6, title: '<span>6</span>月', edit: true},
                    "value7": {value: zzyzjh[i].value7, title: '<span>7</span>月', edit: true},
                    "value8": {value: zzyzjh[i].value8, title: '<span>8</span>月', edit: true},
                    "value9": {value: zzyzjh[i].value9, title: '<span>9</span>月', edit: true},
                    "value10": {value: zzyzjh[i].value10, title: '<span>10</span>月', edit: true},
                    "value11": {value: zzyzjh[i].value11, title: '<span>11</span>月', edit: true},
                    "value12": {value: zzyzjh[i].value12, title: '<span>12</span>月', edit: true},
                    "valueSum": {value: zzyzjh[i].valueSum, title: '合计'}
                };
                zzyzjhArr.push(itemmsg);
            }
            var theadHtml = "", bodyHtml = "";
            for (var i = 0; i < zzyzjhArr.length; i++) {
                var item = zzyzjhArr[i],
                    trClass = editEleArr.indexOf(item['itemCode'].value) > -1 ? "edit" : "";
                bodyHtml += "<tr class='" + trClass + " " + zzyzjhiCodeArr[i] + "' data-field='" + zzyzjhiCodeArr[i] + "'>";
                for (var key in item) {
                    var valObj = item[key];
                    var cssClass = (valObj.hidden && valObj.hidden == true) ? " hidden" : "";
                    if (key == 'itemName') {
                        cssClass += " auto-width fileLabel";
                    }
                    bodyHtml += "<td class='" + cssClass + "' >" + valObj.value + "</td>";
                }
                bodyHtml += "</tr>";
                if (i == 0) {
                    theadHtml += "<tr>";
                    for (var key in item) {
                        var valObj = item[key],
                            title = valObj['title'],
                            edit = valObj['edit'];
                        var disp = (valObj.hidden && valObj.hidden == true) ? " style='display: none;'" : "";
                        if (edit) {
                            title += " <i class='fa fa-edit'></i>";
                        }
                        theadHtml += "<th" + disp + ">" + title + "</th>";
                    }
                    theadHtml += "</tr>";
                }
            }
            $('#td0 thead').html(theadHtml);
            $('#td0 tbody').html(bodyHtml);
            PageModule.editTable.tdEdit("#td0");
        },
        //编辑表格方法集合
        editTable: {
            editCol: -1,
            tdEdit: function (tableObj) {
                var numTds = $(tableObj).find('tbody tr.edit td');
                numTds.click(function () {
                    PageModule.editTable.endEdit(tableObj);
                    //找到当前鼠标点击的td,this对应的就是响应了click的那个td
                    var tdObj = $(this);
                    if (tdObj.children("input").length > 0) {
                        //当前td中input，不执行click处理
                        return false;
                    }
                    // alert(editTable.editCol);

                    if (PageModule.editTable.editCol > -1 && tdObj.index() == PageModule.editTable.editCol) {
                        var text = tdObj.html();
                        //清空td中的内容
                        tdObj.html("");
                        //创建一个文本框
                        //去掉文本框的边框
                        //设置文本框中的文字字体大小是12px
                        //使文本框的宽度和td的宽度相同
                        //设置文本框的背景色
                        //需要将当前td中的内容放到文本框中
                        //将文本框插入到td中
                        var inputObj = $("<input type='text' value='" + text + "'>").css({
                            "width": "90px",
                            "height": "40px",
                            "font-size": "12px",
                            "text-align": "center",
                            "font-weight": "bold"
                        })
                        // .width(tdObj.width())
                            .height(tdObj.height())
                            // .css("background-color", tdObj.css("background-color"))
                            .appendTo(tdObj);
                        //是文本框插入之后就被选中
                        // inputObj.trigger("focus").trigger("select");
                        inputObj.click(function () {
                            return false;
                        });
                        //处理文本框上回车和esc按键的操作
                        inputObj.keyup(function (event) {
                            //获取当前按下键盘的键值
                            var keycode = event.which;
                            //处理回车的情况
                            if (keycode == 13) {
                                //获取当当前文本框中的内容
                                var inputtext = $(this).val();
                                //将td的内容修改成文本框中的内容
                                tdObj.html(inputtext);
                            }
                            //处理esc的情况
                            if (keycode == 27) {
                                //将td中的内容还原成text
                                tdObj.html(text);
                            }
                        });
                    }
                });
            },
            endEdit: function (tableObj) {
                var numTdInputs = $(tableObj).find('tbody tr.edit td input');
                $(numTdInputs).each(function () {
                    var tdObj = $(this).parent();
                    if (tdObj.index() != PageModule.editTable.editCol) {
                        tdObj.html($(this).val());
                    }

                });

            }
        },
        //绑定事件
        tableEventBind: function () {
            $('#td0').on('blur', 'input', function () {
                var defaultVal = this.defaultValue,
                    newVal = $(this).val();
                if (defaultVal != newVal) {
                    $(this).addClass('edited');
                } else {
                    $(this).removeClass('edited');
                }
            });

            //鼠标经过时显示编辑按钮
            $("#td0 thead th").hover(function () {
                $(this).find('i.fa-edit').fadeIn();
            }, function () {
                $(this).find('i.fa-edit').fadeOut();
            });

            //编辑/保存按钮事件
            $("#td0 thead th i").click(function () {
                var _this = this;
                //获取当前处于编辑状态的列索引
                var editColIndex = $(_this).parent('th').index();

                //编辑
                if ($(_this).hasClass('fa-edit')) {
                    //检查是否有正在编辑中的列
                    var editingIcons = $("#td0").find('thead th i.fa-save');
                    if (editingIcons.length > 0) {
                        Mom.layConfirm('有未保存的月份，要保存吗？', function () {
                            $(editingIcons[0]).trigger('click').fadeOut();
                            return true;
                        });
                    } else {
                        PageModule.editTable.editCol = editColIndex;
                        console.log(PageModule.editTable.editCol);
                        //设置单元格编辑效果
                        $("#td0").find('tbody tr.edit td').trigger('click');
                        $(this).removeClass('fa-edit').addClass('fa-save');
                    }
                }
                //保存
                else {
                    //调用接口保存数据
                    var year = Mom.getUrlParam('year');
                    var id = Mom.getUrlParam('id');
                    var changeVlaArr = [];
                    var getMonthObj = {
                        mYear: year,
                        flag: $(this).parent().find('span').text(),
                        signFlag: true,
                        yearId: id
                    };
                    var trArr = $('#td0 tbody tr');
                    for (var i = 0; i < trArr.length; i++) {
                        var tro = trArr[i];
                        var field = $(tro).attr('data-field'),
                            tdEq = $(tro).find('td').eq(editColIndex),
                            fieldLabel = $(tro).find('.fileLabel').text(),
                            fieldVal = '';
                        console.log(tdEq,fieldLabel);
                        if (tdEq.children().length) {
                            //获取td中的input输入框
                            fieldVal = tdEq.find('input').val();
                            if (field == 'ahzhxs' && fieldVal <= 0) {
                                Mom.layMsg(fieldLabel + ' 的值必须大于0！');
                                return false;
                            }
                            //焙烧炉检修时间（天） <= 日历天数h
                            if (field == 'bsjxsj') {
                                //获取日历天数
                                var scrlts = PageModule.getEditColFieldVal('scrlts', editColIndex);
                                if (fieldVal > scrlts) {
                                    Mom.layMsg(fieldLabel + ' 的值不能大于日历天数！');
                                    return false;
                                }
                            }
                            //进行校验
                            if (fieldVal < 0) {
                                Mom.layMsg(fieldLabel + ' 的值必须大于0！');
                                return false;
                            }

                        } else {
                            fieldVal = tdEq.html();
                        }
                        getMonthObj[field] = fieldVal;
                    }

                    changeVlaArr.push(getMonthObj);
                    var data_ = JSON.stringify(changeVlaArr);
                    //计算数据接扣
                    Api.ajaxJson(Api.aps + "/api/aps/ApsMonthPc/dtpcJs", data_, function (result) {
                        if (result.success == true) {
                            // 记录计算之后的数据
                            var valArr = result.value, valSumArr = result.valueSum;
                            var oldShiChan = $('#scValue').val(), oldBeishao = $('#psValue').val();
                            var newShichan = valSumArr[0].scscwd, newBeishao = valSumArr[0].bsbswd;
                            var shichanBH = (newShichan < oldShiChan) ? '<b style="color:red">↓</b>' : '<b>↑</b>',
                                beishaoBH = (newBeishao < oldBeishao) ? '<b style="color:red">↓</b>' : '<b>↑</b>';
                            var str = '实产：' + oldShiChan + ' ---- ' + newShichan + '（' + shichanBH + '）<br>';
                            str += '焙烧：' + oldBeishao + ' ---- ' + newBeishao + '（' + beishaoBH + '）<br>';
                            top.layer.confirm(str + ' 确定吗？', {icon: 3, title: '系统提示'}, function (index, layero) {
                                var saveData = {
                                    yearId: id, value: JSON.stringify(valArr), valueSum: JSON.stringify(valSumArr)
                                };
                                Api.ajaxForm(Api.aps + '/api/aps/ApsMonthPc/saveDtpcJs', saveData, function (result) {
                                    if (result.success) {
                                        PageModule.renderTableFn_zzyzjh_js('#td0', valArr, valSumArr);
                                        $(_this).removeClass('fa-save').addClass('fa-edit');

                                    } else {
                                        layerAlert(result.message)
                                    }
                                });
                                top.layer.close(index);

                            }, function () {
                                // initData();
                            });
                        } else {
                            Mom.layAlert(result.message)
                        }
                    });

                }
            });
            $("#td0 td").hover(function () { //装置运转计划table添加划过效果。
                $(this).parent('tr').addClass('active').siblings('tr').removeClass('active');
            }, function () {
                $("#td0 tr").removeClass('active');
            });
            $("#td0 thead th").eq(3).find('i').hide();
        },
        /***获取当前处于编辑状态列的指定字段的值*/
        getEditColFieldVal: function (field, editColIndex) {
            var fieldVal = '';
            var tdEq = $('#td0 tbody tr.' + field).children('td').eq(editColIndex);
            if (tdEq.children().length) {
                fieldVal = tdEq.find('input').val();
            } else {
                fieldVal = tdEq.html();
            }
            return fieldVal;
        },
        //装置运转计划方法
        renderTableFn_zzyzjh_js: function (tableId, valueArr, valueSumArr) {
            var table = $(tableId);
            $(valueArr).each(function (i, vo) {
                //获取value中的月份
                var editMonth = vo.flag;
                //根据编辑的月份找到当前可编辑的列
                var editColIdx;
                var ths = table.find('thead span');
                for (var ii = 0; ii < ths.length; ii++) {
                    if ($(ths[ii]).text() == editMonth) {
                        editColIdx = $(ths[ii]).parents('th').index();
                        break;
                    }
                }

                if (editColIdx) {
                    table.find('tbody tr').each(function (j, tro) {
                        var tdObject = $(tro).find('td').eq(editColIdx);
                        var val = '';
                        for (var key in vo) {
                            if ($(tro).attr('data-field') == key) {
                                val = vo[key];
                            }
                        }
                        //将计算后的结果回显到td里
                        $(tdObject).html(val);
                    });
                    return false;
                    // table.find('thead th').eq(editColIdx).children('i').removeClass('fa-save').addClass('fa-edit')
                }
            });
            //合计
            if (valueSumArr && valueSumArr.length > 0) {
                var valueSum = valueSumArr[0];
                var sumColIdx = table.find('thead th').length - 1;
                table.find('tbody tr').each(function (j, tro) {
                    var tdObject = $(tro).find('td').eq(sumColIdx);
                    var val = '';
                    for (var key in valueSum) {
                        if ($(tro).attr('data-field') == key) {
                            val = valueSum[key];
                        }
                    }
                    //将计算后的结果回显到td里
                    $(tdObject).text(val);
                });
            }
        },
        //原料计划
        renderTableFn_yljh: function (yljh) {
            var yljhArr = [];
            for (var i = 0; i < yljh.length; i++) {
                var itemmsg = {
                    "id": yljh[i].id,
                    "mainId": yljh[i].mainId,
                    "pName": yljh[i].pName,
                    "itemName": yljh[i].itemName,
                    "value1": yljh[i].value1,
                    "value2": yljh[i].value2,
                    "value3": yljh[i].value3,
                    "value4": yljh[i].value4,
                    "value5": yljh[i].value5,
                    "value6": yljh[i].value6,
                    "value7": yljh[i].value7,
                    "value8": yljh[i].value8,
                    "value9": yljh[i].value9,
                    "value10": yljh[i].value10,
                    "value11": yljh[i].value11,
                    "value12": yljh[i].value12,
                    "valueSum": yljh[i].valueSum
                };
                yljhArr.push(itemmsg);
            }
            $('#td1').datagrid('loadData', yljhArr);
        },
        //消耗计划
        renderTableFn_xhjh: function (xhjh) {
            var xhjhArr = [];
            for (var i = 0; i < xhjh.length; i++) {
                var itemmsg = {
                    "id": xhjh[i].id,
                    "mainId": xhjh[i].mainId,
                    "pName": xhjh[i].pName,
                    "itemName": xhjh[i].itemName,
                    "value1": xhjh[i].value1,
                    "value2": xhjh[i].value2,
                    "value3": xhjh[i].value3,
                    "value4": xhjh[i].value4,
                    "value5": xhjh[i].value5,
                    "value6": xhjh[i].value6,
                    "value7": xhjh[i].value7,
                    "value8": xhjh[i].value8,
                    "value9": xhjh[i].value9,
                    "value10": xhjh[i].value10,
                    "value11": xhjh[i].value11,
                    "value12": xhjh[i].value12,
                    "valueSum": xhjh[i].valueSum
                };
                xhjhArr.push(itemmsg);
            }
            $('#td2').datagrid('loadData', xhjhArr);
        },
        //将点击状态添加到数组里边
        addstatus: function (status) {
            var editItems = easyui.dg_getSaveItemArr();
            var data = {
                "techPlans": JSON.stringify(editItems),
                "status": status,
            };
            PageModule.addmsg(data)  //将数据发送给后台
        },
        //保存将数据发送给后台
        addmsg: function (data) {
            ajaxToServer1("/api/aps/ApsMonthAdjustTech/saveTechInfo", data, function (result) {
            })
        },
        //权限
        hidebutton: function () {
            var status = Mom.getUrlParam('status');
            if (status == "2") {
                $(".btn").hide();
                /*根据需求修改已排产返回按钮显示
                 * 日期：2018-6-28
                 * 制作人：贾旭光*/
                $("#back-btn").show();
            } else {
                var url = Api.admin + "/api/sys/SysOperation/currentUserOperation/PPMYPP_PAC";
                Api.ajaxJson(url, {}, function (result) {
                    if (result.success) {
                        if (result.rows.length > 0) {
                            for (var i = 0; i < result.rows.length; i++) {
                                if (result.rows[i].code == "PPMYPP_SDO") {//排产
                                    $("#btn-build").css("display", "inline-block")
                                }
                                ;
                                if (result.rows[i].code == "PPMYPP_SSO") { //提交
                                    $("#btn-save").css("display", "inline-block")
                                }
                                ;
                            }
                            ;
                        }
                    } else {
                        Mom.layAlert(result.message)
                    }
                })
            }
        }
    };
    $(function () {
        //参数配置列表
       if ($('#yearScheduling').length > 0) {
            PageModule.yearSchedulingInit()
        }
    });
});