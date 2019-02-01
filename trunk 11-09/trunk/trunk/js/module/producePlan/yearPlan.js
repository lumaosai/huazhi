require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        /**描述：年计划列表*/
        checkDGArr:[],//提交时验证表单必填项
        //年计划列表
        yearPLInit: function () {
            PageModule.loadStatus();
            $("#yMPicker").val("");
            require(['datetimepicker'], function () {
                $("#yMPicker").datetimepicker({
                    format: "yyyy",
                    language: 'cn',
                    weekStart: 1,
                    pickTime: false,
                    autoclose: true,
                    startView: 4, //月视图
                    minView: "4",
                    bootcssVer: 3,
                    clearBtn: true,
                    forceParse: 0
                });
            });
            /*年计划按钮权限*/
            window.pageLoad = function () {
                var arr_ = [
                    {selector: '#btn-add', code: 'PPMYPP_ADO'},  //新增
                    {selector: '.btn-delete', code: 'PPMYPP_DLO'}, //删除
                    {selector: '.btn-compile', code: 'PPMYPP_MODO'}, //编辑
                    {selector: '.btn-review', code: 'PPMYPP_SDO'}  //排产
                ];
                var data = {
                    adYear: $("#yMPicker").val(),
                    status: $("#status").val()
                };
                require(['Page'], function () {
                    new Page().init(Api.aps + "/api/aps/ApsYearPlan/page", data, true, function (tableDate) {
                        for (var i = 0; i < tableDate.length; i++) {
                            if (tableDate[i].status == "0" && tableDate[i].monthPcStatus != "1") {
                                tableDate[i].status = "0"
                            } else if (tableDate[i].status == "1" && tableDate[i].monthPcStatus != "1") {
                                tableDate[i].status = "1"
                            } else if (tableDate[i].status == "1" && tableDate[i].monthPcStatus == "1") {
                                tableDate[i].status = "2"
                            }
                        }
                        PageModule.createTable(tableDate); //渲染表格数据
                        Bus.permissionContorl('PPMYPP_PAC', arr_);  //根据用户权限显示对应的操作按钮

                        // 对比页面
                        $(".btn-contrast").click(function () {
                            var attrArr = PageModule.getAttr($(this));
                            location.href = '../producePlan/yearPlanCompare.html?id=' + attrArr.id + '&year=' + attrArr.year;
                        });
                        // 查看
                        $(".btn-check").click(function () {
                            var attrArr = PageModule.getAttr($(this));
                            Bus.openDialog('查看年计划', 'producePlan/yearPlanView.html?id=' + attrArr.id + '&year=' + attrArr.year, '880px', '500px')
                        });
                        //删除
                        $(".btn-delete").click(function () {
                            var id = PageModule.getAttr($(this)).id;
                            Bus.deleteItem('确定要删除该计划', Api.aps + '/api/aps/ApsYearPlan/delete', {ids:id});
                        });
                        //编辑
                        $(".btn-edit").click(function () {
                            var attrArr = PageModule.getAttr($(this));
                            location.href = '../producePlan/yearPlanEdit.html?id=' + attrArr.id + '&year=' + attrArr.year;
                        });
                        //排产
                        $(".btn-review").click(function () {
                            var attrArr = PageModule.getAttr($(this));
                            location.href = '../producePlan/yearScheduling.html?id=' + attrArr.id + '&year=' + attrArr.year + '&status=' + attrArr.status + '&pcId=' + attrArr.pcId;
                        });
                    })
                })
            };
            pageLoad();
            $("#btn-add").click(function () {
                location.href = "./yearPlanEdit.html"
            });
        },
        //获取状态数据
        loadStatus: function () {
            var url_ = Api.admin + '/api/sys/SysDict/type/yearPlanStatus';
            Api.ajaxJson(url_, {}, function (result) {
                if (result.success) {
                    var rows = result.rows;
                    Bus.appendOptionsValue($('#status'), rows, 'value', 'label');
                } else {
                    Mom.layMsg(result.message);
                }
            });
        },
        //创建table
        createTable: function (tableDate) {
            $('#treeTable').dataTable({
                "bSort": true,
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0, 2, 4, 6]}
                ],
                "data": tableDate,
                "aoColumns": [
                    {
                        "data": "yearName", "orderable": false, "defaultContent": "", 'sClass': "yearName center ",
                        "render": function (data, type, row, meta) {
                            if (row.yearName == "") {
                                return row.period + "计划";
                            } else {
                                return row.yearName;
                            }
                        }
                    },
                    // {"data": "yearName",'sClass':"yearName center "},
                    {"data": "typeLabel", 'sClass': "center "},
                    {"data": "period", 'sClass': "center"},
                    {"data": "createUser", 'sClass': "center "},
                    {"data": "createDate", 'sClass': "center autoWidth"},
                    {
                        "data": 'status', "orderable": false, "defaultContent": "", 'sClass': "status center ",
                        "render": function (data, type, row, meta) {
                            var classSet = "", setText;
                            if (row.status == "0") {
                                setText = "草稿";
                                classSet = "col-999";
                            } else if (row.status == "1") {
                                setText = "已提交";
                                classSet = "col-51cd50";
                            } else if (row.status == "2") {
                                setText = "已排产";
                                classSet = "col-62b519";
                            }
                            return "<span class='" + classSet + "' data-status='" + row.status + "'>" + setText + "</span >";
                        }
                    },
                    {
                        "data": null, "orderable": false, "defaultContent": "", 'sClass': "center autoWidth",
                        "render": function (data, type, row, meta) {
                            var html = "";
                            if (row.status == "0") {
                                html = "<a class='btn btn-edit btn-compile'><i class='fa fa-edit'></i>编辑</a >" +
                                    "<a class='btn btn-delete'><i class='fa fa-trash'></i>删除</a >";
                            } else if (row.status == "1") {
                                html = "<a class='btn btn-review' ><i class='fa fa-file-text'></i>排产</a >";
                            } else {
                                html = "<a class='btn btn-review' ><i class='fa fa-file-text'></i>排产</a >";
                            }
                            return "<input type='hidden'  id=" + row.id + "  data-id='" + row.id + "'  data-year='" + row.adYear + "' data-month='" + row.adMonth + "' data-pcid='" + row.pcId + "' data-yearname='" + row.yearName + "' data-status='" + row.status + "' class='i-checks'>" +
                                "<a class='btn  btn-info btn-check' ><i class='fa fa-search-plus'></i>查看</a >" +
                                "<a class='btn  btn-contrast   btn-compile' ><i class='fa fa-balance-scale'></i>对比</a >" +
                                html;
                        }
                    }
                ]
            });
        },
        //获取id以及年份
        getAttr: function (obj) {
            var $iChecks = obj.parents("tr").find('.i-checks');
            var getAttrObj = {
                "id": $iChecks.attr('data-id'),
                "year": $iChecks.attr('data-year'),
                "month": $iChecks.attr('data-month'),
                "pcId": $iChecks.attr('data-pcid'),
                "yearName": $iChecks.attr('data-yearname'),
                "status": $iChecks.attr('data-status')
            };
            return getAttrObj;
        },
        /**描述：查看*/
        //查看
        yearPLCheckInit: function () {
            require(['easyui_my'],function(easyui){
                var year = Mom.getUrlParam('year'), id = Mom.getUrlParam('id') || '';
                $('.Planyears').empty().html(year);
                $(function () {
                    //导出
                    $('.btn-export').click(function () {
                        window.location.href = Api.aps + '/aps/PlanExport/yearPlanExport?id=' + id;
                    });
                });
                var data = {
                    id: id
                };
                Api.ajaxJson(Api.aps + "/api/aps/ApsYearPlan/queryYearPlan", JSON.stringify(data), function (result) {
                    if (result.success) {
                        $("#yearName").val(result.yearPlan.yearName);
                        var changeColTitleArr = [
                            {'ndyjcl': (year - 1) + '年预计计划', 'ncl': year + '年计划'}
                        ];
                        /*
                           * 读取json文件，渲染dataGrid数据
                           * $.parseJSON(JsonString);  获取数据需要将jsonstring格式转换为jsonobj
                         */
                        var len = result.row.length>0?result.row.length:0;
                        var jsonCfg = $.parseJSON(result.Template.jsonCfg);
                        var ii = 0;
                        for (var i = 0; i < len; i++) {
                            var itemData = result.row[i];
                            var itemCode = itemData.code;
                            var columnObj = jsonCfg[itemCode];
                            if (!columnObj) {
                                continue;
                            }
                            var merCellArr = columnObj.mergeCell || [];
                            var html = $('<div class="tableItemBox"><table id="td'+ii+'" class="tableItem" ></table></div>');
                            $('.datagridsContent').append(html);
                            var tdCfg_ = easyui.dg_dataGridOptions('#td'+ii, itemData.name, columnObj.columnArr,merCellArr);
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
                    }
                });
            });
        },

        /**描述：新增、修改*/
        //新增、修改
        yearPLUpdateInit: function () {
            require(['easyui_my'],function(easyui){
                var year = Mom.getUrlParam('year') || '',
                    id = Mom.getUrlParam('id') || '';
                var $yesteryear, $thisyear;
                if (id) {
                    $('#yMPicker').val(year).attr('disabled', 'disabled').css({"cursor": "not-allowed"});
                    $(".Moyear").text($("#yMPicker").val());
                } else {
                    $("#yearName").text('');
                }
                if (year) {
                    $yesteryear = year - 1;
                    $thisyear = year;
                } else {
                    $yesteryear = "去";
                    $thisyear = "今"
                }
                $(function () {
                    $(".btn-back").click(function () {
                        Mom.winBack()
                    });
                    //初始化权限
                    PageModule.btnPermission();

                });
                require(['datetimepicker'], function () {
                    $("#yMPicker").datetimepicker({
                        format: "yyyy",
                        language: 'cn',
                        weekStart: 1,
                        pickTime: false,
                        autoclose: true,
                        startView: 4, //月视图
                        minView: "4",
                        bootcssVer: 3,
                        forceParse: 0
                    });
                });
                var data = {
                    id: id
                };
                Api.ajaxJson(Api.aps + "/api/aps/ApsYearPlan/queryYearPlan", JSON.stringify(data), function (result) {
                    if (result.success) {
                        $("#yearName").val(result.yearPlan.yearName);

                        $('.datagridsContent').empty();

                        var changeColTitleArr = [    //要修改的表头信息
                            {'ndyjcl': $yesteryear + '年预计计划', 'ncl': $thisyear + '年计划'}
                        ];
                        /*
                           * 读取json文件，渲染dataGrid数据
                           * $.parseJSON(JsonString);  获取数据需要将jsonstring格式转换为jsonobj
                         */
                        var len = result.row.length > 0 ? result.row.length : 0;
                        var  jsonCfg= $.parseJSON(result.Template.jsonCfg);
                        var ii = 0;
                        for (var i = 0; i < len; i++) {
                            var itemData = result.row[i];
                            var itemCode = itemData.code;
                            var columnObj = jsonCfg[itemCode];
                            if (!columnObj) {
                                continue;
                            }
                            var html = $('<div class="tableItemBox"><table id="td'+ii+'" class="tableItem" data-table="'+itemCode+'"></table></div>');
                            $('.datagridsContent').append(html);
                            var merCellArr = columnObj.mergeCell || [];
                            var dgValidator = columnObj.validator;
                            if(!($.isEmptyObject(dgValidator))){ //$.isEmptyObject(data)  判断对象的是否为空，为空是放回值为true;
                                dgValidator.dgName = itemData.name;
                                dgValidator.dgId = '#td'+ii;
                                PageModule.checkDGArr.push(dgValidator);
                            }
                            var tdCfg_ = easyui.dg_dataGridOptions('#td'+ii, itemData.name, columnObj.columnArr,merCellArr);

                            $('#td' + ii).datagrid(tdCfg_);
                            //动态修改表头中某列（或多列）的值
                            editColumnTitle('#td' + i, changeColTitleArr[0]);
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
                                $(tdId).datagrid({ fitColumns:true});
                            }
                        }
                        PageModule.btnClick(easyui);
                    }
                });
                // //输入框change事件
                // 年份可以重复添加
                $("#yMPicker").change(function () {
                    $('#yearName').val($(this).val() + '年全年生产计划');
                    $(".Moyear").text($("#yMPicker").val());
                });
            });



        },
        //按钮集合
        btnClick: function (easyui) {
            //保存
            $(".btn-save").unbind('click').click(function (e) {
                if ($("#yMPicker").val() == "") {
                    Mom.layAlert("请选择具体年份之后才可以保存!");
                } else {
                    PageModule.postData(easyui,"0");
                }
            });
            //提交
            $(".btn-submit").unbind('click').click(function (e) {
                if ($("#yMPicker").val() == "") {
                    Mom.layAlert("请选择具体年份之后才可以提交!");
                } else {
                    PageModule.postData(easyui,"1");
                }
            });


        },
        // 将点击状态添加到数组里边
        postData: function (easyui,status) {
            if (status == "1") { //"提交"操作 状态为提交时判断要检查的dataGrid指定列中的值是否为空，若为空则将不执行return false之后的方法/表达式
                var checkFlag = easyui.dg_eachCheckDataGrid(PageModule.checkDGArr);
                if (checkFlag == false) {
                    return false;
                } else {
                    Mom.layConfirm("确认提交吗?</br><span style='color:red;'>温馨提示</span>：提交后数据将无法修改和删除，如误操作请联系管理员。", ajaxData);

                    return true;
                }
            } else {  //"保存"操作
                ajaxData();
            }

            function ajaxData() {
                var editItems = easyui.dg_getSaveItemArr();
                id = Mom.getUrlParam('id') || '';
                var data = {
                    "status": status,
                    "adYear": $("#yMPicker").val(),
                    "mainId": id,
                    "yearPlans": JSON.stringify(editItems),
                    "yearName": $("#yearName").val()
                };
                Api.ajaxForm(Api.aps + "/api/aps/ApsYearPlan/saveYearInfo", data, function (result) {
                    if (result.success) {
                        top.layer.msg('操作成功，即将返回月计划列表页！', {
                            icon: 1,
                            time: 800
                        });
                        setTimeout(function () {
                            Mom.winBack();
                        }, 1000)
                    } else {
                        top.layer.msg(result.message, {
                            icon: 2,
                            time: 800
                        });
                    }
                });
                return true;
            }
        },
        //初始化权限方法
        btnPermission: function () {
            var btnArr = [
                {selector: '.btn-submit', code: "PPMYPP_PSO"}   //调整按钮
            ];
            Bus.permissionContorl('PPMYPP_PAC', btnArr, function (retObj, rows) {
                if (rows.length > 0) {
                    //保存按钮权限
                    $(".btn-save").removeClass('hidden').css("display", "inline-block");
                }
            });
        },




        /**年计划对比*/
        yearPLCompareInit: function () {
            var year = Mom.getUrlParam('year');//创建年
            var id = Mom.getUrlParam('id');
            var newArr = []; // 存放每行的input值和对应的id
            var yearName = '', period = '';
            var obj = {};
            var data1 = {
                id: id,
                adYear: year
            };
            Api.ajaxJson(Api.aps + '/api/aps/MonthPcSc/form', JSON.stringify(data1), function (result) {
                if (result.success) {
                    var MonthPcScObj = result.MonthPcSc;
                    var data = MonthPcScObj.monthPcScContrastList;
                    yearName = MonthPcScObj.yearName;
                    period = MonthPcScObj.period;
                    var dbTit = yearName ? yearName : period;
                    $('#yearName').val(yearName);
                    $('#period').val(period);
                    if (data) {
                        var len = data.length;
                        if (len) {
                            data.forEach(function (item) {
                                if (item.itemName === '') {
                                    item.itemName = item.pName;
                                }
                            });
                            var obj = {
                                result: data
                            };
                            // 模板渲染数据
                            require(['/js/jsrender.min.js'], function () {
                                jsRenderTpl = $.templates('#j-specCard');
                                finalTpl = jsRenderTpl(obj);
                                $('#tab').html(finalTpl);
                                PageModule.getMonth(); // 获取当前月以后的实产不可编辑
                                PageModule.operationTab(function (newArr) {
                                    // 保存按钮
                                    $(".btn-save").unbind('click').click(function () {
                                        var result = JSON.stringify(newArr);
                                        var data = {
                                            id: id,
                                            mYear: year,
                                            yearName: $('#yearName').val(),
                                            period: $('#period').val(),
                                            monthPcScContrasts: result
                                        };
                                        newArr = []; // 重新赋值为空
                                        Api.ajaxForm(Api.aps + "/api/aps/MonthPcSc/save", data, function (result) {
                                            if (result.success) {
                                                top.layer.msg('操作成功，即将返回月计划列表页！', {
                                                    icon: 1,
                                                    time: 500
                                                });
                                                setTimeout(function () {
                                                    Mom.winBack();

                                                }, 600);
                                            } else {
                                                Mom.layAlert(result.message)
                                            }
                                        });
                                    });
                                });

                            });
                            //返回按钮
                            $(".btn-back").click(function () {
                                Mom.winBack();
                            });

                        }
                    }


                } else {
                    $('form').css('display', 'none');
                    Mom.layMsg(result.message + '2秒之后自动为您跳转到列表页！');
                    setTimeout(function () {
                        Mom.winBack();
                    }, 2000);
                }

            })
        },
        // 表格操作
        operationTab: function (callback) {
            //日期不能编辑
            $('.scrlts input').attr('disabled', 'disabled');
            $("#tab tr input").blur(function () {
                PageModule.getresult(); // 获取统计实产的总值
                PageModule.getInputName();
                //  百分比取平均值
                var val = $('.scyxl').find("input").last().val() / 12;
                var result = val.toFixed(2);
                $('.scyxl').find("input").last().val(result);

                var valSum = $('.bsyxl').find("input").last().val() / 12;
                var res = valSum.toFixed(2);
                $('.bsyxl').find("input").last().val(res);
                if (callback) {
                    callback(PageModule.getInputName());
                }
            });

            //合并列
            $("#tab tr").each(function (index, item) {
                if ($(item).find(".td0").html() === $(item).find(".td1").html()) {
                    $(item).find(".td0").attr('colspan', 2);
                    $(item).find(".td1").css('display', 'none');
                }
            });

            // 合并行
            var tab = document.getElementById("tab");
            var maxCol = 2, val, count, start;
            for (var col = maxCol - 1; col >= 0; col--) {
                count = 1;
                val = "";
                for (var i = 0; i < tab.rows.length; i++) {
                    if (val == tab.rows[i].cells[col].innerHTML) {
                        count++;
                    } else {
                        if (count > 1) { //合并
                            start = i - count;
                            tab.rows[start].cells[col].rowSpan = count;
                            for (var j = start + 1; j < i; j++) {
                                tab.rows[j].cells[col].style.display = "none";
                            }
                            count = 1;
                        }
                        val = tab.rows[i].cells[col].innerHTML;
                    }
                }
                if (count > 1) { //合并，最后几行相同的情况下
                    start = i - count;
                    tab.rows[start].cells[col].rowSpan = count;
                    for (var j = start + 1; j < i; j++) {
                        tab.rows[j].cells[col].style.display = "none";
                    }
                }
            }
        },
        // 获取当前月以后的实产不可编辑
        getMonth: function () {
            var myDate = new Date();  //获取系统当前时间
            var month = myDate.getMonth(); // 获取当前月
            $("#tab tr").each(function (index, item) {
                $(item).find("input").each(function (i, ele) {
                    if (i > month) {
                        $(ele).attr('disabled', 'disabled');
                    }
                })
            })
        },
        // 获取统计实产的总值
        getresult: function () {
            $("#tab tr").each(function (index, domEle) {
                var arr = [];
                var result = 0;
                $(domEle).find("input").each(function (index, data) {
                    arr.push($(data).val());
                });
                arr.pop();
                arr.forEach(function (item) {
                    result = result.Add(item); ////数字函数（加法）解决小数失去精度问题
                });
                if (result) {
                    $(domEle).find("input").last().val(result);
                } else {
                    $(domEle).find("input").last().val(0);
                }
            });
        },
        // 获取所有的input的name值
        getInputName: function () {
            newArr = [];
            $("#tab tr").each(function (index, domEle) {
                var obj = {};
                $(domEle).find("input").each(function (index, item) {
                    obj[$(item).attr('name')] = $(item).val();
                });
                obj['id'] = $(domEle).find("input").last().attr('id');
                obj['itemCode'] = $(this).attr('class');

                newArr.push(obj);
            });
            return newArr
        }
    };
    $(function () {
        //参数配置列表
        if ($('#yearPlanList').length > 0) {//年计划列表
            PageModule.yearPLInit()
        } else if ($('#yearPlanView').length > 0) { //年计划新增
            PageModule.yearPLCheckInit()
        } else if ($('#yearPlanEdit').length > 0) {//年计划新增、编辑
            PageModule.yearPLUpdateInit()
        } else if ($('#yearPlanCompare').length > 0) { //年计划对比页面
            PageModule.yearPLCompareInit()
        }
    });

});