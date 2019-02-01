require(['/js/zlib/app.js'], function (App) {
    //引入Page插件
    window.pageLoad = function () {
        var data = {
            type: $("#type option:selected").val(),
            descriptionParam: $('#description').val()
        };
        //修改默认每页显示条数
        Api.ajaxJson("http://localhost/html/0_0/json/dataTables.json", data, function (tableData) {
            renderTableData(tableData.rows);
            $('.btn-edit').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.openEditDialog('修改字典', '../0_0/form.html?id=' + id, '665px', '386px', saveCallback);
            });
            $('.btn-delete').click(function () {
                var id = $(this).parents("tr").find('.i-checks').attr('id');
                Bus.deleteItem('确定要删除该字典吗', Api.admin + '/api/sys/SysDict/delete', {ids: id});
            });
            //点击重置按钮
            $('#reset-btn').click(function () {
                Mom.clearForm($('.toolbar-form'));
                page.reset(["type", "descriptionParam"]);
            });
            //添加按钮
            $('#add-btn').click(function () {
                var data1 = {
                    'id':"",
                    'name':"<input type='text' name='aa' require='true' class='form-control'>",
                    'formula':'aaaaa',
                    'remark':"<input type='text' name='remark' class='form-control'>"
                };
                //向dataTable添加数据
                dt_addRows(dt, [data1],0);
                renderIChecks();
            });
            //保存按钮
            $('#btn-save').click( function () {
                dt.api().row('.selected').remove().draw( false );
                //提交
                if(!Validator.valid($("#inputForm"), '1.2')){
                    console.log('error');
                    return;
                }
                var dataArr = [];
                $.each($('#treeTable tr'),function(i,o){
                    var addNew = $(o).find('.i-checks').attr('attr-new');
                    if(addNew == '1'){  //是否为新增元素  1：新增元素
                        dataArr.push($(o).serializeJSON());
                    }
                });
                var data = {
                    rows: JSON.stringify(dataArr)
                };
                Api.ajaxForm(url,data,function(result){
                    if(result.success){
                        Mom.layMsg('操作成功！');
                        pageLoad();
                    }else{
                        Mom.layAlert(result.message);
                    }
                });

            });
            //确认按钮
            $('#btn-ok').click(function(){
                //调用接口，保存公式
                var data = {
                    id:'',
                    formula: ''
                };
                Api.ajaxJson(url,JSON.stringify(data),function(result){
                    if(result.success){
                        var formulaCfg = result.Formula;
                        var selectTr = $('#treeTable tr.selected');
                        selectTr.find("input[name='id']").val(formulaCfg.id);
                    }else{
                        Mom.layAlert(result.message);
                    }
                });
            });

        });
        function renderTableData(tableData) {
            dt= $('#treeTable').dataTable({
                "bFilter":true,
                "bSort": true,
                // "scrollY": 200,  //设置表格高度，超过200出现滚动条
                "aoColumnDefs": [
                    {"bSortable": false, "aTargets": [0,]}
                ],
                "data": tableData,
                //定义列 宽度 以及在json中的列名
                "columns": [
                    {
                        "data": 'null', "defaultContent": "", 'sClass': "autoWidth center",
                        "render": function (data, type, row, meta) {
                            return "<input type='checkbox' name='id' attr-new='"+(row.id?'0':'1')+"' value='" + row.id + "' class='i-checks'>"
                        }
                    },
                    {"data": "name", 'sClass': "center", "width": "12%"},
                    {"data": "formula", 'sClass': "center ", "width": "12%"},
                    {"data": "remark", 'sClass': "center", "width": "12%"}
                ]
            });
            renderIChecks();
            rowClick();
        }
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
                var forluma = data.formula;

            } );
        }
    };
    pageLoad();


});