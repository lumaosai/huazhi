/**
 * Created by lumaosai on 2018/9/21.
 */
require(['/js/zlib/app.js'], function (App) {
    require(['checkUser']);
    Mom.include('_myCss_insert','/css/',[
        'defaultFormula.css'
    ]);
    var PageModule = {
        init: function(){

           //加载右侧表http://localhost/json/jqgrid/tableright.json
            Api.ajaxJson(Api.mtrl +"/api/mv/FormulaDef/formType",{}, function (res) {
                if(res.success){
                    renderRightTableData(res.rows);
                }
                 // 表格双击时编辑公式
                $('#treeTable2 tbody tr' ).dblclick(function(){
                    $(this).addClass('selected').siblings().removeClass('selected');
                    var val = $(this).find('td').eq(0).text();
                    $('.valbox').append('<span>' + val + '</span>');
                })
            });
            function renderRightTableData(tableData) {
                $('#treeTable2').dataTable({
                    "bFilter":true,
                    "data": tableData,
                    "aoColumns": [
                        {"data": "value", 'sClass': " center", "width": "30%"},
                        {"data": "label", 'sClass': "center"}
                    ]
                });
                renderIChecks();
            };

            //加载左侧表
                window.pageLoad = function () {
                    var data = {
                        formulaName: $('#name').val()
                    };
                    Api.ajaxJson(Api.mtrl +"/api/mv/FormulaDef/form", JSON.stringify(data), function (res) {
                        if(res.success){
                            renderTableData(res.rows);
                            //添加按钮
                            $('#btn-add').unbind('click').click(function(){
                                var data1 = {
                                    'id':"0",
                                    'formulaName':"<input type='text' name='formulaName' require='true' class='form-control'>",
                                    'formulaShortName':"<input type='text' name='formulaShortName' class='form-control'>",
                                    'formula':'',
                                    'remark':"<input type='text' name='remark' class='form-control'>"
                                };
                                //向dataTable添加数据
                                dt_addRows(dt, [data1],0);
                                renderIChecks();
                            });
                        }

                    });
                };
                $("#btn-search").click(function () {
                    pageLoad();
                });
                pageLoad();
            function renderTableData(tableData) {
                dt= $('#treeTable').dataTable({
                    //"bFilter":true,
                    "data": tableData,
                    "aoColumns": [
                        {
                            "data": null, "defaultContent": "", 'sClass': "autoWidth center",
                            "render": function (data, type, row, meta) {
                                return data = "<input type='checkbox' name='id' attr-new='"+(row.id?'0':'1')+"'   class='i-checks' value='" + row.id + "' id=" + row.id + ">"
                            }
                        },
                        {"data": "formulaName", 'sClass': " center", "width": "12%"},
                        {"data": "formulaShortName", 'sClass': "center ", "width": "12%"},
                        {"data": "formula", 'sClass': "center"},
                        {"data": "remark", 'sClass': "center","width": "12%"}
                    ]
                });
                rowClick();
                renderIChecks();
            };
            function rowClick(){
                //双击tr获取当前行数据
                $('#treeTable tbody').on('dblclick', 'tr', function () {
                    var dtApi = dt.api();
                    var selectTr = dt.$('tr.selected');
                    selectTr.removeClass('selected');
                    $(this).addClass('selected');
                    var data = dtApi.row(this).data();
                    //获取id、公式
                    var id = data.id;
                    var formula = data.formula;
                    $('.valbox').html('<span>' + formula + '</span>');
                    $('.content-input').val(id);
                } );
            }

            //删除按钮
            $('#btn-delete').unbind('click').click(function(){
                var bol = false;
                var str = '';  //用于拼接str
                $("#treeTable tr td input.i-checks:checkbox").each(function (index, item) {
                    if ($(this).is(":checked")) {
                        var id = $(this).attr('id');
                        if (id != undefined && id != '' && id != 0) {
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
                            Api.ajaxForm(Api.mtrl +"/api/mv/FormulaDef/delete", data, function (result) {
                                if (result.success) {
                                    Mom.layMsg('删除成功！');
                                        $('#name').val(''); //清空input
                                        pageLoad();
                                } else {
                                    Mom.layMsg(result.message);
                                }
                            });
                            //渲染表格以及渲染分页

                        } else { //只选择新增的元素

                            $("#treeTable tr td input.i-checks:checkbox").each(function (index, item) {
                                if ($(this).is(':checked')) {
                                    //$(this).parents('tr').remove();
                                    // datatable删除一行，查看datatable 的Api
                                    var table = $('#treeTable').DataTable();
                                    var tr = $(this).parents('tr');
                                    var row = table.row( tr );
                                    row.remove().draw();
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
            $('#save-btn').unbind('click').click(function(){
                //dt.api().row('.selected').remove().draw( false );
                //提交
                if(!Validator.valid($("#inputForm"), '1.2')){
                    return;
                }
                var arr = [];
                $("#treeTable tbody tr").each(function(index,item){
                    if($(this).find('.i-checks').attr('id') != 0 && $(this).hasClass('newrow')){
                        var obj ={};
                        obj.id = $(this).find('td input.i-checks').attr('id');
                        obj.formulaName = $(this).find('td').eq(1).text();
                        obj.formulaShortName = $(this).find('td').eq(2).text();
                        obj.formula = $(this).find('td').eq(3).text();
                        obj.remark = $(this).find('td').eq(4).text();
                        arr.push(obj);
                    } else if($(this).find('.i-checks').attr('id') == 0){
                        var obj ={};
                        //obj.id = '';
                        obj.formulaName = $(this).find('td').eq(1).children().val();
                        obj.formulaShortName = $(this).find('td').eq(2).children().val();
                        obj.formula = $(this).find('td').eq(3).text();
                        obj.remark = $(this).find('td').eq(4).children().val();
                        arr.push(obj);
                    }
                });
                    var data = {
                        formulaDefList :JSON.stringify(arr)
                    }
                    Api.ajaxForm(Api.mtrl +"/api/mv/FormulaDef/save",data,function (result) {
                        if(result.success){
                            Mom.layMsg(result.message);
                            $('#name').val(''); //清空input
                            pageLoad();
                        }else{
                            Mom.layMsg(result.message);
                        }
                    });
            });

            //四则运算等符号
           var thisbox= '.content-right';
            for (var i = 0; i < $(thisbox).find('fieldset button').length - 2; i++) {
                $(thisbox).find('fieldset button').eq(i).unbind('click').on('click', function () {
                    $(thisbox).find('.valbox>br').each(function (i, item) {
                        $(item).remove();
                    });
                    $(thisbox).find('.valbox').append('<span>' + $(this).text() + '</span>')
                })
            }
            //清除
            $(thisbox).find('fieldset .empty').unbind('click').on('click', function () {
                $(thisbox).find('.valbox').empty();

            });
            //退格
            $(thisbox).find('fieldset .backOne').unbind('click').on('click', function () {
                var strback = $(thisbox).find('.valbox').text();

                var newstr = strback.substr(0, strback.length - 1);
                $(thisbox).find('.valbox').text(newstr)
            });
             //检查
            $(thisbox).find('#btn-verify').unbind('click').on('click', function () {
                var str = '';
                str += $(thisbox).find('.valbox').text();
                PageModule.regularFn(str);
            })

            //确定按钮
            $(thisbox).find('#btn-save').unbind('click').on('click', function () {
                var str = '';
                str += $(thisbox).find('.valbox').text();
                $("#treeTable tbody tr").each(function(index,item){
                    if($(this).hasClass('selected')){
                        $(this).addClass('newrow');
                        $(this).find('td').eq(3).text(str);
                    }
                })
            })
        },
        /**正则验证方法  val为要验证符号以及括号的值字符串*/
        regularFn: function (val) {
            var regFourSymbols = /^\+|^\-|^\*|^\/|(\+|\-|\*|\/)\1{1}|(\+\-)|(\-\+)|(\+\*)|(\*\+)|(\/\+)|(\+\/)|(\-\*)|(\*\-)|(\-\/)|(\/\-)|(\*\/)|(\/\*)|(\+|\-|\*|\/)+$/;
            var regBracket = /[()]/;
            if(val==null||val==''){
                Mom.layMsg('匹配项内容为空,请输入信息后再进行操作')
            }else if (regFourSymbols.test(val)) {
                Mom.layMsg('符号不匹配,请检查运算符号!')
            }else if (regBracket.test(val)) {
                function isBracketBalance(str){
                    var leftBracketNum = 0;
                    var strLength = str.length;
                    var bracketIndex=-1;
                    var fristChar='';
                    for(var i = 0; i < strLength; i++){
                        var temp = str.charAt(i);
                        if(temp === '('){
                            if(bracketIndex<0){
                                bracketIndex=i;
                                fristChar='(';
                            }
                            leftBracketNum++;
                        }
                        if(temp === ')'){
                            if(bracketIndex<0){
                                bracketIndex=i;
                                fristChar=')';
                            }
                            leftBracketNum--;
                        }

                    }
                    if(fristChar === ')'){
                        return false;
                    }
                    if(leftBracketNum != 0){
                        return false;
                    }
                    var n = str.search("\\(\\)");
                    if(n != -1){
                        return false;
                    }
                    return true;
                }
                var flag = isBracketBalance(val);
                if(flag){
                    Mom.layMsg('公式正确，可进行保存');
                }else{
                    Mom.layMsg('括号不匹配,请检查小括号!');
                }

            }else{
                Mom.layMsg('公式正确，可进行保存')
            }
        }

    }
    $(function () {
        if ($('#defaultFormula').length > 0) {
            PageModule.init();
        }
    });
})