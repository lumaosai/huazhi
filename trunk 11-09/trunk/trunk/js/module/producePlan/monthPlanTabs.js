require(['/js/zlib/app.js'], function (App) {
    Mom.include('myCss', '', [
       '../../../css/aps.css',
   ]);
    var PageModule = {

        inportPlan: [],
        //月调整页面
        monthAdjustInit: function () {
            require(['easyui_my'], function (easyui) {
                var yearId = Mom.getUrlParam('yearId'), year = Mom.getUrlParam('year'),
                    month = Mom.getUrlParam('month');
                var zzyzjhArr = []; //装置运转计划
                var getMonthObj = {mYear: year, flag: month, yearId: yearId, signFlag: false};
                var itemCode = [];
                var editEleArr = ["scjxsj", "scfzcjczhsj", "sczhb", "scshsc", "xsps", "bsjxsj", "ahzhxs", "bsfzcjczhsj"];
                var colMonthVal, colSumVal;
                var data = {
                    "yearId": yearId
                };

                Api.ajaxJson(Api.aps + "/api/aps/ApsMonthPc/queryMonthPc", JSON.stringify(data), function (result) {
                    var zzyzjh = result.zzyzjh,
                        yljh = result.yljh,
                        xhjh = result.xhjh;
                    var tBodyHtml = "";
                    var colMonthVal_ = {}, colSumVal_ = {};
                    //装置运转计划  筛选#td0需要的数据，并将tr中所需要的数据存放在临时的对象中然后push到zzyzjhArr中。
                    for (var i = 0; i < zzyzjh.length; i++) {
                        itemCode.push(zzyzjh[i].itemCode);
                        var itemmsg = {
                            "itemName": zzyzjh[i].itemName,
                            "value1": zzyzjh[i].value1,
                            "value2": zzyzjh[i].value2,
                            "value3": zzyzjh[i].value3,
                            "value4": zzyzjh[i].value4,
                            "value5": zzyzjh[i].value5,
                            "value6": zzyzjh[i].value6,
                            "value7": zzyzjh[i].value7,
                            "value8": zzyzjh[i].value8,
                            "value9": zzyzjh[i].value9,
                            "value10": zzyzjh[i].value10,
                            "value11": zzyzjh[i].value11,
                            "value12": zzyzjh[i].value12,
                            "valueSum": zzyzjh[i].valueSum
                        };
                        zzyzjhArr.push(itemmsg);
                    }
                    //遍历数据，将数据渲染到#td0表单中
                    $(zzyzjhArr).each(function (index, item) {
                        tBodyHtml += "<tr id='" + itemCode[index] + "'>";
                        var ind = 0;
                        for (var key in item) {
                            if (ind == month) {
                                colMonthVal_[itemCode[index]] = item[key];
                                var eleInd = editEleArr.indexOf(itemCode[index]);
                                if (eleInd == (-1)) { //判断editEleArr数组中是否有itemCode[index]  如何没有则直接创建td,反之td中包含input
                                    tBodyHtml += "<td>" + item[key] + "</td>";
                                } else {
                                    tBodyHtml += "<td><input class='changeVla' name='" + itemCode[index] + "' value='" + item[key] + "'></td>";
                                }

                            } else {
                                tBodyHtml += "<td>" + item[key] + "</td>";
                                if (ind == 13) {
                                    colSumVal_[itemCode[index]] = item[key];
                                }
                            }
                            ind++;
                        }

                        tBodyHtml += "</tr>";
                        colMonthVal = colMonthVal_;
                        colSumVal = colSumVal_;
                    });
                    $("#renderTable tbody").append(tBodyHtml);

                    $('.changeVla').blur(function () {
                        var thisVal = $.trim($(this).val()),
                            that_ = $(this);
                        var tdEq = $(this).parent('td').index(),  //获取当前列的索引值
                            tdParent = $(this).parents('tr'),
                            trId = tdParent.attr('id'),
                            rowName = tdParent.find('td').eq(0).text(),  //获取正在编辑行中tr的第一个td的内容
                            EqtheadTrText = $('#renderTable thead').find('th').eq(tdEq).text(),  //获取正在编辑列th的内容
                            scrltsInputVal = $('#scrlts').find('td').eq(tdEq).text(); //获取当前编辑列中"日历天数h"的值
                        thisNumberVal = Number(thisVal);
                        if (isNaN(thisNumberVal) || $(this).val() < 0) {  //非数字时且值小0时
                            $(this).val(0);
                            $(this).attr('readonly', 'readonly');
                            top.layer.alert('操作失败："' + rowName + '"请填写数字！(不可小于0)', {
                                skin: 'layui-layer-molv',
                                icon: 0,
                                title: '提示'
                            }, function (index) {
                                $(that_).removeAttr('readonly').focus();
                                top.layer.close(index);
                                return false;
                            });
                        } else {
                            if (trId == "bsjxsj" && $(that_).val() > scrltsInputVal) { //焙烧炉检修天数 <= 日历天数
                                Mom.layMsg(rowName + '的值不能大于日历天数！', function () {
                                    $(that_).focus().val(scrltsInputVal);
                                });
                            } else if (trId == "ahzhxs" && $(that_).val() <= 0) { //AH折合系数必须大于0
                                Mom.layMsg(rowName + '的值必须大于0！', function () {
                                    $(that_).focus().val(0.1);

                                });

                            }

                        }

                    });

                    $('#td1').datagrid('loadData', yljh);
                    $('#td2').datagrid('loadData', xhjh);
                    $("#renderTable td").hover(function () { //装置运转计划table添加划过效果。
                        $(this).parent('tr').addClass('active').siblings('tr').removeClass('active');
                    }, function () {
                        $("#renderTable tr").removeClass('active');
                    });

                    $("#btn-count").unbind('click').click(function () { //点击计算按钮
                        $('#renderTable tbody tr').each(function () {
                            var that = $(this);
                            var field = that.attr('id'),
                                tdEq = that.find('td').eq(month),
                                tdVal = '';
                            if (tdEq.children().length) {
                                tdVal = that.find('td').eq(month).find('input').val();
                            } else {
                                tdVal = that.find('td').eq(month).html();
                            }
                            getMonthObj[field] = tdVal;
                        });
                        var changeVlaArr = [];
                        changeVlaArr.push(getMonthObj);
                        Api.ajaxJson(Api.aps + "/api/aps/ApsMonthPc/dtpcJs", JSON.stringify(changeVlaArr), function (result) {
                            if (result.success) {
                                var colMonthValArr = result.value,  //返回要计算的某个月份结果的数组集合
                                    colSumArr = result.valueSum;  //返回合计的数组集合
                                colMonthVal = colMonthValArr[0];  //返回的是数组对象
                                colSumVal = colSumArr[0];  //同理
                                if (colMonthValArr && colMonthValArr.length > 0 && colSumArr && colSumArr.length > 0) {
                                    $("#renderTable tbody tr").each(function (index, item) {
                                        var eleId = $(this).attr("id"),
                                            eleMonthVal = colMonthVal[eleId],
                                            eleSumVal = colSumVal[eleId];
                                        var tdObj = $(this).find("td").eq(month),
                                            tdInputObj = $(tdObj).find('input');
                                        if (tdInputObj.length > 0) {
                                            tdInputObj.val(eleMonthVal);
                                        } else {
                                            tdObj.text(eleMonthVal);
                                        }
                                        //合计
                                        $(this).find("td:last").text(eleSumVal);

                                    });
                                }
                            } else {
                                Mom.layAlert(result.message);
                            }
                        });
                    });

                });
                dataGrid();
                $(window).resize(function () {  //浏览器窗口改变时dataGrid数据重置
                    $('#td1,#td2').datagrid('resize');
                });

                window.getInnerVal = function(){
                    return {'colMonthVal': colMonthVal, 'colSumVal': colSumVal};
                };


                function dataGrid() {
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
                            {field: 'id', title: 'id', 'hidden': true},
                            {field: 'mainId', title: 'mainId', 'hidden': true},
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
                            {field: 'id', title: 'id', 'hidden': true},
                            {field: 'mainId', title: 'mainId', 'hidden': true},
                            {field: 'pName', title: '', width: 130, align: 'center'},
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

                };
                //点击时获取到信息
                $(".btn-save").click(function (e) {
                    var btn = $(e.target).context.textContent;
                    if (btn == "保存") {
                        status = "0";
                        addstatus(status)
                    } else {
                        status = "1";
                        addstatus(status)
                    }
                });

                //将点击状态添加到数组里边
                function addstatus(status) {
                    var editItems = easyui.dg_getSaveItemArr();
                    var data = {
                        "techPlans": JSON.stringify(editItems),
                        "status": status,
                    };
                    addmsg(data)  //将数据发送给后台
                };

                //        保存将数据发送给后台
                function addmsg(data) {
                    Api.ajaxForm(Api.aps + "/api/aps/ApsMonthAdjustTech/saveTechInfo", data, function (result) {
                    })
                }
            });
        },
        dropImportInit: function () {
            require(['/js/plugins/dropzone/dropzone-amd-module.js', '/js/plugins/dropzone/dropzone.js'], function () {
                Mom.include('myCss_dropzone', '', ['../js/plugins/dropzone/dropzone.min.css']);
                $("#download").unbind("click").on("click", function () {
                    location.href = Api.aps + "/aps/PlanExport/zdgzjhExport"
                })
                var url = Api.aps + '/aps/PlanExport/import';
                $(".dropzone").dropzone({
                    url: url,//上传地址
                    paramName: "file",//传参名称
                    maxFilesize: 5.0, // MB
                    parallelUploads: 10,//并行上传个数
                    maxFiles: 10,//一次性上传的文件数量上限
                    acceptedFiles: ".xls,.xlsx",//限制上传格式
                    addRemoveLinks: true,//添加移除文件
                    autoProcessQueue: false,//不自动上传
                    dictCancelUploadConfirmation: '你确定要取消上传吗？',
                    dictMaxFilesExceeded: "您一次最多只能上传{{maxFiles}}个文件",
                    dictFileTooBig: "文件过大({{filesize}}MB). 上传文件最大支持: {{maxFilesize}}MB.",
                    dictDefaultMessage: '拖动文件至该处(或点击选择)',
                    dictResponseError: '文件上传失败!',
                    dictInvalidFileType: "你不能上传该类型文件,文件类型只能是*.xls以及*.xlsx。",
                    dictCancelUpload: "取消上传",
                    dictRemoveFile: "移除文件",
                    uploadMultiple: false,//传参是否开放多个 传参类型不一样
                    init: function () {
                        myDropzone = this; // closure
                        arr = [];
                        $('#Import').on('click', function () {
                            if ($('.dz-started')) {
                                myDropzone.processQueue();
                            } else {
                                Mom.layMsg('请选择文件后进行上传')
                            }
                        });
                        //添加了文件的事件
                        this.on("addedfile", function (file) {
                            $('#subModel').modal().css({
                                'margin-top': function () {
                                    return (document.body.scrollHeight / 2.5);
                                }
                            });
                            $('#subModel').modal('show');
                        });
                        //为上传按钮添加点击事件
                        this.on("success", function (file, data) {
                            if (data.success == false) {
                                arr.push(data.message);
                                this.removeFile(file);
                            } else {
                                // top.layer.closeAll();
                                PageModule.inportPlan.push(data.rows);
                                Mom.layMsg("上传成功！");
                                // PageModule.inportPlan = data
                            }
                        });
                        this.on("error", function (file, data) {
                            arr.push(data);
                            this.removeFile(file);
                        });
                        this.on("queuecomplete", function (file, data) {
                            var str = '';
                            if (arr.length > 0) {
                                $(arr).each(function (i, item) {
                                    str += item + ' ';
                                });
                                str.substr(1);
                                Mom.layMsg(str);
                                arr = [];
                            } else {
                                this.removeAllFiles(file);
                            }
                        });
                    }
                });
            })
            window.getUploadMsg = function () {
                return PageModule.inportPlan;
            }
        },
    };

    $(function () {
        //月调整页面
        if ($('#monthAdjust').length > 0) {
            PageModule.monthAdjustInit()
        }
        else if ($("#dropImport").length > 0) {   //重点工作计划导入页面
            PageModule.dropImportInit()
        }
    });
});