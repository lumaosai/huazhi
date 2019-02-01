/**
 * Created by mac on 18/3/28.
 */
var dataGridObj = {
    td0EditIndex:undefined,
    td1EditIndex:undefined,
    td2EditIndex:undefined,
    td3EditIndex:undefined,
    td4EditIndex:undefined,
    saveItemArr:[],
    saveAllItemArr:[],
    arrIndex:-1,
    getEditIndex:function (id) {  //获取到td#EditIndex的值
        id = id.substr(1);
        return eval("easyui.dg_"+id+"EditIndex");
    },
    setEditIndex:function(id, val){  ////设置td#EditIndex的值
        id = id.substr(1);
        eval("easyui.dg_"+id+"EditIndex="+val);
    },
    startEditing:function(index,id){  //开始编辑
        if (easyui.dg_getEditIndex(id) != index) {
            if (easyui.dg_endEditing(id)) {
                $(id).datagrid('selectRow', index)
                    .datagrid('beginEdit', index);
                easyui.dg_setEditIndex(id,index);
            } else {
                $(id).datagrid('selectRow', easyui.dg_editIndex);
            }
        }
    },
    endEditing:function(gridTableId){  //结束编辑
        var editIndex = easyui.dg_getEditIndex(gridTableId);
        if ( editIndex == undefined) { return true }
        if ($(gridTableId).datagrid('validateRow', editIndex)) {
            $(gridTableId).datagrid('endEdit', editIndex);
            easyui.dg_setEditIndex(gridTableId,undefined);
            return true;
        } else {
            return false;
        }
    },
    pushRowData:function(rowData){ //编辑过的元素如果不存在就push到数组中，如果已存在新的数据会替换原有的数据
        if(easyui.dg_saveItemArr.length>0){
            easyui.dg_filterItem(easyui.dg_saveItemArr,rowData);
            if(easyui.dg_arrIndex == -1){
                easyui.dg_saveItemArr.push(rowData);
            }else{
                easyui.dg_saveItemArr.splice(easyui.dg_arrIndex,1,rowData);
            }
        }else{
            easyui.dg_saveItemArr.push(rowData);
        }
    },
    filterItem:function (arr,item) { //判断元素是否存在于数组中
        for( var i=0;i<arr.length;i++){
            var filterEle = arr[i].id==""?"itemCode":"id";
            if( (arr[i][filterEle])===(item[filterEle])){
                easyui.dg_arrIndex = i;
                return ;
            }else{
                easyui.dg_arrIndex = -1;
            }
        }
    },
    mergeCells:function(data,id,field){  //合并单元格功能
        var mark=1;
        for (var i=1; i <data.rows.length; i++) {
            if (data.rows[i][field] == data.rows[i-1][field]) {
                mark += 1;
                $(id).datagrid('mergeCells',{
                    index: i+1-mark,
                    field: field,
                    rowspan:mark
                });
            }else{
                mark=1;
            }
        }
    },
    getAllData:function(ids){ //获取当前页的所有行 参数：dataGrid表格id的集合
        easyui.dg_getAllTablesSave();
        var idLen = ids.length;
        if(idLen>0){
            easyui.dg_saveAllItemArr =[];
            for(var i= 0;i<idLen;i++){
                var rows = $(ids[i]).datagrid("getRows");
                easyui.dg_saveAllItemArr = easyui.dg_saveAllItemArr.concat(rows);

            }
        }
        return easyui.dg_saveAllItemArr;
    },
    getSaveItemArr:function(){  //获取修改过的数据的集合
        easyui.dg_getAllTablesSave();
        return easyui.dg_saveItemArr;
    },
    getAllTablesSave:function(){ //触发当前页面中的所有dataGrid table中的保存按钮，默认dataGrid保存时只保存编辑过且失去焦点的元素的数值。
        var len = $(".tableItemBox").length;
        for(var i = 0; i<len;i++){
            //触发每个table隐藏的保存按钮，从而获取到表格中最后一条被修改的数据并将其放入到saveItemArr中。
            $("#td"+i).parents('.datagrid-view').siblings(".datagrid-toolbar").find(".l-btn-text").trigger('click');
        }

    },
    checkDatagridNotNull:function(dgName, dgId, checkRowArr, checkFieldArr){ //校验datagrid中指定的列是否为空 dgName指dataGrid的描述  dgId指dataGrid  checkColArr指要检查的列名称
        var rows = $(dgId).datagrid('getRows');
        for(var i=0; checkRowArr&&i<rows.length; i++){
            if(checkRowArr.contains(i)){
                $(dgId).datagrid('endEdit', i);
                var row = rows[i];
                for(var j=0; checkFieldArr&&j<checkFieldArr.length; j++){
                    var fieldName = checkFieldArr[j];
                    var fieldTitle = $(dgId).datagrid('getColumnOption',fieldName).title;
                    var colVal = $.trim(row[fieldName]);
                    if(!colVal){
                        var rowName = row.pName?row.pName:row.itemName?row.itemName:'';
                       // layerAlert(dgName+' 第'+(i+1)+'行:'+fieldTitle+' 的值不能为空!');
                        layerAlert('"'+dgName+'":"'+rowName+'--'+fieldTitle+'" 的值不能为空!');
                        return false;
                    }
                }
            }
        }
        return true;
    },
    eachCheckDataGrid:function(checkDGArr){   //对要进行核对操作的dataGrid进行遍历
        var checkFlag='';
        for(var i=0; i<checkDGArr.length; i++){
            var item = checkDGArr[i];

            if(!item.dgId){
                return false;
            }else{
                checkFlag = easyui.dg_checkDatagridNotNull(item.dgName, item.dgId, item.checkRowArr, item.checkFieldArr);
            }
            //var checkFlag = easyui.dg_checkDatagridNotNull(item.dgName, item.dgId, item.checkRowArr, item.checkFieldArr);
            if(checkFlag == false){
                return false;
            }
        }
    },
    dataGridResize:function(resizeDiv){  //浏览器窗口改变时dataGrid数据宽度重置
        $(window).resize(function(){
            $(resizeDiv).datagrid('resize');

        });
    },
    // dataGridConfigObj方法的四个参数含义tableId：容器的id,titleName:标题名称，columns:容器columns的配置，mergeCellArr：要合并的单元格Field名称
    dataGridConfigObj:function(tableId, titleName, columns,mergeCellArr){  //动态配置dataGrid的参数配置
        var mergeCellArr = mergeCellArr || [];  //例如mergeCellGroupObj={flag:true,groupNameArr:['groupName']};
        return {
            fitColumns: true,
            rownumbers: false,
            collapsible: true,
            singleSelect: true,
            title: titleName,
            onClickRow: function (index) {
                easyui.dg_startEditing(index, tableId)
            },
            columns: columns||[[]],
            onAfterEdit: function (rowIndex, rowData) {
                easyui.dg_pushRowData(rowData);
                easyui.dg_setEditIndex(tableId, undefined);
                easyui.dg_forMergeCells(tableId,mergeCellArr);
            },
            //合并单元格
            onLoadSuccess: function (data) {
                loadedData = data;
                $(tableId).datagrid('resize');
                easyui.dg_forMergeCells(tableId,mergeCellArr);
            },
            toolbar: [{
                text: '存1', iconCls: 'icon-save', handler: function () {
                    //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                    $(tableId).datagrid('endEdit', easyui.dg_getEditIndex(tableId));
                }
            }]
        }
    },
    forMergeCells:function(tableId,mergeCellArr){//循环要合并的多组单元格项
        var len = mergeCellArr.length;
        if(len>0){
            for(var i =0;i<len;i++){
                easyui.dg_mergeCells(loadedData, tableId, mergeCellArr[i]);
            }

        }
    }

};

//扩展datagrid:动态添加删除editor
jQuery.extend(jQuery.fn.datagrid.methods, {
    addEditor : function(jq, param) {
        if (param instanceof Array) {
            $.each(param, function(index, item) {
                var e = $(jq).datagrid('getColumnOption', item.field);
                e.editor = item.editor;
            });
        } else {
            var e = $(jq).datagrid('getColumnOption', param.field);
            e.editor = param.editor;
        }
    },
    removeEditor : function(jq, param) {
        if (param instanceof Array) {
            $.each(param, function(index, item) {
                var e = $(jq).datagrid('getColumnOption', item);
                e.editor = {};
            });
        } else {
            var e = $(jq).datagrid('getColumnOption', param);
            e.editor = {};
        }
    }
});
$.extend($.fn.datagrid.defaults.editors, {
    checkbox: {//调用名称
        init: function (container, options) {//container 用于装载编辑器 options,提供编辑器初始参数
            var inputStr = '';
            if(options){
                for(var o in options){
                    if(typeof(o) == 'object'){
                    }

                }
                $(options).each(function(i,o){
                    inputStr += "<label><input type='checkbox' name='"+(o.name||'')+"' value='"+(o.value||'')+"'/>"+o.text+"</label>";
                });
            }
            //这里我把一个 checkbox类型的输入控件添加到容器container中
            // 需要渲染成easyu提供的控件，需要时用传入options,我这里如果需要一个combobox，就可以 这样调用 input.combobox(options);
            return $(inputStr).appendTo(container);
        },
        getValue: function (target) {
            //datagrid 结束编辑模式，通过该方法返回编辑最终值
            //这里如果用户勾选中checkbox返回1否则返回0
            return $(target).prop("checked") ? 1 : 0;
        },
        setValue: function (target, value) {
            //datagrid 进入编辑器模式，通过该方法为编辑赋值
            //我传入value 为0或者1，若用户传入1则勾选编辑器
            if (value)
                $(target).prop("checked", "checked")
        },
        resize: function (target, width) {
            //列宽改变后调整编辑器宽度
            var input = $(target);
            if ($.boxModel == true) {
                input.width(width - (input.outerWidth() - input.width()));
            } else {
                input.width(width);
            }
        }
    }
});



