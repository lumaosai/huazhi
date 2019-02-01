/**
 * Created by admin on 2018/8/20.
 */
require(['/js/zlib/app.js'], function (App) {
            var PageModule = {
                type:"",
                dataArr:[],
                //列表页
                init:function () {
                    require(['Page'], function () {
                        //时间选择插件
                        $("#startDate,#endDate,#startDate1").val("").click(
                            function(){ WdatePicker(); }
                        );
                        //判断日期大小
                        $("#endDate,#startDate").on('change', function () {
                            if ($('#endDate').val() < $('#startDate').val() && $('#endDate').val() != '') {
                                Mom.layMsg('结束时间应大于起始时间，请重新选择');
                                $('#endDate').val('')
                            }
                        });

                        //通过字典配置创建信息
                        Api.ajaxForm(Api.admin + "/api/sys/SysDict/type/STOCKTAKE_TYPE",{},function (result) {
                            if(result.success){
                                var rows = result.rows;
                                Bus.appendOptionsValue($('#oreType'), rows, 'value', 'label');
                                var result = PageModule.gettype(result.rows);
                                //创建新增按钮
                               for(var i=0;i<result.length;i++){
                                    var createBn = "<button type='"+result[i].typeMy+"' class='tabbtn btn btn-white'>"+result[i].label+"</button>";
                                    $(".tabbtnbig").append(createBn);
                               }
                               //点击新增按钮跳转页面
                                $(".tabbtn").each(function (index,item) {
                                    $(item).unbind("click").on("click",function () {
                                        $(this).addClass("active");
                                        $(this).siblings('.tabbtn').removeClass('active');
                                        location.href = "./create"+$(this).attr("type")+".html?type="+$(this).attr("type");
                                    })
                                });
                            }
                        });
                        window.pageLoad = function () {
                            var data = {
                                startDate:$("#startDate").val(),
                                endDate:$("#endDate").val(),
                                stocktakeType:$("#oreType option:selected").val(),
                                status:$("#oreStatua option:selected").val(),
                                fstMan:$("#supplierName").val(),
                            };
                            new Page().init(Api.aps+"/api/aps/collect/page",data,true,function(result) {
                                var result = PageModule.gettype(result);
                                PageModule.createTable(result);
                                //查看
                                $(".btn-check").unbind("click").on("click",function () {
                                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                    var typeMy = $(this).parents("tr").find('.i-checks').attr('typeMy');
                                    var createData =  $(this).parents("tr").find("td").eq(2).text();
                                    var alltr = PageModule.getuserMsg($(this));
                                    location.href = "./create"+alltr.typeMy+".html?type="+alltr.typeMy+"&id="+alltr.id+"&data="+alltr.createData+"&check="+"check"+"&thrman="+alltr.thrman+"&secMan="+alltr.secMan+"&status="+alltr.status;
                                });
                                //修改
                                $(".btn-change").unbind("click").on("click",function () {
                                    var id = $(this).parents("tr").find('.i-checks').attr('id');
                                    var typeMy = $(this).parents("tr").find('.i-checks').attr('typeMy');
                                    var createData =  $(this).parents("tr").find("td").eq(2).text();
                                    var alltr = PageModule.getuserMsg($(this));
                                    location.href = "./create"+alltr.typeMy+".html?type="+alltr.typeMy+"&id="+alltr.id+"&data="+alltr.createData+"&thrman="+alltr.thrman+"&secMan="+alltr.secMan+"&status="+alltr.status;
                                });
                                //单个删除
                                $(".btn-delete").unbind("click").on("click",function () {
                                    var ids = $(this).parents("tr").find('.i-checks').attr('id');
                                    Bus.deleteItem('确定要删除该信息', Api.aps + '/api/aps/collect/delete', {ids:ids});
                                })
                            });
                            //多个删除
                            $("#delbtn").unbind("click").on("click",function () {
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
                                            var url = Api.aps + '/api/aps/collect/delete';
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
                                        }
                                        top.layer.close(index);
                                    });

                                } else {
                                    Mom.layMsg("请选择至少一条数据！");
                                }
                            })
                        };
                        window.pageLoad();
                    });
                },
                //数据类型下拉选择
                selectKind: function () {
                    var url = Api.admin + "/api/sys/SysDict/type/ORE_TYPE";
                    Api.ajaxForm(url, {}, function (result) {
                        var rows = result.rows;
                        Bus.appendOptionsValue($('#oreType'), rows, 'value', 'label');
                        for(var i=0;i<rows.length;i++){
                            PageModule.oreType.push(rows[i].value);
                        }
                    })
                },
                //列表页面创建table
                createTable:function (tableDate) {
                    $("#treeTable").dataTable({
                        "data": tableDate,
                        "aoColumns": [
                            {
                                "data": "id", "sWidth": "10px;", "defaultContent": "", 'sClass': "center",
                                "render": function (data, type, row, meta) {
                                    var data = "";
                                    if(row.status == "1"){
                                        data = "<input type='hidden'  data-status = '"+row.status+"' data-createData='"+row.stocktakeDate+"'  data-thrMan='"+row.thrMan+"'  data-secMan = '"+row.secMan+"'  data-typeMy ='"+row.typeMy+"'  id=" + row.id + "   class='i-checks'>";
                                    }else{
                                        data = "<input type='checkbox' data-status = '"+row.status+"' data-createData='"+row.stocktakeDate+"'  data-thrMan='"+row.thrMan+"'  data-secMan = '"+row.secMan+"'  data-typeMy ='"+row.typeMy+"'  id=" + row.id + "   class='i-checks'>";
                                    }
                                    return data;
                                }
                            },
                            {"data": null, 'sClass': "center ", "width": "4%"},
                            {"data": "stocktakeDate", 'sClass': "center ", "width": "10%"},
                            {"data": "stocktakeTypeName", 'sClass': "center", "width": "17%"},
                            {"data": "status", 'sClass': "center", "width": "8%",
                                "render":function (data, type, row, meta) {
                                var str = "";
                                var setColor = "";
                                    if (row.status == "0"){
                                        str = "未封存";
                                        setColor = "col-394";
                                    }else if(row.status == "1"){
                                        str = "已封存";
                                        setColor = "col-5e9";
                                    }else if(row.status == "2"){
                                        str = "已解封";
                                        setColor = "col-c5c";
                                    }
                                    return "<span class='" + setColor + "' data-status='" + row.status + "'>" + str + "</span >";
                                }
                            },
                            {"data": "fstMan", 'sClass': "center"},
                            {"data": "createDate", 'sClass': "center","width": "10%"},
                            {"data": null, 'sClass': "center autoWidth",
                                "render":function (data, type, row, meta) {
                                    var html =  "<a class='btn btn-info btn-xs btn-check' ><i class='fa fa-search-plus'></i>查看</a >";
                                    if(row.status == "0"){
                                        html+="<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >"+
                                              "<a class='btn btn-success btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >";
                                    }else if(row.status == "1"){
                                        html = html;
                                    }else if(row.status == "2"){
                                        html+="<a class='btn btn-success btn-xs btn-change' ><i class='fa icon-change'></i>修改</a >"+
                                              "<a class='btn btn-success btn-xs btn-delete' ><i class='fa fa-trash-o'></i>删除</a >";
                                    }
                                    return html;
                                }
                            }
                        ],
                        "fnDrawCallback" : function(){
                            this.api().column(1).nodes().each(function(cell, i) {
                                cell.innerHTML =  i + 1;
                            });
                        },
                    });
                    renderIChecks();

                },
                getuserMsg:function (obj) {
                    var $iChecks = obj.parents("tr").find('.i-checks');
                    var getAttrObj = {
                        "id": $iChecks.attr('id'),
                        "secMan": $iChecks.attr('data-secMan'),
                        "thrman": $iChecks.attr('data-thrman'),
                        "typeMy": $iChecks.attr('data-typemy'),
                        "createData": $iChecks.attr('data-createData'),
                        "status":$iChecks.attr('data-status')
                    };
                    return getAttrObj;
                },
                gettype:function (result) {
                    for(var i=0;i<result.length;i++){
                        if(result[i].value == "KSSHCC" || result[i].stocktakeType == "KSSHCC"){
                            result[i].typeMy = "Mineral";
                        }else if(result[i].value == "YHLCQYHLDZ" || result[i].stocktakeType == "YHLCQYHLDZ"){
                            result[i].typeMy = "NaoHAL";
                        }else if(result[i].value == "FJCYWCL" || result[i].stocktakeType == "FJCYWCL"){
                            result[i].typeMy = "Decgroove";
                        }else if(result[i].value == "DCSCGYW" || result[i].stocktakeType == "DCSCGYW"){
                            result[i].typeMy = "dcs";
                        }else if(result[i].value == "MC" || result[i].stocktakeType == "MC"){
                            result[i].typeMy = "Deposit";
                        }else if(result[i].value == "GCWL" || result[i].stocktakeType == "GCWL"){
                            result[i].typeMy = "Process";
                        }else if(result[i].value == "JCWL" || result[i].stocktakeType == "JCWL"){
                            result[i].typeMy = "Field";
                        }
                    }
                    return result;
                },
            };
            $(function () {
                if ($('#datacollection').length > 0) {
                    PageModule.init();
                }else if($("#createshihui").length>0){
                    PageModule.checkInit();
                }
            });
    });
