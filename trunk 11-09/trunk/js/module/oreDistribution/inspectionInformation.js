require(['/js/zlib/app.js', ''], function (App) {
        var PageModule = {
            oreType :[],
            init: function () {
                PageModule.selectKind();   //获取矿石种类下拉
                // 引入插件
                require(['Page'], function () {
                    //判断日期大小
                    $("#endDate,#startDate").on('change', function () {
                        if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                            Mom.layMsg('结束时间应大于起始时间，请重新选择');
                            $('#endDate').val('')
                        }
                    });
                    window.pageLoad = function () {
                        var data = {
                            supplierName: $("#supplierName").val(),
                            arrivalDate: $("#startDate").val(),
                            arrivalDate2: $("#endDate").val(),
                            batchNum: $("#batchNum").val(),
                            oreType: $("#oreType option:selected").val()
                        };
                        new Page().init(Api.aps + "/api/ob/QualityInspections/page", data, true, function (result) {
                            PageModule.createTable(result);
                        });
                        //拖拽上传
                        $('#excelput').unbind("click").on('click', function () {
                            var p_ = top;
                            // 正常打开
                            p_.layer.open({
                                type: 2,
                                area: ['640px', '420px'],
                                title: "拖拽上传",
                                content: 'oreDistribution/inspectionInformationInner.html',
                                btn: ['上传', '关闭'],
                                yes: function (index, layero) { //或者使用btn1
                                    var innerWindow = layero.find("iframe")[0].contentWindow;
                                    var upload = innerWindow.document.getElementById('upexcel');
                                    var oreType = innerWindow.document.getElementById('oreType');
                                    if ($(oreType).find('option:selected').val() == '') {
                                        Mom.layMsg('请选择矿堆后再进行上传')
                                    } else {
                                        $(upload).trigger('click');
                                    }
                                },
                                cancel: function (index) { //或者使用btn2
                                }
                            });
                        });
                        //添加按钮
                        $("#add-btn").unbind("click").on('click', function () {
                            if ($('#datainner').find('td.dataTables_empty')) {
                                $('#datainner').find('td.dataTables_empty').parents('tr').remove();
                                addnewrows();
                            } else {
                                addnewrows();
                            }
                            function addnewrows() {
                                var tr = '';
                                var td = '';
                                tr = "<tr class='top'>" +
                                    '<td class="center">' +
                                    "<input type='checkbox' class='i-checks center' value=''>" +
                                    '</td>' +
                                    "</tr>";
                                $("#datainner").prepend(tr);
                                for (var i = 0; i < $("thead .sorting_disabled").length - 1; i++) {
                                    td = '<td>' +
                                        "<input type='text' class='content-text center'/>" +
                                        '</td>';
                                    $("#datainner tr:first").append(td);
                                };
                                $(".content-text").eq(0).addClass('center').addClass('select2');
                                $(".content-text").eq(2).click(function(){
                                    WdatePicker();
                                });

                                var selectTable = $('#oreType').clone().addClass('content-text');
                                $('#datainner>tr:first').find('td:eq(1)').children('input').remove();
                                $('#datainner>tr:first').find('td:eq(1)').append(selectTable);
                                for(var i=5;i<$('#datainner>tr:first').find('td').length;i++){
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
                        //删除按钮
                        $("#delete-btn").unbind("click").on("click", function () {
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
                                        var url = Api.aps + '/api/ob/QualityInspections/delete';
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
                        //保存按钮
                        $("#save-btn").unbind("click").on('click', function () {
                            var msgdata = [];
                            $("#datainner .top").each(function (index, item) {
                                msgdata.push(PageModule.getaddmsg(item));
                            });
                            var editempty = false;
                            for (var i = 0; i < $('.content-text').length; i++) {
                                if ($('.content-text').eq(i).val() == '') {
                                    Mom.layMsg('请填写完整信息后再进行保存');
                                    return;
                                } else {
                                    editempty = true;
                                }
                            }
                            if (editempty == true) {
                                var data = {
                                    qualityInspections: JSON.stringify(msgdata)
                                };
                                Api.ajaxForm(Api.aps + '/api/ob/QualityInspections/save', data, function (result) {
                                    if (result.success) {
                                        Mom.layMsg('保存成功！');
                                        pageLoad();
                                    } else {
                                        Mom.layMsg(result.message)
                                    }
                                })
                            }

                        });
                        //重置按钮
                        $("#refresh-btn").unbind('click').on("click", function () {
                            $('#oreType,#supplierName,#startDate,#endDate,#batchNum').val('');
                            $('#search-btn').trigger('click');
                        });
                    };
                    pageLoad();
                });
            },
            createTable: function (tableDate) {
                $("#treeTable").dataTable({
                    "data": tableDate,
                    "aoColumns": [
                        {
                            "data": "id", "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' id=" + row.id + "  class='i-checks'>"
                            }
                        },
                        {"data": "oreTypes", 'sClass': "center ", "width": "8%"},
                        {"data": "supplierName", 'sClass': "center", "width": "17%"},
                        {"data": "arrivalDate", 'sClass': "center", "width": "8%"},
                        {"data": "batchNum", 'sClass': "center"},
                        {"data": "mainNumber", 'sClass': "center"},
                        {"data": "al2o3Value", 'sClass': "center"},
                        {"data": "sio2Value", 'sClass': "center"},
                        {"data": "stValue", 'sClass': "center"},
                        {"data": "caoValue", 'sClass': "center"},
                        {"data": "cValue", 'sClass': "center"},
                        {"data": "fe2o3Value", 'sClass': "center"},
                        {"data": "tio2Value", 'sClass': "center"},
                        {"data": "aSValue", 'sClass': "center"},
                        {"data": "tolValue", 'sClass': "center"},
                        {"data": "k2oValue", 'sClass': "center"},
                        {"data": "h2oValue", 'sClass': "center"}
                    ],
                });
                renderIChecks();
            },
            //获取td信息(用与保存按钮)
            getaddmsg: function (item) {
                var keyName = ['oretype', 'supplierName', 'arrivalDate', 'batchNum', 'mainNumber', 'al2o3Value', 'sio2Value',
                    'stValue', 'caoValue', 'cValue', 'fe2o3Value', 'tio2Value', 'aSValue',
                    'tolValue', 'k2oValue', 'h2oValue'
                ];
                var newTdArr = [];
                var msgobj = {};
                $(item).find('td .content-text').each(function (index, inputItem) {
                    newTdArr.push($(item).find('td .content-text').eq(index).val());  //每个input的value
                });

                for (var j = 0; j < newTdArr.length; j++) {
                    msgobj[keyName[j]] = newTdArr[j];
                }
                return msgobj;
            },
            //矿石种类下拉选择
            selectKind: function () {
                var url = Api.admin + "/api/sys/SysDict/type/ORE_TYPE";
                Api.ajaxForm(url, {}, function (result) {
                    var rows = result.rows;
                    Bus.appendOptionsValue($('#oreType'), rows, 'value', 'label');
                    for(var i=0;i<rows.length;i++){
                        PageModule.oreType.push(rows[i].value)
                    }
                })
            },
            //拖拽上传初始化
            importInit: function () {
                require(['/js/plugins/dropzone/dropzone-amd-module.js', '/js/plugins/dropzone/dropzone.js'], function (oretype) {
                 $('#upexcel').hide();
                var url = Api.aps + '/ob/import/QualityInspections/excelPut/';
                $(".dropzone").dropzone({
                    url: url,//上传地址
                    paramName: "file",//传文件名称
                    maxFilesize: 5.0, // MB
                    parallelUploads: 10,//并行上传个数
                    maxFiles: 10,//一次性上传的文件数量上限
                    acceptedFiles: ".xls,.xlsx",//限制上传格式
                    addRemoveLinks: true,//添加移除文件
                    autoProcessQueue: false,//不自动上传
                    dictCancelUploadConfirmation: '你确定要取消上传吗？',
                    dictMaxFilesExceeded: "您一次最多只能上传{{maxFiles}}个文件",
                    dictFileTooBig: "文件过大({{filesize}}MB). 上传文件最大支持: {{maxFilesize}}MB.",
                    dictDefaultMessage: '拖动文件至该处(或点击此处)',
                    dictResponseError: '文件上传失败!',
                    dictInvalidFileType: "你不能上传该类型文件,文件类型只能是*.xls以及*.xlsx。",
                    dictCancelUpload: "取消上传",
                    dictRemoveFile: "移除文件",
                    uploadMultiple: false,//传参是否开放多个 传参类型不一样
                    init: function () {
                        myDropzone = this; // closure
                        arr = [];
                        $('#upexcel').on('click', function () {
                            if ($('.dz-started').length>0) {
                                myDropzone.options.url = url+$('#oreType').val()+"/"+Mom.getCookie("userName");
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
                                top.window['iframe41'].pageLoad();
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
                                    str += item + '</br>';
                                });
                                Mom.layAlert(str);
                                arr = [];
                            } else {
                                this.removeAllFiles(file);
                            }
                        });
                    }
                });
                });
                PageModule.importorttypr();
            },
            //获取到矿石种类
            importorttypr: function () {
                var url = Api.admin + "/api/sys/SysDict/type/ORE_TYPE";
                Api.ajaxForm(url, {}, function (result) {
                    var rows = result.rows;
                    Bus.appendOptionsValue($('#oreType'), rows, 'value', 'label');
                    PageModule.selectArr = result.rows;
                })
            },
        };
        $(function () {
            if ($('#inspectionInformation').length > 0) {    //质检信息
                PageModule.init();
            }else if($("#inspectionInformationInner").length>0){    //质检信息导入
                PageModule.importInit();
            }
        });
});
