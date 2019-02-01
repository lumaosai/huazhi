require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        ////重点工作计划
        KeyWorkPVInit:function(){
            require(['easyui_my'], function (easyui) {
                id = Mom.getUrlParam('id') || "";
                var dataGridOption ={
                    columns: [[
                        {field: 'id', title: 'id', hideColumn: 'id', class: "iCheck-helper",hidden:'true'},
                        {field: 'mainId', title: 'mainId', hideColumn: 'mainId',hidden:'true'},
                        {field: 'typeWork', title: '工作类别', width: 80, align: 'center'},
                        {field: 'workTarget', title: '工作目标（事项）', width: 100, align: 'left'},
                        {field: 'startTime', title: '开始日', width: 50, align: 'center'},
                        {field: 'endTime', title: '结束日', width: 50, align: 'center'},
                        {field: 'thoseResponsible', title: '责任人', width: 50, align: 'center'},
                        {field: 'checkPeople', title: '检查人', width: 50, align: 'center'},
                        {field: 'remark', title: '备注', width: 80, align: 'center'}
                    ]]
                };
                Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustZdgz/queryMonthAdjustZdgz?mainId=" + id, {}, function (result) {
                    if (result.success) {
                        var rowsLen = result.rows?result.rows.length:0;
                        if (rowsLen > 0) {
                            $('.datagridsContent').empty();
                            var ii = 0;
                            for (var i = 0; i < rowsLen; i++) {
                                var itemData = result.rows[i];
                                var html = $('<div class="tableItemBox"><table id="td' + ii + '" class="tableItem" ></table></div>');
                                $('.datagridsContent').append(html);
                                var tdCfg_ = easyui.dg_dataGridOptions('#td' + ii, itemData.key, dataGridOption.columns, ['typeWork']);
                                $('#td' + ii).datagrid(tdCfg_);
                                //渲染table
                                $('#td' + ii).datagrid('loadData', itemData.value);

                                ii++;
                            }
                            //浏览器窗口改变时dataGrid数据宽度重置
                            easyui.dg_dataGridResize('.tableItem');
                            Mom.setFrameHeight();
                            $('.noData').hide();
                        } else {
                            $('.noData').show();
                        }
                    }
                });
            });
        },
        //重点工作计划编辑
        KeyWorkPVEInit:function () {
            require(['easyui_my'], function (easyui) {
                require(['/js/dataGridCustom.js'], function () {
                    var year = $("#yearPlan option:selected", window.parent.document).attr('adyear') || '',
                        month = $("#getMonth", window.parent.document).val() || '',
                        monthName = $("#monthName", window.parent.document).val() || '',
                        id = $("#mainId", window.parent.document).val() || '',
                        yearId = $("#yearPlan", window.parent.document).val() || "";
                    var month_days;//每一个月份中存在的天数
                    //默认从本地文件中获取，后续可以从后台获取精确的月份数据
                    $.ajax({
                        url: "../../json/monthvalue.json",//json文件位置
                        type: "GET",//请求方式为get
                        dataType: "json",
                        success: function (data) {
                            month_days = data;
                        }
                    });

                    //添加导入点击事件,弹窗
                    /**初始化方法**/
                    function initFn() {
                        if (id) {
                            Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustZdgz/queryMonthAdjustZdgz?mainId=" + id, {}, function (result) {
                            if (result.success) {
                                var dataGridOption ={
                                    columns: [[
                                        {field: 'id', title: 'ck', checkbox: true, sClass: "i-checks"},
                                        {field: 'mainId', title: 'mainId', hidden: true},
                                        {field: 'typeWork', title: '工作类别', width: 80, align: 'center'},
                                        {field: 'workTarget', title: '工作目标（事项）',  width: 100, align: 'left'},
                                        {
                                            field: 'startTime', title: '开始日', width: 50, align: 'center',
                                            editor: {
                                                type: 'combobox',
                                                options: {
                                                    data: month_days,
                                                    valueField: "key",
                                                    textField: "key",
                                                    editable: false
                                                }
                                            }
                                        },
                                        {
                                            field: 'endTime', title: '结束日', width: 50, align: 'center',
                                            editor: {
                                                type: 'combobox',
                                                options: {
                                                    data: month_days,
                                                    valueField: "key",
                                                    textField: "key",
                                                    editable: false
                                                }
                                            }
                                        },
                                        {field: 'thoseResponsible', title: '责任人',  width: 50, align: 'center'},
                                        {field: 'checkPeople', title: '检查人',  width: 50, align: 'center'},
                                        {field: 'remark', title: '备注',width: 80, align: 'center'}
                                    ]],
                                    editArr:[
                                        { "field":"workTarget","editor":{"type": "text"} },
                                        { "field":"thoseResponsible","editor":{"type": "text"} },
                                        { "field":"checkPeople","editor":{"type": "text"} },
                                        { "field":"remark","editor":{"type": "text"} }
                                    ],
                                };
                                var rowsLen = result.rows?result.rows.length:0;
                                if (rowsLen > 0) {
                                    $('.datagridsContent').empty();
                                    var len = result.rows.length > 0 ? result.rows.length : 0;
                                    var ii = 0;
                                    for (var i = 0; i < len; i++) {
                                        var itemData = result.rows[i];
                                        var html = $('<div class="tableItemBox"><table id="td' + ii + '" class="tableItem" ></table></div>');
                                        $('.datagridsContent').append(html);
                                        var tdCfg_ = easyui.dg_dataGridOptions('#td' + ii, itemData.key, dataGridOption.columns, ['typeWork']);
                                        $('#td' + ii).datagrid(tdCfg_);
                                        //渲染table
                                        $('#td' + ii).datagrid('loadData', itemData.value);
                                        //设置字段可编辑
                                        $('#td' + ii).datagrid('addEditor', dataGridOption.editArr);
                                        ii++;
                                    }
                                    //浏览器窗口改变时dataGrid数据宽度重置
                                    easyui.dg_dataGridResize('.tableItem');
                                    Mom.setFrameHeight();
                                    $(".btn-delete,.btn-save").show();
                                    $('.noData').hide();
                                } else {
                                    $('.noData').show();
                                }
                            }
                            });
                        } else {
                            $('.noData').show();
                        }
                    }

                    initFn();

                    /*** 1：添加数据**/
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

                    //添加按钮
                    $(".btn-add").click(function () {
                        if (!checkSave()) {
                            return;
                        }
                        Bus.openEditDialog('添加' + year + '年' + month + '月重点工作计划', 'producePlan/KeyPlanAddition.html?id=' + id
                            + '&yearId=' + yearId + '&year=' + year + '&month=' + month + '&monthName=' + escape(monthName), '900px', '500px', doSubm);
                    });

                    /**1：保存数据**/
                    $(".btn-save").click(function () {
                        var flag = false;
                        $.each(easyui.dg_getSaveItemArr(), function (index, row) {
                            if (!row.workTarget) {
                                flag = true;
                                return;
                            }
                            if (row.startTime && row.endTime && row.startTime > row.endTime) {
                                flag = true;
                                return;
                            }
                        });

                        if (flag) {
                            Mom.layAlert('工作目标不可以为空，并且开始日不可以大于结束日');
                            return;
                        }
                        postData()
                    });

                    /**删除按钮**/
                    $(".btn-delete").click(function () {
                        deleteDateRow();
                    });
                    //删除指定一行数据
                    function deleteDateRow() {
                        var ids = '';
                        $('.tableItem').each(function (i, item) {
                            var _tableId = '#td' + i;
                            var rows = $(_tableId).datagrid('getChecked');
                            for (var i = 0; i < rows.length; i++) {
                                ids += ',' + rows[i].id;
                            }
                        });
                        if (ids.length > 0) {
                            ids = ids.substring(1);
                            Mom.layConfirm("确认要删除吗？", function (layIndex, layero) {
                                //    删除接口
                                Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustZdgz/delete", {ids: ids}, function (result) {
                                    if(result.success){
                                        Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustZdgz/queryMonthAdjustZdgz?mainId=" + id, {}, function (res) {
                                            if (res.success) {
                                                location.href = location.href;
                                            }
                                            top.layer.close(layIndex);
                                        });
                                    }
                                });
                            });
                        } else {
                            Mom.layAlert('请至少选择一行!');
                        }
                    }

                    /*** 2：取消其他Grid的选中和编辑状态**/
                    function clearOtherGridSelections(tableID) {
                        $(".tableItem").each(function (i) {
                            if (tableID != ('#td' + i)) {
                                var row = $('#td' + i).datagrid('getSelected');
                                var rowIndex = $('#td' + i).datagrid('getRowIndex', row);
                                $('#td' + i).datagrid('endEdit', rowIndex);
                                $('#td' + i).datagrid('clearSelections');
                            }
                        });
                    }

                    /*** 点击保存时调用方法*/
                    function postData() {
                        var editItems = easyui.dg_getAllData();
                        var data = {
                            "breakingNews": JSON.stringify(editItems)
                        };
                        Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustZdgz/updateBreakingNews", data, function (result) {
                            //编辑保存接口
                            if (result.success) {
                                top.layer.msg('保存成功!', {
                                    icon: 1,
                                    time: 500
                                });
                                setTimeout(function () {
                                    location.href = location.href;
                                }, 600)
                            }
                        });
                    }

                    /**新增窗口点击确定按钮调用方法*/
                    function doSubm(index, layro) {
                        var iframeWin = layro.find('iframe')[0].contentWindow;
                        iframeWin.doSubmitForm(index, function (result) {
                            var mainId = $('#mainId', window.parent.document).val();
                            if (!mainId) {
                                $('#mainId', window.parent.document).val(result.mainId);
                                $("#yearPlan,#getMonth", window.parent.document).attr("disabled", "disabled").css({"cursor": "not-allowed"});
                            }
                            location.href = location.href;

                        });
                    }
                })
            });
        },
        //重点工作计划弹出页
        keyPlanAddInit:function () {
            require(['easyui_my'], function (easyui) {
                $('#inputForm').attr('action', Api.aps + '/api/aps/ApsMonthAdjustZdgz/saveBreakingNews');
                var year = Mom.getUrlParam('year') || '',
                    month = Mom.getUrlParam('month') || '',
                    monthName = Mom.getUrlParam('monthName') || '',
                    id = Mom.getUrlParam('id') || '',
                    yearId = Mom.getUrlParam('yearId') || "";
                var selectionIndex = -1;
                var month_days;//每一个月份中存在的天数
                var unitArr = [];//单位
                var typeWorkArr = [];//工作类别
                var zrrArr = [];  //责任人
                var zjrArr = [];  //负责人
                //默认从本地文件中获取，后续可以从后台获取精确的月份数据
                $.ajax({
                    url: "../../json/monthvalue.json",//json文件位置
                    type: "GET",//请求方式为get
                    dataType: "json",
                    success: function (data) {
                        month_days = data;
                    }
                });

                function getDataGrid() {
                    Api.ajaxForm(Api.aps + '/api/aps/ApsMonthAdjustZdgz/queryMonthAdjustZdgzToAdd', {}, function (result) {
                        if (result.success) {
                            //获取单位集合
                            $.each(result.zdgzList, function (i, o) {
                                unitArr.push({key: o.key, value: o.key});
                            });
                            //设置工作类别对象
                            typeWorkObj = {};
                            $.each(result.zdgzList, function (i, o) {
                                var p = o.key, pv = o.value;
                                var valArr = typeWorkObj[p] || [];
                                $.each(pv, function (i2, o2) {
                                    valArr.push({key: o2, value: o2});
                                });
                                typeWorkObj[p] = valArr;
                            });
                            //获取责任人集合
                            $.each(result.zrrList, function (i, o) {
                                zrrArr.push({key: o, value: o});
                            });
                            //获取质检人集合
                            $.each(result.zjrList, function (i, o) {
                                zjrArr.push({key: o, value: o});
                            });

                            dataGrid('#td0');
                            $(".btn-add").click(function () {
                                getTableData();

                            });
                            getTableData();  //渲染表格数据

                            //删除
                            $(".btn-delete").click(function () {
                                $('#td0').datagrid('deleteRow', selectionIndex);
                                selectionIndex = selectionIndex - 1;
                                if (selectionIndex > -1) {
                                    $('#td0').datagrid('selectRow', selectionIndex);
                                }
                            });
                            //增加
                            $(".btn-save").click(function () {
                                var rows = $('#td0').datagrid('getRows');
                                var data = {
                                    "mainId": id,
                                    "techPlans": JSON.stringify(rows)
                                };
                            });
                            //导入
                            $(".dropUpLoader").on("click", function () {
                                var p_ = top;
                                p_.layer.open({
                                    type: 2,
                                    area: ['640px', '400px'],
                                    title: "拖拽上传",
                                    content: 'producePlan/monthkeyPlanTemplate.html?',
                                    btn: ['确定', '关闭'],
                                    yes: function (index, layero) { //或者使用btn1
                                        var innerWindow = layero.find("iframe")[0].contentWindow;
                                        var data = innerWindow.getUploadMsg();
                                        if (data.length < 0) {
                                            //弹出当前没有导入数据
                                        } else {
                                            for (var i = 0; i < data.length; i++) {
                                                for (var j = 0; j < data[i].length; j++) {
                                                    getTableData(data[i][j]);
                                                }
                                            }
                                            top.layer.close(index);
                                        }
                                    },
                                    cancel: function (index) { //或者使用btn2
                                    }
                                });
                            });

                        }
                    });
                }

                getDataGrid();

                //像表格中动态添加数据
                function appendRowToData(obj) {
                    $('#td0').datagrid('appendRow', {
                        unit: obj.unit,
                        typeWork: obj.typeWork,
                        workTarget: obj.workTarget || '',
                        startTime: obj.startTime || '01',
                        endTime: obj.endTime || '20',
                        thoseResponsible: obj.personLiable,
                        checkPeople: obj.checkPeople,
                        remark: obj.remark || ''
                    });
                    selectionIndex++;
                    $('#td0').datagrid('selectRow', selectionIndex);
                    $('#td0').datagrid('beginEdit', selectionIndex);
                }

                /*页面初始化时默认显示一条待增加的数据*/
                var InitObj = {};

                function getTableData(rows) {
                    if (selectionIndex == -1) {//如果是第一行
                        InitObj = {unit: '生产管控中心', typeWork: '技术中心', personLiable: '', checkPeople: ''};
                        appendRowToData(InitObj);
                        return;
                    } else {
                        $('#td0').datagrid('endEdit', selectionIndex);
                        var data = $('#td0').datagrid('getData');
                        var row;
                        if (rows != undefined) {
                            row = rows;
                            InitObj = {
                                'unit': row.unit,
                                'typeWork': row.typeWork,
                                'workTarget': row.workTarget,
                                'startTime': row.startTime,
                                'endTime': row.endTime,
                                'personLiable': row.thoseResponsible,
                                'checkPeople': row.checkPeople,
                                'remark': row.remark
                            };
                        } else {
                            row = data.rows[data.rows.length - 1];
                            InitObj = {
                                'unit': row.unit,
                                'typeWork': row.typeWork,
                                'personLiable': row.thoseResponsible,
                                'checkPeople': row.checkPeople
                            };
                        }
                        appendRowToData(InitObj);
                    }
                }

                function endRowEdit(tableID) {
                    var rows = $(tableID).datagrid('getRows');
                    $.each(rows, function (i, o) {
                        $(tableID).datagrid('endEdit', i);
                    });
                    return rows;
                }

                //在制定的位置渲染Grid
                //这里面存在一个bug，在编辑当前Grid的时候，其他Grid应处于不编辑状态
                function dataGrid(tableID) {

                    var loadedData;
                    //Grid需要定制
                    $(tableID).datagrid({
                        fitColumns: true,
                        collapsible: true,
                        singleSelect: true,
                        onClickRow: function (index) {
                            selectionIndex = index;//记录当前选中的行
                            endRowEdit(tableID);
                            easyui.dg_startEditing(index, tableID);
                        },
                        //创建table
                        columns: [[
                            {
                                field: 'unit', title: '单位', width: 80, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: unitArr,
                                        valueField: "key",
                                        textField: "key",
                                        onChange: function (newVal, oldVal) {
                                            var typeWorkArr = typeWorkObj[newVal] || [];
                                            var target = $('#td0').datagrid('getEditor', {
                                                'index': selectionIndex,
                                                'field': 'typeWork'
                                            }).target;
                                            target.combobox('clear'); //清除原来的数据
                                            target.combobox('loadData', typeWorkArr);//联动下拉列表重载

                                        }
                                    }
                                }
                            },
                            {
                                field: 'typeWork', title: '工作类别', width: 80, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: typeWorkArr,
                                        valueField: "key",
                                        textField: "key",
                                        onLoadSuccess: function () {
                                            var data = $(this).combobox('getData');
                                            if (data.length) {
                                                $(this).combobox('setValue', data[0].key)
                                            }

                                        }
                                    }
                                }
                            },
                            {field: 'workTarget', title: '工作目标（事项）', editor: 'text', width: 100, align: 'left'},
                            {
                                field: 'startTime', title: '开始日', width: 50, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: month_days,
                                        valueField: "key",
                                        textField: "key",
                                        editable: false,
                                        onLoadSuccess: function () {
                                            var data = $(this).combobox('getData');
                                            $(this).combobox('setValue', data[0].key)
                                        }
                                    }
                                }
                            },
                            {
                                field: 'endTime', title: '结束日', width: 50, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: month_days,
                                        valueField: "key",
                                        textField: "key",
                                        editable: false,
                                        onLoadSuccess: function () {
                                            var data = $(this).combobox('getData');
                                            $(this).combobox('setValue', data[0].key)
                                        }
                                    }
                                }
                            },
                            {
                                field: 'thoseResponsible', title: '责任人', width: 50, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: zrrArr,
                                        valueField: "key",
                                        textField: "key"
                                    }
                                }
                            },
                            {
                                field: 'checkPeople', title: '检查人', width: 50, align: 'center',
                                editor: {
                                    type: 'combobox',
                                    options: {
                                        data: zjrArr,
                                        valueField: "key",
                                        textField: "key"
                                    }
                                }
                            },
                            {field: 'remark', title: '备注', editor: 'text', width: 80, align: 'center'}
                        ]],
                        onAfterEdit: function (rowIndex, rowData, changes) {
                            easyui.dg_pushRowData(rowData);
                            easyui.dg_setEditIndex(tableID, undefined);
                        },
                        //合并单元格
                        onLoadSuccess: function (data) {
                            loadedData = data;
                        },
                        toolbar: [{
                            text: '保存', iconCls: 'icon-save', handler: function () {
                                //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                                $(tableID).datagrid('endEdit', easyui.dg_getEditIndex(tableID));
                            }
                        }]
                    });

                }

                /*得到传后台的表单--保存按钮*/
                window.doSubmitForm = function (layIndex, fn) {
                    var rows = endRowEdit($('#td0'));
                    if (rows.length == 0) {
                        Mom.layAlert('请至少添加一行');
                        return;
                    }
                    var flag = true;
                    for (var i = 0; i < rows.length; i++) {
                        var rowNum = i + 1, row = rows[i];
                        if (!row.workTarget) {
                            flag = false;
                            Mom.layAlert('第' + rowNum + '行的工作目标不可以为空');
                            return;
                        }
                        if (row.startTime && row.endTime && row.startTime > row.endTime) {
                            flag = false;
                            Mom.layAlert('第' + rowNum + '行的开始日不可以大于结束日');
                            return;
                        }
                    }
                    if (flag) {
                        var data = {
                            "mainId": id,
                            "yearId": yearId,
                            "adMonth": month,
                            "adYear": year,
                            "monthName": monthName,
                            "breakingNews": JSON.stringify(rows)  //两个值赋到form表单上就ok
                        };
                        var formObj = $('#inputForm');
                        var url = formObj.attr('action');
                        Api.ajaxForm(url, data, function (result) {
                            if (result.success) {
                                top.layer.msg('保存成功!', {
                                    icon: 1,
                                    time: 500
                                });
                                if (fn) {
                                    setTimeout(fn(result), 2000);
                                }
                                top.layer.close(layIndex);
                            } else {
                                Mom.layAlert(result.message);
                            }
                        });
                    }
                }
            });
        },
    };

    $(function () {
        ////重点工作计划
        if ($('#KeyWorkPlanView').length > 0) {
            PageModule.KeyWorkPVInit();
        }
        //重点工作计划编辑
        else if ($('#KeyWorkPlanViewEdit').length > 0) {
            PageModule.KeyWorkPVEInit();
        }
        //重点工作计划弹出页
        else if ($('#keyPlanAddition').length > 0) {
            PageModule.keyPlanAddInit()
        }
    });
});