/**
 * Created by jiaxuguang on 2018/7/9.
 */
require(['/js/zlib/app.js'], function (App) {


    var PageModule = {
            //页面初始化
            init: function () {
                require(['datetimepicker'], function () {
                    //时间选择插件
                    $("#startDate,#endDate").val("").datetimepicker({
                        bootcssVer: 3,          //显示箭头，部分如不显示箭头要加这个
                        format: "yyyy-mm-dd",  //保留到日
                        showMeridian: true,     //显示上、下午
                        language: "zh-CN",   //中文显示
                        minView: "3",    //月视图
                        autoclose: true,  //选择时间后自动隐藏
                        clearBtn: true,
                        todayBtn: true
                    });
                    //判断日期大小
                    $("#endDate,#startDate").on('change', function () {
                        if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                            Mom.layMsg('结束时间应大于起始时间，请重新选择');
                            $('#endDate').val('')
                        }
                    });
                });
                //拖拽上传
                $('.dropUpLoader').click(function () {
                    var p_ = top;
                    // 正常打开
                    p_.layer.open({
                        type: 2,
                        area: ['640px', '400px'],
                        title: "拖拽上传",
                        content: 'oreDistribution/laboratoryInfInner.html?',
                        btn: ['上传', '关闭'],
                        yes: function (index, layero) { //或者使用btn1
                            var innerWindow = layero.find("iframe")[0].contentWindow;
                            var upload = innerWindow.document.getElementById('upexcel');
                            $(upload).trigger('click');
                        },
                        cancel: function (index) { //或者使用btn2

                        }
                        // });

                    });
                });
                //引入Page插件
                require(['Page'], function () {
                    window.pageLoad = function () {
                        //搜索框信息
                        var data = {
                            startDate: $('#startDate').val(),
                            endDate: $('#endDate').val(),
                            sid2: $('#sid2').val()
                        };
                        //渲染表格以及渲染分页
                        var page= new Page();
                        page.init(Api.aps + "/api/ob/OreLaboratoryInfo/page", data, true, function (rows) {
                            PageModule.rendertable(rows);
                        });
                    };
                    $("#search-btn").click(function () {
                        pageLoad();
                    });
                    pageLoad();
                });


            },
            //渲染表格
            rendertable: function (res) {
                //datatables方法
                $('#dataTable').dataTable({
                    "data": res,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + " class='i-checks'>"
                            }
                        },
                        {"data": "checkedDate", 'sClass': "center ", 'sWidth': '7%'},
                        {"data": "sid2", 'sClass': "center", 'sWidth': '7%'},
                        {
                            "data": "al2o3Value", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);//保留两位小数
                            }
                        },
                        {
                            "data": "sio2Value", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "fe2o3Value", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "tio2Value", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "caoValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "aSValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "tolValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "k2oValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "cValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "sValue", 'sClass': "center", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {"data": "checkedUser", 'sClass': "center", 'sWidth': '8%'},
                        {"data": "auditor", 'sClass': "center", 'sWidth': '5%'},
                        {"data": "censorDate", 'sClass': "center"},
                        {"data": "sendDate", 'sClass': "center"}
                    ]
                });
                //渲染勾选框
                renderIChecks();
                PageModule.tablebtn();
            },
            //操作表格的按钮
            tablebtn: function () {
                /*table控制按钮*/
                //添加一可编辑行
                $('#add-btn').unbind('click').on('click', function () {
                    if ($('#datainner').find('td.dataTables_empty')) {
                        $('#datainner').find('td.dataTables_empty').parents('tr').remove();
                        addnewrows();
                    } else {
                        addnewrows();
                    }
                    function addnewrows() {
                        var i = 0;
                        i++;
                        trhtm = '<tr role="row" class="newrows odd"><td class="center"><input type="checkbox" class="i-checks "></td></tr>';
                        $('#datainner').prepend(trhtm);
                        for (var i = 0; i < $('#dataTable>thead>tr>th').length - 1; i++) {
                            tdhtm = '<td ><input type="text" class="giveWidth center editText"></td>';
                            $('#datainner>tr:first').append(tdhtm);

                        }
                        $('#datainner>tr:first').find('td:eq(15),td:eq(16)').children('input').datetimepicker({
                            bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                            format: "yyyy-mm-dd hh:ii",  //保留到日
                            showMeridian: true,     //显示上、下午
                            language: "zh-CN",   //中文显示
                            minView: "0",    //月视图
                            autoclose: true,  //选择时间后自动隐藏
                            clearBtn: true,
                            todayBtn: true
                        });
                        $('#datainner>tr:first').find('td:eq(1)').children('input').datetimepicker({
                            bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                            format: "yyyy-mm-dd",  //保留到日
                            showMeridian: true,     //显示上、下午
                            language: "zh-CN",   //中文显示
                            minView: "3",    //月视图
                            autoclose: true,  //选择时间后自动隐藏
                            clearBtn: true,
                            todayBtn: true
                        });
                        //判断日期大小
                        $('#datainner>tr:first').find('td:eq(15),td:eq(16)').on('change', function () {
                            if ($("#datainner>tr:first").find("td:eq(16)").children('input').val() < $("#datainner>tr:first").find("td:eq(15)").children('input').val() && $("#datainner>tr:first").find("td:eq(16)").children('input').val() != '') {
                                Mom.layMsg('结束时间应大于起始时间，请重新选择');
                                $("#datainner>tr:first").find("td:eq(16)").children('input').val('');
                            }
                        });

                        for(var i=3;i<$('#datainner>tr:first').find('td').length-4;i++){
                            $('#datainner>tr:first').find('td').eq(i).children('input').each(function () {
                                $(this).on('keyup', function () {
                                    var reg = $(this).val().match(/\d+\.?\d{0,2}/);
                                    var txt = '';
                                    if (reg != null) {
                                        txt = reg[0];
                                    }
                                    $(this).val(txt);
                                }).change(function () {
                                    $(this).keypress();
                                    var v = $(this).val();
                                    if (/\.$/.test(v))
                                    {
                                        $(this).val(v.substr(0, v.length - 1));
                                    }
                                })
                            })
                        }
                        renderIChecks();
                    }
                });
                //保存编辑行
                $('#save-btn').unbind('click').on('click', function () {
                    var savedata = [];
                    $("#datainner .newrows").each(function (index, item) {
                        savedata.push(PageModule.save(item));
                    });
                    var editempty = false;
                    for (var i = 0; i < $('.editText').length; i++) {
                        if ($('.editText').eq(i).val() == '') {
                            Mom.layMsg('请填写完整信息后再进行保存');
                            return
                        } else {
                            editempty = true;
                        }
                    }
                    if (editempty == true) {
                        var data = {
                            laboratoryInfos: JSON.stringify(savedata)
                        };
                        Api.ajaxForm(Api.aps + '/api/ob/OreLaboratoryInfo/save', data, function (result) {
                            if (result.success) {
                                Mom.layMsg('保存成功');
                                pageLoad();
                            } else {
                                Mom.layMsg(result.message);
                            }
                        });
                    }


                });
                //删除按钮
                $("#delete-btn").unbind('click').on("click", function () {
                    var bol = false;
                    var str = '';  //用于拼接str
                    $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                        if ($(this).is(":checked")) {
                            var id = $(this).attr('id');
                            if (id != undefined) {
                                str += "," + $(this).attr("id");
                            }
                            bol = true;
                        }
                    });
                    if (bol) {
                        top.layer.confirm('请您确认是否要删除勾选数据', {icon: 3, title: '系统提示'}, function (index) {
                            if (str.length > 0) { //新增的元素+已存在的数据 或全是已存在的数据
                                var data = {
                                    ids: str.substr(1)
                            };
                                var url = Api.aps + '/api/ob/OreLaboratoryInfo/delete';
                                Api.ajaxForm(url,data, function (result) {
                                    if (result.success) {
                                        Mom.layMsg('删除成功！');
                                        $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                            if ($(this).is(':checked')) {
                                                $(this).parents('tr').remove();
                                            }
                                        });
                                    } else {
                                        Mom.layMsg(result.message);
                                    }
                                })
                            }else{ //只选择新增的元素
                                $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                    if ($(this).is(':checked')) {
                                        $(this).parents('tr').remove();
                                    }
                                });
                                Mom.layMsg('删除成功！');
                            }
                            top.layer.close(index);
                        });

                    } else {
                        Mom.layMsg("请选择至少一条数据！");
                    }


                });
                //重置按钮
                $("#refresh-btn").unbind('click').on("click", function () {
                    $('#startDate,#endDate,#sid2').val('');
                    $('#search-btn').trigger('click');
                });
            },
            //导入excel
            import: function () {
                require(['/js/plugins/dropzone/dropzone-amd-module.js', '/js/plugins/dropzone/dropzone.js'], function () {
                    Mom.include('myCss_dropzone', '', [
                        '../js/plugins/dropzone/dropzone.min.css'
                    ]);
                    var url = Api.aps + '/ob/import/OreLaboratoryInfo/excelPut';
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
                            $('#upexcel').on('click', function () {
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
                                    top.layer.closeAll();
                                    Mom.layMsg("上传成功！");
                                    top.window['iframe40'].pageLoad();
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
            },
            //保存调用事件
            save: function (item) {
                var tabArr = [];
                var valObj = {};
                var tbheadArr = ['checkedDate', 'sid2', 'al2o3Value', 'sio2Value', 'fe2o3Value', 'tio2Value', 'caoValue',
                    'aSValue', 'tolValue', 'k2oValue', 'cValue', 'sValue', 'checkedUser', 'auditor', 'censorDate', 'sendDate'
                ];
                $(item).find('td .editText').each(function (index, item) {
                    tabArr.push($(item).val());
                });
                for (var j = 0; j < tbheadArr.length; j++) {
                    valObj[tbheadArr[j]] = tabArr[j];
                }
                return valObj;
            }
        }
    ;


    $(function () {
        if ($('#laboratoryInf').length > 0) {
            PageModule.init();
        } else if ($('#laboratoryInfInner').length > 0) {
            PageModule.import();
        }

    });

})
;
