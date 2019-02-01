require(['/js/zlib/app.js'], function (App) {
    Mom.include('apsCss','/css/',[
        'aps.css'
    ]);
    var PageModule = {
        init:function(){
            var id = Mom.getUrlParam('id');
            var status = Mom.getUrlParam('status');
            var year = Mom.getUrlParam('year');
            var pcId = Mom.getUrlParam('pcId') || '';
            var data = {
                id: id
            };
            //当状态为"已排产（status==2）"时不显示排产、提交按钮。
            if(status != "2"){
                var arr_ = [
                    {selector: '#btn-save', code: 'PPMYPP_SDO'},  //排产
                    {selector: '#btn-submit', code: 'PPMYPP_SSO'} //提交
                ];
                Bus.permissionContorl('PPMYPP_PAC', arr_);
            }
            Api.ajaxForm(Api.aps + "/api/aps/ApsYearPlan/getYearValue", data, function (result) {
                if(result.success){
                    $('#scValue').val(result.yhlsc);
                    $('#psValue').val(result.yhlps);
                    var $scValue = $.trim($("#scValue").val()), $psValue = $.trim($("#psValue").val());
                    if ($scValue !== "" && $psValue !== "") {
                        var data = {}, url = "";
                        if (pcId) {
                            data = {
                                yearId: id
                            };
                            url = Api.aps + '/api/aps/ApsMonthPc/queryMonthPc';
                            Api.ajaxJson(url, JSON.stringify(data), function (result) {
                                fnCallback(result);
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
                                fnCallback(result);
                            });
                        }

                        //提交按钮
                        var validFlag = true;//保存时校验
                        $("#btn-submit").click(function () {
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
                }

            });
            function fnCallback (result) {
                if (result.success) {
                    //装置运转计划
                    require(['editTable'],function(){
                        PageModule.renderTableFn_zzyzjh(result.zzyzjh);
                    });

                    //加载剩下的dataGrid列表
                    require(['easyui_my'],function(easyui){
                        PageModule.renderDataGridInit(easyui,result);
                    });

                    //注册事件
                    PageModule.eventBind();

                }
            }
        },

        //加载上边的装置运转计划列表（可编辑）
        renderTableFn_zzyzjh: function (zzyzjh) {
            render();
            tableEventBind();

            function render(){
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
                editTable.tdEdit("#td0");
            }
            function tableEventBind(){
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
                            editTable.editCol = editColIndex;
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
                        var trArr = $('#td0 tbody tr'), scrltsTr=$('#td0 tbody tr.scrlts');
                        for (var i = 0; i < trArr.length; i++) {
                            var tro = trArr[i];
                            var field = $(tro).attr('data-field'),
                                tdEq = $(tro).find('td').eq(editColIndex),
                                fieldLabel = $(tro).find('.fileLabel').text(),
                                fieldVal = '';
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
                                    var scrlts = editTable.getTdVal(scrltsTr, editColIndex);
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
                        //计算数据接口
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
                                    //保存数据的接口
                                    Api.ajaxForm(Api.aps + '/api/aps/ApsMonthPc/saveDtpcJs', saveData, function (result) {
                                        if (result.success) {
                                            renderTableFn_zzyzjh_js('#td0', valArr, valSumArr);
                                            $(_this).removeClass('fa-save').addClass('fa-edit');
                                        } else {
                                            Mom.layAlert(result.message)
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

            }
            //重新渲染"装置运转计划"列表中的"指定月份"这一列的数据以及"合计"列的数据
            function renderTableFn_zzyzjh_js (tableId, valueArr, valueSumArr) {
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
            }
        },

        //加载剩下的dataGrid列表
        renderDataGridInit: function(easyui,result){
            var columns = [[
                {field: 'id', title: 'id', hidden: true},
                {field: 'mainId', title: 'mainId', hidden: true},
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
            ]];
            //原料计划
            $("#td1").datagrid({
                fitColumns: true,
                collapsible: true,
                singleSelect: true,
                onClickRow: function (index) {
                    easyui.dg_startEditing(index, "#td1")
                },
                //创建table
                columns: columns,
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
            $('#td1').datagrid('loadData', result.yljh);
            // 消耗计划
            $("#td2").datagrid({
                fitColumns: true,
                collapsible: true,
                singleSelect: true,
                onClickRow: function (index) {
                    easyui.dg_startEditing(index, "#td2")
                },
                //创建table
                columns: columns,
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
            $('#td2').datagrid('loadData', result.xhjh);
            //浏览器窗口改变时dataGrid数据宽度重置
            easyui.dg_dataGridResize('.tableItem');

        },

        //注册事件
        eventBind: function(){
            $(".btn-back").click(function () {
                Mom.winBack();
            });
            //提交按钮
            $("#btn-submit").click(function () {
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
        }
    };

    $(function () {
        //参数配置列表
       if ($('#yearScheduling').length > 0) {
           PageModule.init();

        }
    });
});