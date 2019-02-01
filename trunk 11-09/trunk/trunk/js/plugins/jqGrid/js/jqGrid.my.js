define(['/js/plugins/jqGrid/js/grid.locale-cn.js'], function (require) {
    Mom.include('jqGrid_css', '/js/plugins/jqGrid/css/', [
        'themes/start/jquery-ui-1.8.20.custom.css',
        'ui.jqgrid.css',
        'jqGrid_my.css'
    ]);
    // $.parser.parse();
    var jqGridAll = {
        //data本地请求后传参
        configData: function (jsonData) {
            return {
                data: jsonData,//组件创建完成之后请求数据的url
                datatype: "local",//引入数据类型
                mtype: "GET"//请求方式
            }
        },
        //折叠表本地参数
        configUrl: function () {
            return {
                data: '',
                datatype: "json"
            }
        },
        //基础设置
        config: function (title, colNames, colModel,rownum) {
            /*返回的数据、表标题、表头th名称、内容模型(列),数据条数，需要计算的列明如‘daylan’*/

            return {
                height: '40%',//高度
                colNames: colNames,//jqGrid的列显示名字
                colModel: colModel,//表格内容规则
                width: '100%',//宽度
                autowidth: true,//自适应宽度
                caption: title,//表格的标题名字
                forceFit: false,//调整列宽度不会改变表格的宽度
                shrinkToFit: true, //缩小到合适
                rowNum: rownum
            }
        },
        //是否编辑  编辑项目对传过来的数据有要求 ID不能重复 如果重复 失焦的时候会导致乱序
        editFn: function () {
            return {
                cellsubmit: 'clientArray', //表格递交位置
                editurl: 'clientArray',    //编辑保存地址
                cellEdit: true           //编辑单个元格
            }
        },
        //编辑列方法 表格id 第二个参数是否是最后一行 第三个参数true false 输入的是否为数字并且保留两位小数
        editRowFn: function (tableId,lastsel,isNumber) {
            return {
                cellsubmit: 'clientArray', //表格递交位置
                editurl: 'clientArray',    //编辑保存地址
                onSelectRow: function (id,status) {
                    if (id && id !== lastsel) {
                        $(tableId).saveRow(lastsel, false, 'clientArray');
                        $(tableId).restoreRow(lastsel);
                        $(tableId).editRow(id, false);
                        lastsel = id;


                    }
                    if(isNumber){
                        //正则匹配每个临时的input输入框
                        $(tableId).find('input[type=text]').each(function () {
                            $(this).on('keyup',function () {
                                var val=$(this).val();
                                var regForEdit=/^\d+(\.\d{0,2})?$/;
                                if(!regForEdit.test(val)){
                                    $(this).val('');
                                    Mom.layMsg('请输入数字,且保留两位小数');
                                }

                            })
                        })
                    }
                }
            }
        },
        //计算 需要和config合并 通过$.extend()拼接对象
        conSum: function (tabName, sumCol) {
            return {
                gridview: true,//构造一行数据后添加到grid中
                footerrow: true,
                loadComplete: function () {
                    //失去焦点的时候 让td渲染上input填写的值
                    $('input[type=text].editable').each(function (i, item) {
                        $(item).on('blur', function () {
                            $(this).parents('td').text($(this).val());
                            $(this).remove();
                        })
                    });
                    var sumObj = {};
                    for (var e = 0; e < sumCol.length; e++) {
                        var sumValue = $(tabName).getCol(sumCol[e], true, 'sum');
                        sumObj[sumCol[e]] = sumValue;
                    }
                    $(tabName).footerData('set', sumObj);//合计值存放位置以真实数据位置为准
                },
                onCellSelect: function () {
                    //点击的时候 让td渲染上input填写的值
                    $('input[type=text].editable').each(function (i, item) {
                        $(this).parents('td').text($(this).val());
                    });
                    var sumObj = {};
                    for (var e = 0; e < sumCol.length; e++) {
                        var sumValue = $(tabName).getCol(sumCol[e], true, 'sum');
                    }
                    $(tabName).footerData('set', sumObj);//合计值存放位置以真实数据位置为准
                }
            }
        },
        gridComplete:function (gridName,CellName) {
            return {
                sortname: 'name',
                gridComplete:function () {
                    jqGridAll.MergerStatistics(gridName, CellName)
                }
            }
        },
        //合并列方法 两个参数分别为合并的表id 以及列名
        MergerStatistics: function (gridName, CellName) {
            //当前显示多少条
            gridName = gridName.substring(0,1)=="#"?gridName.substring(1):gridName;
            var mya = $("#" + gridName + "").getDataIDs();
            var length = mya.length;
            for (var i = 0; i < length; i++) {
                //从上到下获取一条信息
                var before = $("#" + gridName + "").jqGrid('getRowData', mya[i]);
                //定义合并行数
                var rowSpanTaxCount = 1;
                for (j = i + 1; j <= length; j++) {
                    //和上边的信息对比 如果值一样就合并行数+1 然后设置rowspan 让当前单元格隐藏
                    var end = $("#" + gridName + "").jqGrid('getRowData', mya[j]);
                    var cellNames = CellName.split(",");
                    for (var n = 0; n < cellNames.length; n++) {
                        if (before[cellNames[0]] == end[cellNames[0]]) {
                            rowSpanTaxCount++;
                            $("#" + gridName + "").setCell(mya[j], cellNames[0], '', {display: 'none'});
                        } else {
                            rowSpanTaxCount = 1;
                            break;
                        }
                        $("#" + cellNames[0] + "" + mya[i] + "").attr("rowspan", rowSpanTaxCount);//最后合并需要合并的行与合并的行数
                    }
                }
            }
        },
        scrollTop:function(){
            return {
                scroll:true
            }
        },
        //分组合计
        totalGroup:function (groupField, groupTitle) {
            return {
                grouping: true,
                sortname: 'invdate',
                viewrecords: true,
                sortorder: "desc",
                groupingView: {
                    groupField: [groupField],
                    groupColumnShow: [true],
                    groupText: ['<b>{0}</b>'],
                    groupCollapse: false,
                    groupOrder: ['asc'],
                    groupSummary: [true],
                    groupDataSorted: true
                }
            }
        },
        //分组
        isGroup: function (groupField, groupTitle) {
            return {
                grouping: true,
                groupingView: {
                    groupField: [groupField],//分组属性
                    groupColumnShow: [false],//是否显示分组列
                    groupText: ['<b>{0}</b>'],//表头显示数据(每组中包含的数据量)
                    groupCollapse: true,//加载数据时是否只显示分组的组信息
                    // groupSummary: [true],//是否显示汇总  如果为true需要在colModel中进行配置summaryType:'max',summaryTpl:'<b>Max: {0}</b>'
                    // groupDataSorted: true,//分组中的数据是否排序
                    // groupOrder: ['desc', 'desc'], //分组后组的排列顺序
                    showSummaryOnHide: false//是否在分组底部显示汇总信息并且当收起表格时是否隐藏下面的分组

                }
            }
        },
        //树形表渲染
        istreeGrid: function (startCol) {
            return {
                treeGrid: true,
                treeGridModel: 'adjacency',//支持两种json格式：nested和adjacency
                ExpandColumn: startCol,
                ExpandColClick: true, //点击展开图标时，自动提交这一行的主键到url参数中获取数据
                treeIcons: {leaf: 'ui-icon-document-b'},
                treeReader: {
                    level_field: "level",           //表示层级字段名
                    parent_id_field: "parentId",      //表示父节点字段名 与上边level相关
                    leaf_field: "isLeaf",           // 是否是子节点
                    expanded_field: "expanded"      //是否默认展开
                }

            }
        },
        //特殊格式渲染 一般用于多个树形表渲染
        renderSpc:function () {
            return{
                jsonReader: {
                    repeatitems: false
                }
            }
        },
        //屏幕改变时调整表格大小
        Resize: function (selector,parentSel,newWidth) {
            if(newWidth){
                $(window).resize(function () {
                    $(selector).setGridWidth($(selector).parents(parentSel).width()-newWidth);
                });
                $(selector).setGridWidth($(selector).parents(parentSel).width()-newWidth);
            }else{
                $(window).resize(function () {
                    $(selector).setGridWidth($(selector).parents(parentSel).width());
                });
                $(selector).setGridWidth($(selector).parents(parentSel).width());
            }

        },
        //重新渲染数据
        loadTable:function (tableId,data) {
            $(tableId).jqGrid('clearGridData');
            $(tableId).jqGrid('setGridParam',{
                datatype:'local',
                data : data   //  newdata 是符合格式要求的需要重新加载的数据
            }).trigger("reloadGrid");
        },
        //获取单个选中的行id
        getCheckId: function(tableId){
            return $(tableId).jqGrid('getGridParam','selrow');
        },
        //获取主表所有选中的行的id 返回类型array
        getCheckAllIds: function(tableId){
            return $(tableId).jqGrid('getGridParam','selarrrow');
        },


        /*
        * jqgrid基础配置
        * */
        setting: function(){
           var setting = {
               datatype : "local",
               mtype: "GET",
               height: '40%',//高度
               width: '100%',//宽度
               autowidth: true,//自适应宽度
               forceFit: false,//调整列宽度不会改变表格的宽度
               shrinkToFit: true,//缩小到合适
               cellsubmit: 'clientArray', //表格递交位置
               editurl: 'clientArray',    //编辑保存地址
               cellEdit: true,            //编辑单个元格
               sortname : 'id',
               viewrecords : true,
               sortorder : "desc",
               caption : "",
               rownumbers: false,//显示行号
               multiselect : false,//显示多选
               subGridOptions:{
                   plusicon : "ui-icon-plus",
                   minusicon : "ui-icon-minus",
                   openicon: "ui-icon-carat-1-sw",
                   expandOnLoad: false,
                   selectOnExpand : false,
                   reloadOnExpand : false //只加载一次子表格，再点击加号时不再加载
               }
           };
            return setting;
        },


        /**
         * jqGrid一张表
         * @param tableId: table的id 必填
         * @param settings 自定义配置必填 setting :{
                          colNames:[],数组表头 必填
                          colModel：[{}], 数组对象，列的配置项 必填
                          data:data 渲染的数据。数组对象[{}]

                         }
         */
       jqGridTable: function(tableId,settings){
           var setting = jqGridAll.setting();
           if(settings){
                setting = $.extend(true, {},setting, settings) ;
           }
           $(tableId).jqGrid(setting);
       },

        /**
         * jqGrid主子表
         * @param tableId: table的id 必填
         * @param settings1  主表自定义配置必填 settings1 :{
                          colNames:[],数组表头 必填
                          colModel：[{}], 数组对象，列的配置项 必填
                          data:data 渲染的数据。数组对象[{}] 必填
                         }
         * @param settings2  子表自定义配置必填 settings2 :{
                          colNames:[],数组表头 必填
                          colModel：[{}], 数组对象，列的配置项 必填
                         }
         * @param config:  对象 {
                            url:'',子表请求的接口 必填
                            dataParams:'',子表要传的参数,对象
                            subtable : 保存子表的id 初始为空 数组
                            contentType：'',ajax请求方式 JSON还是form 非必填，不传参ajaxJson请求，传参ajaxForm请求
                            otherId:'tankId'  需要传到后台其他的值, tankId必须是当前行colModel定义的name
                           }
         * @param subtable: 保存子表的id 数组 初始为空数组。
         * @param callback: 回调函数 返回子表table的id,如果子表中有按钮需要绑定点击事件，调用callback
         */
        jqGridTableLevel: function(tableId,settings1,settings2,config,subtable,callback){
            var setting = jqGridAll.setting();
            var  configSettion = {
                subGrid : true,
                subGridRowExpanded : function(subgrid_id, row_id) {//子表格容器的id和需要展开子表格的行id
                    bindSubGrid(subgrid_id, row_id);
                }
            };
            setting = $.extend(true, {},setting, configSettion) ;
            if(settings1){
                 setting = $.extend(true, {},setting, settings1) ;
            }
            $(tableId).jqGrid(setting);
            jqGridAll.Resize(tableId,'.ibox-content');
            function bindSubGrid(subgrid_id, collectLineId) {
                var subgrid_table_id;
                subgrid_table_id = subgrid_id + "_t"; // (3)根据subgrid_id定义对应的子表格的table的id
                subtable.push(subgrid_table_id);
                var subgrid_pager_id;
                subgrid_pager_id = subgrid_id + "_pgr" // (4)根据subgrid_id定义对应的子表格的pager的id

                // (5)动态添加子报表的table和pager
                $("#" + subgrid_id)
                    .html(
                    "<table id='"+subgrid_table_id+"' class='scroll'></table><div id='"+subgrid_pager_id+"' class='scroll'></div>");
                var dataJsons = {
                    id : collectLineId
                };

                if(config.dataParams){
                    config.dataParams.id = collectLineId;
                    dataJsons = config.dataParams;
                }

                //当不传当前行的id时
                if(config.otherId){
                    var rowData = $(tableId).getRowData(collectLineId);// 获取当前行的数据
                    var id = rowData[config.otherId]; //获取字段的值
                    dataJsons.id = id; // 替换id
                }
                if(!config.contentType){
                    Api.ajaxJson(config.url,dataJsons,function(res){
                        var setting = jqGridAll.setting();
                        setting.data = res.rows;
                        if(settings2){
                            setting = $.extend(true, {},setting, settings2);
                        }
                        $("#" + subgrid_table_id).jqGrid(setting);
                        jqGridAll.Resize("#" + subgrid_table_id,tableId,100);
                        if(callback){
                            callback(subtable);
                        }

                    });
                }else{
                    Api.ajaxForm(config.url,dataJsons,function(res){
                        var setting = jqGridAll.setting();
                        setting.data = res.rows;
                        if(settings2){
                            setting = $.extend(true, {},setting, settings2);
                        }
                        $("#" + subgrid_table_id).jqGrid(setting);
                        jqGridAll.Resize("#" + subgrid_table_id,tableId,100);
                        if(callback){
                            callback(subtable);
                        }
                    });
                }

            }

        },
    };
    return {
        jG_configData: jqGridAll.configData,
        jG_configUrl: jqGridAll.configUrl,
        jG_config: jqGridAll.config,
        jG_editFn: jqGridAll.editFn,
        jG_editRowFn: jqGridAll.editRowFn,
        jG_conSum: jqGridAll.conSum,
        jG_gridComplete:jqGridAll.gridComplete,
        jG_MergerStatistics: jqGridAll.MergerStatistics,
        jG_isGroup: jqGridAll.isGroup,
        jG_istreeGrid: jqGridAll.istreeGrid,
        jG_renderSpc: jqGridAll.renderSpc,
        jG_Resize: jqGridAll.Resize,
        jG_scrollTop:jqGridAll.scrollTop,
        jG_totalGroup:jqGridAll.totalGroup,
        jG_loadTable:jqGridAll.loadTable,
        jG_getCheckId: jqGridAll.getCheckId,//获取单个选中的行id
        jG_getCheckAllIds: jqGridAll.getCheckAllIds,//获取主表所有选中的行的id 返回类型array
        jG_jqGridTable:jqGridAll.jqGridTable,// 获取单个普通表
        jG_jqGridTableLevel:jqGridAll.jqGridTableLevel,// 获取主子表


    };
});