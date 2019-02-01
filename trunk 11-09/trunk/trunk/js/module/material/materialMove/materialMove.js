require(['/js/zlib/app.js'], function (App) {
    //引入用户登录校验
    require(['checkUser']);
    /**作者：贾旭光
     *日期：2018.10.17
     *描述：
     */
    var PageModule = {
        materialMoveInit: function () {
            var temPlate = [];
            $.get("../../json/factoryModel/materialMove/tankManage.json", function (result) {
                temPlate = result.rows[1];
                var primaryTable = result.rows[1].primaryTable;
                var seedTable = result.rows[1].seedTable;
                PageModule.materialMgetData(primaryTable, seedTable)

            });
        },
        //请求拿数据
        materialMgetData: function (primaryTable, seedTable) {
            /*拿data数据*/
            var data = {
                nodeTankId: '1e7e6ea2a4424375acdc080a73079f10', /**/
                date: '2018-10-22',/**/
                shift: '00:00:00-22:00:00',/**/
                areaTankId: '467529a79f36414ba9f803def3a86cae'/**/
            };
            Api.ajaxForm(Api.mtrl + "/api/mv/TankChk/TankList", data, function (result) {
                if (result.success) {
                    PageModule.renderPotTable(primaryTable, seedTable, result);
                } else {
                    Mom.layAlert(result.message);
                }
            });
        },
        /**罐规则数据potArr,*移动规则数据moveArr,*父表罐的请求数据 result*/
        renderPotTable: function (potArr, moveArr, result) {
            require(['jqGrid_my'], function (jqGridAll) {
                var optionsPot = {
                    colNames: potArr[0].colNames,
                    colModel: potArr[0].colModel,
                    data: result.rows,
                    multiselect: true
                };
                var optionsMMove = {
                    colNames: moveArr[0].colNames,
                    colModel: [
                        {"name": "id", "label": "id", "align": "center", "hidden": true},
                        {"name": "moveType", "label": "moveType", "align": "center", "hidden": true},
                        {"name": "mtrlMvOprtTypeLabel", "label": "mtrlMvOprtTypeLabel", "align": "center"},
                        {"name": "nodename", "label": "nodename", "align": "center",formatter:function(cellvalue, options, rowObject){return rowObject.dlvNode.nodename;}},
                        {"name": "getNode", "label": "getNode", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.rcvNode.nodename;}},
                        {"name": "begMvDate", "label": "begMvDate", "align": "center"},
                        {"name": "endMvDate", "label": "endMvDate", "align": "center"},
                        {"name": "dlvMtrl", "label": "dlvMtrl", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.dlvMtrl.mtrlName;}},
                        {"name": "rcvMtrl", "label": "rcvMtrl", "align": "center", formatter:function(cellvalue, options, rowObject){return rowObject.rcvMtrl.mtrlName;}},
                        {"name": "dlvStatus", "label": "dlvStatus", "align": "center"},/**/
                        {"name": "rcvStatus", "label": "rcvStatus", "align": "center"},/**/
                        {"name": "dlvPreChkCont", "label": "dlvPreChkCont", "align": "center"},
                        {"name": "dlvAftChkCont", "label": "dlvAftChkCont", "align": "center"},
                        {"name": "rcvPreChkCont", "label": "rcvPreChkCont", "align": "center"},
                        {"name": "rcvAftChkCont", "label": "rcvAftChkCont", "align": "center"},
                        {"name": "createName", "label": "createName", "align": "center"},
                        {"name": "createDate", "label": "createDate", "align": "center"},
                        {"name": "clsBy", "label": "clsBy", "align": "center"},
                        {"name": "clsDate", "label": "clsDate", "align": "center"}
                    ]
                    ,
                    multiselect: true
                };
                /* $('shiftHidden').attr('data-nodeTankId); */
                /* $('#tankDate').val(); */
                /* $('#clsses option:selected').val(); */
                var data = {
                    id: '470dca52dbeb45288afb4769a33b6226'/**/
                };
                var config = {
                    url: Api.mtrl + '/api/mv/TankMtrlMove/list/' + data.id,
                    dataParams: {
                        id: '470dca52dbeb45288afb4769a33b6226',/**/
                        date: '2018-10-22',/**/
                        shift: '00:00:00-22:00:00'/**/
                    },
                    contentType: 'Form'
                };
                var MMovesubTable = [];
                var subTableId;
                //拿到子表id
                jqGridAll.jG_jqGridTableLevel('#materialMTable', optionsPot, optionsMMove, config, MMovesubTable, function (res) {
                    subTableId = res;
                    //编辑
                    var subtr = '.ui-subgrid .subgrid-data table tr.ui-widget-content';
                    $(subtr).each(function () {
                        $(this).on('dblclick', function () {
                            var moveType = $(this).find('td').eq(2).attr('title');
                            if (moveType != 'TANK_TO_TANK') {
                                Mom.layAlert('请选择罐付罐类型物料移动数据，其他物料移动数据无法进行编辑')
                            } else {
                                var potDate = '2018-10-22';/**/
                                /*$('#tankDate').val();*/
                                var classes = '00:00:00-22:00:00)';/**/
                                /*$('#clsses option:selected').val();*/
                                Bus.openEditDialog('新建物料移动信息', 'material/materialMove/addMove.html?potDate=' + potDate + '&classes=' + escape(classes), '681px', '495px',function () {

                                })
                            }
                        })
                    })


                });


                //添加按钮
                $('#btn-add').unbind('click').on('click', function () {
                    var arr = jqGridAll.jG_getCheckAllIds('#materialMTable');
                    var arrSubOne = [];
                    $(subTableId).each(function (i, item) {
                        var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                        $(subArr).each(function (a, aitem) {
                            //拿到被选中的子表id
                            arrSubOne.push(aitem);
                        })
                    });
                    if (arr.length > 1) {
                        Mom.layAlert('只能选择一个槽/罐进行新建物料移动')
                    } else if (arr.length == 0 || arrSubOne.length != 0) {
                        Mom.layAlert('请选择一个槽/罐进行新建物料移动')
                    } else {
                        /**列表页主表少俩参数  固/液质量 提交状态*/
                        var getparam=$('#materialMTable').getGridParam('selrow');
                        var thisStatu=$('#materialMTable').getCell(getparam,'submissionState');
                        if(thisStatu=='1'){
                            Mom.layAlert('已提交的槽/罐信息无法进行物料移动')
                        }else{
                            var tankId=$('#materialMTable').getCell(getparam,'tankId');
                            var potDate = '2018-10-22';/**/
                            /*$('#tankDate').val();*/
                            var classes = '00:00:00-22:00:00';/**/
                            /*$('#clsses option:selected').val();*/

                            /*递交参数*/
                            var tankOptions = {
                                btnArr: [
                                    {
                                        btn: '确定', fn: function (layerIdx, layero) {


                                        //先还原所有的input框的disabled属性
                                        var iframeWin = layero.find('iframe')[0].contentWindow;
                                        iframeWin.removeAttr();
                                        iframeWin.Submit();
                                        // top.layer.close(layerIdx);
                                        PageModule.materialMoveInit();
                                    }
                                    }
                                ]
                            };
                            Bus.openDialogCfg('新建物料移动信息', 'material/materialMove/addMove.html?potId=' + tankId + '&potDate=' + potDate + '&classes=' + escape(classes), '681px', '495px', tankOptions)
                        }

                    }
                });
                //关闭按钮
                $('#btn-close').unbind('click').on('click', function () {
                    var arr = jqGridAll.jG_getCheckAllIds('#materialMTable');
                    var arrSubOne = [];
                    //拿到所有展开的主表id
                    if (subTableId == undefined || arr.length > 0) {
                        Mom.layAlert('请选择一项物料移动数据进行关闭')
                    } else {
                        $(subTableId).each(function (i, item) {
                            var subArr = jqGridAll.jG_getCheckAllIds('#' + item);
                            $(subArr).each(function (a, aitem) {
                                //拿到被选中的子表id
                                arrSubOne.push(aitem);
                            })
                        });
                        if (arrSubOne.length > 1 || arrSubOne.length < 1) {
                            Mom.layAlert('请选择一项物料移动数据进行关闭')
                        } else {
                            moveType = $('#' + arrSubOne[0]).find('td').eq(2).attr('title');
                            var potDate = '2018-10-22';
                            /*$('#tankDate').val();*/
                            var classes = '早班(00:00:00-22:00:00)';
                            /*$('#clsses option:selected').val();*/
                            Bus.openEditDialog('关闭物料移动', 'material/materialMove/addMove.html?moveId=' + arrSubOne[0] + '&potDate=' + potDate + '&classes=' + escape(classes) + '&moveType=' + moveType, '681px', '495px')
                        }
                    }
                });
            })
        },
        //移动弹出页
        addMoveInit: function () {
            var potId = Mom.getUrlParam('potId');
            var moveId = Mom.getUrlParam('moveId');
            var moveDate = Mom.getUrlParam('potDate');
            var classes = Mom.getUrlParam('classes');
            var moveType = Mom.getUrlParam('moveType');
            require(['datetimepicker', 'Page'], function () {

                //新增
                if (moveId == null && potId != null) {
                    //初始化是否可编辑项
                    tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,#oppositeNode,#oppositeMaterial,#startTime', '#startTime', true);
                    /*初始化对方节点*/
                    nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                    openVal('.dlvVal');
                    $('#operationType').on('change', function () {
                        var moveTypeS = $('#operationType option:selected').val();
                        $('#ownQuantity,#oppositeQuantity').val('');

                        //罐付罐
                        if (moveTypeS == 'TANK_TO_TANK') {
                            //初始化是否可编辑项

                            tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime', false);
                            /*初始化对方节点*/
                            nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                            /*本方量对方量 检尺回显方法*/
                            openVal('.dlvVal');
                            openVal('.rcvVal');
                        }
                        //罐收付进出厂点
                        else if (moveTypeS == 'TANK_RETO_IOF' || moveTypeS == 'TANK_TO_IOF') {
                            //初始化是否可编辑项
                            tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#oppositeMaterial,#startTime', '#startTime', false);
                            /*初始化对方节点*/
                            nodeToMtrl(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId,Api.mtrl+'/api/mv/TankMtrlMove/getListByType', '#oppositeNode', '#oppositeMaterial', '#oppositealias', true);
                            openVal('.dlvVal','.rcvVal');

                        }
                        //罐收付料线
                        else if (moveTypeS == 'TANK_RETO_LINE' || moveTypeS == 'TANK_TO_LINE') {
                            tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td', '#operationType,input:checkbox,#oppositeNode,#startTime', '#startTime', false);
                            openVal('.dlvVal','.rcvVal');
                        }
                        //特殊操作项
                        //槽罐改名和退库编辑项相同
                        else if (moveTypeS == 'TANK_MOD' || moveTypeS == 'TANK_RETO_STOREHOUSE') {
                            $('table tr td:nth-of-type(4)').each(function (i, item) {
                                $(this).find('input').attr('readonly', 'readonly', 'disabled', 'disabled');
                                $(this).find('input:checkbox,select').attr('disabled', 'disabled');
                            });
                            tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td:nth-of-type(2)', '#operationType,#ownMaterials,#ownMaterial,#startTime', '#startTime', false);




                            var html='<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                            $('#ownMaterial').parents('td').append(html);
                            $('#ownMaterial').remove();
                            openVal('.dlvVal','.rcvVal');
                        }
                        //交库||复尺
                        else if (moveTypeS == 'TANK_TO_STOREHOUSE' || moveTypeS == 'TANK_RE_CHK') {
                            $('table tr td:nth-of-type(4)').each(function (i, item) {
                                $(this).find('input').attr('readonly', 'readonly', 'disabled', 'disabled');
                                $(this).find('input:checkbox,select').attr('disabled', 'disabled');
                            });
                            tankMove(Api.mtrl+'/api/mv/TankMtrlMove/form/'+potId, 'table tr td:nth-of-type(2)', false, false, false);
                            if (moveTypeS == 'TANK_RE_CHK') {
                                $('#operationType,#startTime').removeAttr('disabled').removeAttr('readonly');
                                $('#ownMaterial').attr('disabled', 'disabled');
                                openVal('.dlvVal','.rcvVal');
                            } else {

                                $('#operationType,#ownMaterial,#ownMaterials,#startTime').removeAttr('disabled').removeAttr('readonly');
                                var html='<select  id="ownMaterials" name="dlvMtrl.mtrlName" class="form-control"></select>';
                                $('#ownMaterial').parents('td').append(html);
                                $('#ownMaterial').remove();
                                openVal('.dlvVal','.rcvVal');
                            }
                        }
                    });
                }
                //关闭
                else if (potId == null && moveId != null) {
                    // /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                    // tankMove(Api.mtrl+'/api/mv/TankMtrlMove/update'+potId, 'table tr td', '#endTime', '#endTime', false);
                    Api.ajaxJson(Api.mtrl+'/api/mv/TankMtrlMove/view/'+moveId,{},function (result) {
                        console.log(result);
                        if(result.success){

                            var nodehtml='<input type="text" disabled id="rcvNodeName" name="rcvNode.nodename" class="form-control">';
                            var mtrlHtml='<input type="text" disabled id="rcvMtrlName" name="rcvMtrl.mtrlName" class="form-control">';
                            $('#oppositeNode').parents('td').append(nodehtml);
                            $('#oppositeNode').remove();
                            $('#oppositeMaterial').parents('td').append(mtrlHtml);
                            $('#oppositeMaterial').remove();

                            Validator.renderData(result.NodeMtrlMove, '#inputForm');
                            openVal('.dlvVal');
                            openVal('.rcvVal');
                        }else{
                            Mom.layAlert(result.message)
                        }

                    });
                    $('input').attr('disabled', 'disabled');
                    $('input:checkbox').attr('disabled', 'disabled');
                    $('select').attr('disabled', 'disabled');
                    $('#endTime').removeAttr('disabled').removeAttr('readonly')
                    if (moveType == 'TANK_TO_TANK') {
                        $('#oppositeQuantity').removeAttr('disabled').removeAttr('readonly');
                    }
                    //判断日期大小
                    $("#endTime").on('change', function () {
                        if ($('#endTime').val() < $('#startTime').val() && $('#endTime').val() != '') {
                            Mom.layMsg('结束时间应大于开始时间，请重新选择');
                            $('#endTime').val('')
                        }
                    });
                    //时间选择插件
                    $("#endTime").val("").datetimepicker({
                        bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                        format: "yyyy-mm-dd hh:ii:ss",  //保留到日
                        showMeridian: true,     //显示上、下午
                        language: "zh-CN",   //中文显示
                        minView: "0",    //月视图
                        autoclose: true,  //选择时间后自动隐藏
                        clearBtn: true,
                        todayBtn: true
                    });
                }
                //编辑
                else if (moveId == null && potId == null) {
                    /*只有罐付罐可以编辑 并且只有对方量可以编辑 点击确定拿到对方量*/
                    $('input').attr('disabled', 'disabled');
                    $('input:checkbox').attr('disabled', 'disabled');
                    $('select').attr('disabled', 'disabled');
                    $('#oppositeQuantity').removeAttr('disabled').removeAttr('readonly')
                }

                //填选择器 用来获取本方量对方量
                function openVal(selector,closeSel) {
                    /*本方量对方量弹窗*/
                    var tankOptions = {
                        btnArr: [
                            {
                                btn: '数据采集', fn: function (layerIdx, layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getTankFormData();
                                if (formData) {
                                    var data = formData.data;
                                    //调用接口：生成数据采集数据
                                    Api.ajaxJson(formData.url, JSON.stringify(data), function (result) {
                                        if (result.success == true) {
                                            var wuliao = result.AA.wuliao || data.wuliao;
                                            //更新选中行中的物料数据

                                        } else {
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }
                            },
                            {
                                btn: '槽/罐量计量', fn: function (layerIdx, layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var formData = iframeWin.getTankFormData();
                                if (formData) {
                                    var data = formData.data;
                                    //调用接口：生成数据采集数据
                                    Api.ajaxJson(formData.url, JSON.stringify(data), function (result) {
                                        if (result.success == true) {
                                            var wuliao = result.AA.wuliao || data.wuliao;
                                            //更新选中行中的物料数据

                                        } else {
                                            Mom.layAlert(result.message);
                                        }
                                    });
                                }
                            }
                            },
                            {
                                btn: '确定', fn: function (layerIdx, layero) {
                                var iframeWin = layero.find('iframe')[0].contentWindow;
                                var tanval = iframeWin.getTankFormData(true);
                                $(selector).find('input:text').val(tanval);
                                top.layer.close(layerIdx);
                            }
                            }
                        ]
                    };
                    $(selector).unbind("click").on("click", function () {
                        Bus.openDialogCfg("槽/罐检尺信息录入", "../material/materialMove/informationEntryFrom.html", '1128px', '692px', tankOptions);

                    });
                    $(closeSel).unbind('click')
                }
                // 判断input、select是否可用
                // selector所有遍历元素
                // removeAS删除属性的元素 字符串 如多个加逗号
                // timeS如果有可编辑的时间 加times参数 选择器 传字符串
                function tankMove(url, selector, removeAS, timeS, appendFlag) {
                    var data={
                        id:potId,
                        date:moveDate,
                        shift:classes
                    };
                    /*初始化渲染数据*/
                    Api.ajaxForm(url, data, function (result) {
                        if (result.success) {
                            if (appendFlag) {
                                Bus.appendOptionsValue($('#operationType'), result.moveTypeList);
                            }
                            Validator.renderData(result.nodeMtrlMove, '#inputForm')
                        } else {
                            Mom.layAlert(result.message);
                        }
                    });


                    $(selector).each(function () {
                        $(this).find('input:text').attr('disabled', 'disabled');
                        $(this).find('select').attr('disabled', 'disabled').addClass('dis');
                    });
                    if (removeAS) {
                        $(removeAS).removeAttr('disabled').removeAttr('readonly').removeClass('dis');
                    }
                    //时间选择插件
                    if (timeS) {
                        $(timeS).val("").datetimepicker({
                            bootcssVer: 3, //显示箭头，部分如不显示箭头要加这个
                            format: "yyyy-mm-dd hh:ii:ss",  //保留到日
                            showMeridian: true,     //显示上、下午
                            language: "zh-CN",   //中文显示
                            minView: "0",    //月视图
                            autoclose: true,  //选择时间后自动隐藏
                            clearBtn: true,
                            todayBtn: true
                        });
                    }
                }




                //左侧特殊修改物料联动别名
                function spcNodeMtrl(url1,url, parSel, midSel, selector,ischange) {
                    var dataOne={
                        id:potId,
                        date:moveDate,
                        shift:classes
                    };
                    Api.ajaxForm(url1, dataOne, function (result) {
                        if (result.success) {
                            var dlvNodeId = result.nodeMtrlMove.dlvNode.id;
                            var dlvMtrlId = result.nodeMtrlMove.dlvMtrl.id;
                            var val = $('.form-table').find('.checked');
                            var valUseTopo;
                            val.length > 0 ? valUseTopo = '1' : valUseTopo = '0';
                            var data = {
                                dlvNodeId: dlvNodeId,
                                date: moveDate,
                                shift: classes,
                                dlvMtrlId: dlvMtrlId,
                                mtrlMvOprtType: $('#operationType option:selected').val(),
                                useTopo: valUseTopo
                            };
                        } else {
                            Mom.layAlert(result.message);
                        }
                    });
                }

                // parSel父级节点选择器 parRows父级数据列表
                // midSel中级节点选择器 midRows中级数据列表
                // select子级节点选择器 ischange 意思是是如果二级不动的话 一级动 二三级一起变 传布尔值
                //前提 数据格式不能变 参数不能变 其次 三级必须得是 1、select 2、select 3、input
                function nodeToMtrl(url1,url, parSel, midSel, selector,ischange) {
                    var dataOne={
                        id:potId,
                        date:moveDate,
                        shift:classes
                    };
                    Api.ajaxForm(url1, dataOne, function (result) {
                        console.log(result);
                        if (result.success) {
                           var dlvNodeId=result.nodeMtrlMove.dlvNode.id;
                           var dlvMtrlId=result.nodeMtrlMove.dlvMtrl.id;
                            var val=$('.form-table').find('.checked');
                            var valUseTopo;
                            val.length>0?valUseTopo='1':valUseTopo='0';
                            var data={
                                dlvNodeId:dlvNodeId,
                                date:moveDate,
                                shift:classes,
                                dlvMtrlId:dlvMtrlId,
                                mtrlMvOprtType:$('#operationType option:selected').val(),
                                useTopo:valUseTopo
                            };
                            /*初始化对方节点*/
                            Api.ajaxJson(url, JSON.stringify(data), function (result) {
                                if (result.success) {
                                    $(parSel).empty();
                                    Bus.appendOptionsValue($(parSel), result.NodeList, 'id', 'nodename');
                                    nodeMtrl(parSel, result.NodeList, midSel, selector, ischange);
                                } else {
                                    Mom.layAlert(result.message);
                                }
                            });
                            function nodeMtrl(parSel, parRows, midSel, selector, ischange) {
                                //默认进来的时候
                                $(parRows).each(function (e, eitem) {
                                    var id = $(parSel + ' option:selected').val();
                                    if (id == eitem.id) {
                                        $(midSel).empty();
                                        Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                                        $(parRows[e].mtrlList).each(function (q, qitem) {
                                            idsub = $(midSel + ' option:selected').val();
                                            if (idsub == qitem.id) {
                                                $(selector).val(parRows[e].mtrlList[q].mtrlAlias)
                                            }
                                            $(midSel).on('change', function () {
                                                $(parRows[e].mtrlList).each(function (d, ditem) {
                                                    var idchange = $(midSel + ' option:selected').val();
                                                    if (idchange == ditem.id) {
                                                        if(parRows[e].mtrlList[d].mtrlAlias!=undefined){
                                                            $(selector).val(parRows[e].mtrlList[d].mtrlAlias)
                                                        }
                                                    }
                                                })
                                            })
                                        });
                                    }
                                });
                                //变化的时候执行
                                $(parSel).on('change', function () {
                                    var id = $(parSel + ' option:selected').val();
                                    var idsub;

                                    $(parRows).each(function (e, eitem) {
                                        if (id == eitem.id) {
                                            $(midSel).empty();
                                            if(parRows[e].mtrlList.length>0){
                                                $(selector).val('')
                                                Bus.appendOptionsValue($(midSel), parRows[e].mtrlList, 'id', 'mtrlName');
                                                $(parRows[e].mtrlList).each(function (q, qitem) {
                                                    idsub = $(midSel + ' option:selected').val();
                                                    if (idsub == qitem.id) {
                                                        if(parRows[e].mtrlList[q].mtrlAlias!=undefined){
                                                            $(selector).val(parRows[e].mtrlList[q].mtrlAlias)
                                                        }else{
                                                            $(selector).val('')
                                                        }
                                                    }
                                                });
                                                if (ischange) {
                                                    $(midSel).on('change', function () {

                                                        $(parRows[e].mtrlList).each(function (d, ditem) {
                                                            var idchange = $(midSel + ' option:selected').val();
                                                            if (idchange == ditem.id) {
                                                                if(parRows[e].mtrlList[d].mtrlAlias!=undefined){
                                                                    $(selector).val(parRows[e].mtrlList[d].mtrlAlias)
                                                                }

                                                            }
                                                        })

                                                    })
                                                }
                                            }else{
                                                $(selector).val('')
                                            }

                                        }
                                    })
                                })
                            }
                        } else {
                            Mom.layAlert(result.message);
                        }

                    });

                }
                window.removeAttr = function () {
                    $('select,input:text,input:checkbox').removeAttr('disabled', 'disabled')
                };
                window.Submit=function () {
                    // if(!Validator.valid(document.forms[0],1.3)){
                    //     return false;
                    // }
                    //自定义校验
                    var formObj = $('#inputForm');
                    var url = formObj.attr('action');
                    var formdata = formObj.serializeJSON();
                    Api.ajaxJson(url,JSON.stringify(formdata),function(result){
                        console.log(formdata,result);
                        if(result.success == true){
                            Mom.layMsg('操作成功', 1000);
                        }else{
                            Mom.layAlert(result.message);
                        }
                    });
                }
            });
        }
    };
    $(function () {
        //参数配置列表
        if ($('#materialMove').length > 0) {
            PageModule.materialMoveInit();
        } else if ($('#addMove').length > 0) {
            PageModule.addMoveInit();
        }

    })

});