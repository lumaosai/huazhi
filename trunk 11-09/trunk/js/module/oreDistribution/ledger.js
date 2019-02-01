require(['/js/zlib/app.js'], function (App) {
    var PageModule = {
        //页面初始化
        init: function () {
            caseId = Mom.getUrlParam('caseId');
            caseName = Mom.getUrlParam('caseName');
            date = Mom.getUrlParam('dateTime');
            status = Mom.getUrlParam('status');
            $('#caseId').val(caseName);
            Api.ajaxJson(Api.aps + '/api/ob/LedgerAccount/getOreType?caseId='+caseId,{},function(result){
                if(result.success){
                    var oreTypeList = result.rows;
                    Bus.appendOptionsValue($('#oreType'),oreTypeList,'oreType', 'oreTypeName');
                    pageLoad(oreTypeList);
                }else{
                    Mom.layMsg(result.message);
                }
            });

            //判断日期大小
            $("#endDate,#startDate").on('change', function () {
                if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                    Mom.layMsg('结束时间应大于起始时间，请重新选择');
                    $('#endDate').val('');
                }
            });

            window.pageLoad = function (oreTypeList) {
                //搜索框信息
                var data = {
                    caseId: caseId,
                    oreType: $('#oreType option:selected').val(),
                    startDate: $('#startDate').val(),
                    endDate: $('#endDate').val()
                };

                //渲染表格以及渲染分页
                Api.ajaxJson(Api.aps + "/api/ob/LedgerAccount/list",JSON.stringify(data) ,function (result) {
                    rendertable(result.rows, oreTypeList);
                    rowArrAll = result.rows;
                });
            };

            //渲染表格
            function rendertable(res, oreTypeList) {
                //datatables方法
                $('#dataTable').dataTable({
                    "data": res,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input class='i-checks' laboratoryId='" + row.laboratoryId + "' type='checkbox' id='" + row.id + "'>"
                            }
                        },
                        {"data": "oreDate", 'sClass': "center old ", 'sWidth': '12%'},
                        {
                            "data": "oreType", 'sClass': "center old", 'sWidth': '8%',
                            "render": function (value, type, row, meta) {
                                var html = "<select>";
                                $.each(oreTypeList,function(i,o){
                                    html += "<option value='"+o.oreType+"' "+(o.oreType==value?'selected':'')+">"+o.oreTypeName+"</option>";
                                });
                                return html+"</select>";


                            }
                        },
                        {
                            "data": "beltWeight", 'sClass': "center old", 'sWidth': '8%',
                            "render": function (value, type, row, meta) {
                                return "<input type='text' value='"+value+"' name='beltWeight' class='beltWeight form-control editText  editor  '>"
                            }
                        },
                        {
                            "data": "avgNum", 'sClass': "center old", 'sWidth': '8%',
                            "render": function (value, type, row, meta) {
                                return "<input type='text' value='"+value+"' name='avgNum' class='avgNum form-control editor editText '>";
                            }
                        },
                        {"data": "samplingDate", 'sClass': "center old", 'sWidth': '11%'},
                        {
                            "data": "al2o3Value", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);//保留两位小数
                            }
                        },
                        {
                            "data": "sio2Value", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "fe2o3Value", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "tio2Value", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "caoValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "aSValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "tolValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "k2oValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "cValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        },
                        {
                            "data": "sValue", 'sClass': "center old", 'sWidth': '4%',
                            "render": function (data, type, row, meta) {
                                return Number(data).toFixed(2);
                            }
                        }

                    ]

                });
                //渲染勾选框
                renderIChecks();
                // PageModule.renderDatas(res, $('#dataTable'));
                //页面渲染的时候给老数据动态添加一个class
                $('#datainner tr').addClass('oldval');
                PageModule.tablebtn();
                if (status == 1) {
                    $("#schemeOpt-btn,#dataCollection-btn,#add-btn,#delete-btn,#save-btn").addClass('disNone');
                }
                PageModule.changedata();
                $('input.editor').each(function (i, item) {
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
                });
            }
        },

        //渲染可修改的select值和input值
        renderDatas: function (data, renderID) {
            /*var arr = data;
            console.log(data);
            var eleDom = $(renderID).find("*[name = 'avgNum']");
            var eleDomW = $(renderID).find("*[name = 'beltWeight']");
            for (var i = 0; i < eleDom.length; i++) {
                $(eleDom).eq(i).val(arr[i].avgNum);
                $(eleDomW).eq(i).val(arr[i].beltWeight);
            }*/
            var eleDomS = $(renderID).find("*[name = 'oreType']");
            PageModule.renderSelect(Api.aps + '/api/ob/LedgerAccount/getOreType', caseId, ".oreType", 'oreType', 'oreTypeName', sel2);
            function sel2(result) {
                console.log(result);
                var sdata = {caseId: caseId};
                Api.ajaxForm(Api.aps + '/api/ob/LedgerAccount/getOreType', sdata, function (result) {
                    console.log(result);
                    var List = result.rows;
                    List.map(function (item) {
                        console.log(item.oreType,item.name);
                        item.oreType = item.name
                    });


                    for (var z = 0; z < data.length; z++) {
                        $(eleDomS).eq(z).select2({width: '100%'}).val(data[z].oreType).trigger('change');
                    }
                });
            }


        },
        //动态计算使用
        changedata: function () {
            $('.beltWeight').on('change', function () {
                for (var i = 0; i < $('.beltWeight').length; i++) {
                    $('.avgNum').eq(i).val($('.beltWeight').eq(i).val())
                }
            });
            $('.editor').each(function (i) {
                if ($(this).length > 0) {
                    $(this).on('change', function () {
                        $('#calculate-btn').trigger('click');
                    })
                }

            });
            $('.editText').each(function () {
                $(this).on('change', function () {
                    $('#calculate-btn').trigger('click');
                })
            });

        },
        //操作表格的按钮
        tablebtn: function () {
            /*table控制按钮*/
            //添加一可编辑行
            $("#add-btn").unbind('click').on('click', function () {
                if ($('#datainner').find('td.dataTables_empty')) {
                    $('#datainner').find('td.dataTables_empty').parents('tr').remove();
                    addnewrows();
                } else {
                    addnewrows();
                }
                function addnewrows() {
                    var i = 0;
                    i++;
                    trhtm = '<tr role="row" class="newrows odd"><td class="center"><input type="checkbox" class="i-checks" id=""></td></tr>';
                    $('#datainner').prepend(trhtm);
                    for (var i = 0; i < $('#dataTable>thead>tr>th').length - 1; i++) {
                        tdhtm = '<td ><input  type="text" class="giveWidth center editText"></td>';
                        $('#datainner>tr:first').append(tdhtm);

                    }
                    $('#datainner>tr:first').find('td:eq(1)').children('input').click(function(){
                        WdatePicker();
                    });

                    $('#datainner>tr:first').find('td:eq(5)').children('input').click(function(){
                        WdatePicker({dateFmt:'yyyy-MM-dd HH:mm'});
                    });
                    var selectTable = $('#oreType').clone().addClass('editText');
                    $('#datainner>tr:first').find('td:eq(2)').children('input').remove();
                    $('#datainner>tr:first').find('td:eq(2)').append(selectTable);
                    $('#datainner>tr:first').find('td:eq(3)').children('input').addClass('beltWeight');
                    $('#datainner>tr:first').find('td:eq(4)').children('input').addClass('avgNum');
                    PageModule.changedata();
                    $('input.editText').each(function (i, item) {
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
                    });

                    renderIChecks();
                }
            });
            //保存编辑行
            $("#save-btn").unbind('click').on("click", function () {
                var savedata = [];
                $("#datainner .newrows").each(function (index, item) {
                    savedata.push(PageModule.save(item));
                });
                //把老数据push进去
                $("#datainner .oldval").each(function (index, item) {
                    savedata.push(PageModule.saveoldval(item));
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
                        ledgerData: JSON.stringify(savedata),
                        caseId: caseId
                    };
                    Api.ajaxForm(Api.aps + '/api/ob/LedgerAccount/save', data, function (result) {
                        if (result.success) {
                            Mom.layMsg('保存成功');
                            pageLoad();
                        } else {
                            Mom.layMsg(result.message);
                        }
                    })
                }

            });
            //删除按钮
            $("#delete-btn").unbind('click').on("click", function () {
                var bol = false;
                var str = '';  //用于拼接str
                $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                    if ($(this).is(":checked")) {
                        var id = $(this).attr('id');
                        if (id != undefined && id != '') {
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
                            var url = Api.aps + '/api/ob/LedgerAccount/delete';
                            Api.ajaxForm(url, data, function (result) {
                                if (result.success) {

                                    Mom.layMsg('删除成功！');
                                    $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                        if ($(this).is(':checked')) {
                                            $(this).parents('tr').remove();
                                            $('#calculate-btn').trigger('click');
                                            new Page().init(Api.aps + "/api/ob/LedgerAccount/page", data, true, function (rows) {
                                                rowArrAll = rows;
                                            });
                                        }
                                    });
                                } else {
                                    Mom.layMsg(result.message);
                                }
                            });
                            //渲染表格以及渲染分页

                        } else { //只选择新增的元素
                            $("tbody tr td input.i-checks:checkbox").each(function (index, item) {
                                if ($(this).is(':checked')) {
                                    $(this).parents('tr').remove();
                                    $('#calculate-btn').trigger('click');
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
            //计算
            $("#calculate-btn").unbind('click').on("click", function () {
                $('.calculate').remove();
                var arr = PageModule.compute('dataTable');
                var valueSucc = $('<tr class="calculate"></tr>');
                for (var i = 0; i < arr.length; i++) {
                    var valtd = '<td class="center">' + arr[i] + '</td>';
                    $(valueSucc).append(valtd)
                }
                $('#datainner').append(valueSucc)
            });
            //搜索按钮
            $("#search-btn").unbind('click').on("click", function () {
                pageLoad();
            });
            //返回按钮
            $("#back-btn").unbind('click').on("click", function () {
                Mom.winBack();
            });
            //数据采集
            $("#dataCollection-btn").unbind('click').on("click", function () {
                PageModule.opendataCol();
            });
            //导出
            $('#export-btn').unbind('click').on('click', function () {
                var url = Api.aps + '/ob/import/LedgerAccount/export?caseId=' + caseId + '&oreType=' + $('#oreType option:selected').val() + '&startDate=' + $('#startDate').val() + '&endDate=' + $('#endDate').val() + '&auth=' + Mom.getCookie('authorization') + '&token=' + Mom.getCookie('token_type');
                var id=$('#datainner').find('.i-checks').attr('id');
                var bol=false;
                if(id==undefined){
                    Mom.layMsg('请数据采集后，点击保存再进行导出');

                }else{
                    if(id==''||id==null){
                        Mom.layMsg('请填写完整信息后，点击保存再进行导出');
                    }else{
                        bol=true;
                    }
                }

                if(bol){
                    window.location.href = url;
                }

            });
            //方案优化
            $("#schemeOpt-btn").unbind('click').on("click", function () {
                Bus.openDialog('方案优化', '../oreDistribution/schemeview.html?caseId=' + caseId + '&name=' + escape(caseName), '1380px', '660px')
            });
            //重置按钮
            $("#refresh-btn").unbind('click').on("click", function () {
                $('#oreType,#startDate,#endDate').val('');
                $('#search-btn').trigger('click');
            });
        },
        //保存新增数据调用事件
        save: function (item) {
            var tabArr = [];
            var valObj = {};
            var tbheadArr = ['oreDate', 'oreType', 'beltWeight', 'avgNum', 'samplingDate', 'al2o3Value', 'sio2Value', 'fe2o3Value', 'tio2Value', 'caoValue',
                'aSValue', 'tolValue', 'k2oValue', 'cValue', 'sValue'
            ];
            $(item).find('td .editText').each(function (index, item) {
                tabArr.push($(item).val());
            });
            for (var j = 0; j < tbheadArr.length; j++) {
                valObj[tbheadArr[j]] = tabArr[j];
            }
            var selval = $(item).find('select option:selected').val();
            valObj[tbheadArr[1]] = selval;
            return valObj;
        },
        //保存原有数据调用事件
        saveoldval: function (item) {
            var tabArr = [];
            var valObj = {};
            var tbheadArr = ['oreDate', 'oreType', 'beltWeight', 'avgNum', 'samplingDate', 'al2o3Value', 'sio2Value', 'fe2o3Value', 'tio2Value', 'caoValue',
                'aSValue', 'tolValue', 'k2oValue', 'cValue', 'sValue'
            ];
            $(item).find('.old').each(function (index, item) {
                tabArr.push($(item).text());
            });

            for (var j = 0; j < tbheadArr.length; j++) {
                valObj[tbheadArr[j]] = tabArr[j];
            }
            var selval = $(item).find('select option:selected').val();
            var avgval = $(item).find('input.avgNum').val();
            var belval = $(item).find('input.beltWeight').val();
            valObj[tbheadArr[1]] = selval;
            valObj[tbheadArr[2]] = belval;
            valObj[tbheadArr[3]] = avgval;
            valObj.id = $(item).find('input.i-checks').attr('id');
            valObj.laboratoryId = $(item).find('input.i-checks').attr('laboratoryId');
            return valObj;
        },
        //表计算
        compute: function (table) {
            var tab = document.getElementById(table);//获取table
            var rows = tab.rows;
            var weight1 = 0.00; //皮带秤抄重
            // var weight2=0.00; //均化库重量
            var al2o3 = 0.00;//氧化铝
            var sio2 = 0.00;//
            var fe2o3 = 0.00;//
            var tio2 = 0.00;//
            var cao = 0.00;//
            var a_s = 0.00;//
            var k2o = 0.00;//
            var c = 0.00;//
            var s = 0.00;//
            var result = new Array();//返回的结果数组
            var length;
            if ("" == rows[rows.length - 1].cells[0].innerHTML) {
                length = rows.length - 1;
            } else {
                length = rows.length
            }
            for (var i = 1; i < length; i++) { //遍历表格的行
                if (rows[i].cells[1].textContent == '') {
                    weight1 += Number(rows[i].cells[3].children[0].value);
                    al2o3 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[6].children[0].value);//计算al2o3的初始总数
                    sio2 += +Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[7].children[0].value);//计算sio2的初始总数
                    fe2o3 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[8].children[0].value);//计算fe2o3的初始总数
                    tio2 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[9].children[0].value);//计算tio2的初始总数
                    cao += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[10].children[0].value);//计算cao的初始总数
                    k2o += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[13].children[0].value);//计算k2o的初始总数
                    c += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[14].children[0].value);//计算c的初始总数
                    s += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[15].children[0].value);//计算s的初始总数
                } else {
                    weight1 += Number(rows[i].cells[3].children[0].value);//计算皮带的求和
                    al2o3 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[6].textContent);
                    sio2 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[7].textContent);//计算sio2的初始总数
                    fe2o3 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[8].textContent);//计算fe2o3的初始总数
                    tio2 += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[9].textContent);//计算tio2的初始总数
                    cao += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[10].textContent);//计算cao的初始总数
                    k2o += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[13].textContent);//计算k2o的初始总数
                    c += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[14].textContent);//计算c的初始总数
                    s += Number(rows[i].cells[3].children[0].value) * Number(rows[i].cells[15].textContent);//计算s的初始总数

                }

            }
            for (var j = 0; j < rows[0].cells.length; j++) {  //遍历每行的列
                result.push('');
            }
            a_s = changeTwoDecimal_f(al2o3 / sio2);
            al2o3 = changeTwoDecimal_f(al2o3 / weight1);
            sio2 = changeTwoDecimal_f(al2o3 / a_s);
            fe2o3 = changeTwoDecimal_f(fe2o3 / weight1);
            tio2 = changeTwoDecimal_f(tio2 / weight1);
            cao = changeTwoDecimal_f(cao / weight1);
            k2o = changeTwoDecimal_f(k2o / weight1);
            c = changeTwoDecimal_f(c / weight1);
            s = changeTwoDecimal_f(s / weight1);

            result[3] = weight1 + '';
            result[6] = al2o3;
            result[7] = sio2;
            result[8] = fe2o3;
            result[9] = tio2;
            result[10] = cao;
            result[11] = a_s;
            result[13] = k2o;
            result[14] = c;
            result[15] = s;
            return result;
            function changeTwoDecimal_f(x) {
                var f_x = parseFloat(x);
                if (isNaN(f_x)) {
                    return ''
                }
                var f_x = Math.round(x * 100) / 100;
                var s_x = f_x.toString();
                var pos_decimal = s_x.indexOf('.');
                if (pos_decimal < 0) {
                    pos_decimal = s_x.length;
                    s_x += '.';
                }
                while (s_x.length <= pos_decimal + 2) {
                    s_x += '0';
                }
                return s_x;
            }
        },
        /*——————数据采集——————*/
        opendataCol: function () {
            var p_ = top;
            // 正常打开
            p_.layer.open({
                type: 2,
                area: ['1280px', '600px'],
                title: "数据采集",
                content: 'oreDistribution/dataCollection.html?caseName=' + escape(caseName) + '&quality=' + escape($('#quality').find('option:selected').text()) + '&dateTime=' + date + '&caseId=' + caseId,
                btn: ['确定', '关闭'],
                yes: function (index, layero) { //或者使用btn1

                    var innerWindow = layero.find("iframe")[0].contentWindow;
                    var resArr = innerWindow.getValues();
                    innerWindow.pageLoad();
                    for (var i = 0; i < resArr.length; i++) {
                        rowArrAll.push(resArr[i]);
                    }
                    PageModule.rendertable(rowArrAll);
                    top.layer.closeAll();


                },
                cancel: function (index) { //或者使用btn2

                }

            });
        },
        /*子页面数据方法*/
        dataColinit: function () {
            //判断日期大小
            $("#endDate,#startDate").on('change', function () {
                if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                    Mom.layMsg('结束时间应大于起始时间，请重新选择');
                    $('#endDate').val('')
                }
            });
            require(['Page'], function () {
                window.pageLoad = function () {
                    var caseId = Mom.getUrlParam('caseId');
                    var quality = Mom.getUrlParam('quality');
                    var caseName = Mom.getUrlParam('caseName');
                    var dateTime = Mom.getUrlParam('dateTime');
                    $('#caseName').text(caseName);
                    $('#quality').text(quality);
                    $('#Datetime').val(dateTime);

                    //搜索框信息
                    var data = {
                        startDate: $('#startDate').val(),
                        endDate: $('#endDate').val(),
                        caseId: caseId
                    };
                    //渲染表格以及渲染分页
                    var page2 = new Page();
                    page2.pageShowNum = 0;
                    page2.init(Api.aps + "/api/ob/LedgerAccount/collectionData", data, true, function (rows) {
                        PageModule.renderTableSon(rows);
                    });
                };
                $("#search-btn").click(function () {
                    pageLoad();
                });
                pageLoad();
            });
            window.getValues = function () {
                var rows = [];
                $("#dataTable tbody tr td input.i-checks:checkbox:checked").each(function (i, item) {
                    var trs = $(item).parents('tr');
                    rows.push(PageModule.innerval(trs));
                });
                return rows
            };
        },
        /*子页面渲染表格*/
        renderTableSon: function (res) {
            //datatables方法
            $('#dataTable').dataTable({
                "data": res,
                "aoColumns": [
                    {
                        "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                        "render": function (data, type, row, meta) {
                            return data = "<input class='i-checks' data-check=false type='checkbox' id=" + row.id + ">"
                        }
                    },
                    {"data": "checkedDate", 'sClass': "center ", 'sWidth': '11%'},
                    {"data": "sid2", 'sClass': "center", 'sWidth': '7%'},
                    {
                        "data": "al2o3Value", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.al2o3Value = Number(data).toFixed(2);//保留两位小数
                            return row.al2o3Value
                        }
                    },
                    {
                        "data": "sio2Value", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.sio2Value = Number(data).toFixed(2);
                            return row.sio2Value
                        }
                    },
                    {
                        "data": "fe2o3Value", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.fe2o3Value = Number(data).toFixed(2);
                            return row.fe2o3Value
                        }
                    },
                    {
                        "data": "tio2Value", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.tio2Value = Number(data).toFixed(2);
                            return row.tio2Value
                        }
                    },
                    {
                        "data": "caoValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.caoValue = Number(data).toFixed(2);
                            return row.caoValue
                        }
                    },
                    {
                        "data": "aSValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.aSValue = Number(data).toFixed(2);
                            return row.aSValue
                        }
                    },
                    {
                        "data": "tolValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.tolValue = Number(data).toFixed(2);
                            return row.tolValue
                        }
                    },
                    {
                        "data": "k2oValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.k2oValue = Number(data).toFixed(2);
                            return row.k2oValue
                        }
                    },
                    {
                        "data": "cValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.cValue = Number(data).toFixed(2);
                            return row.cValue
                        }
                    },
                    {
                        "data": "sValue", 'sClass': "center", 'sWidth': '4%',
                        "render": function (data, type, row, meta) {
                            row.sValue = Number(data).toFixed(2);
                            return row.sValue
                        }
                    },
                    {"data": "checkedUser", 'sClass': "center", 'sWidth': '4%'},
                    {"data": "auditor", 'sClass': "center", 'sWidth': '5%'},
                    {"data": "censorDate", 'sClass': "center"},
                    {"data": "sendDate", 'sClass': "center"}
                ]
            });
            //渲染勾选框
            renderIChecks();
        },
        /*表格遍历*/
        innerval: function (trs) {
            var rowArr = [];
            var valArr = ['id', 'oreDate', 'sid2', 'al2o3Value', 'sio2Value', 'fe2o3Value', 'tio2Value', 'caoValue',
                'aSValue', 'tolValue', 'k2oValue', 'cValue', 'sValue', 'peo1', 'peo2', 'samplingDate', 'subDate', 'laboratoryId'];
            var dataObj = {};
            $(trs).find('td').each(function (i, item) {
                rowArr.push($(item).text());
            });
            rowArr.splice(0, 1, '');
            rowArr.push($(trs).find('input.i-checks').attr('id'));

            for (var i = 0; i < valArr.length; i++) {
                dataObj[valArr[i]] = rowArr[i];
            }
            return dataObj
        }
    };


    $(function () {
        if ($('#ledger').length > 0) {
            PageModule.init();
        } else if ($('#dataCollection').length > 0) {
            PageModule.dataColinit();
        }

    });

});
