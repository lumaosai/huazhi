define(function(require){
    //dataTable样式
    var cssArr = [
        // "/js/plugins/datatables/css/jquery.dataTables.min.css",
        "/css/customDataTable.css"
    ];
    $.each(cssArr,function(i,o){
        var head = document.getElementsByTagName('head')[0],
            linkTag = document.createElement('link');
        linkTag.href = o;
        linkTag.setAttribute('rel','stylesheet');
        linkTag.setAttribute('type','text/css');
        // head.appendChild(linkTag);
        $(linkTag).insertBefore('title');
    });


    //dataTable默认配置
    $.fn.dataTable.defaults.bSort = false;
    $.fn.dataTable.defaults.order = [];
    $.fn.dataTable.defaults.paging = false;
    $.fn.dataTable.defaults.bPaginate = false;
    $.fn.dataTable.defaults.pagingType = "full_numbers";
    $.fn.dataTable.defaults.info = false; //底部文字
    $.fn.dataTable.defaults.bAutoWidth = false;
    $.fn.dataTable.defaults.bDestroy = true;
    $.fn.dataTable.defaults.bProcessing = true;
    $.fn.dataTable.defaults.searching = false;
    $.fn.dataTable.defaults.bFilter = false; //是否启动过滤、搜索功能
    $.fn.dataTable.defaults.oLanguage = {
        "sProcessing": "处理中...",
        "sLengthMenu": "每页显示 _MENU_ 条记录",
        "sZeroRecords": "没有找到符合条件的数据",
        "sInfo": "显示第 _START_ ~ _END_ 项结果，共 _TOTAL_ 项",
        "sInfoEmpty": "没有数据",
        "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
        "sInfoPostFix": "",
        "sUrl": "",
        "sSearch": "搜索：",
        "sSearchPlaceholder": "关键字筛选",
        "sEmptyTable": "没有找到符合条件的数据",
        "sLoadingRecords": "载入中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
        },
        "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
        }
    };

    console.log(jQuery.fn.DataTable)
    jQuery.fn.DataTable.prototype.addRows2 = function(){
        alert(444);
    };
    jQuery.extend(true, jQuery.fn.DataTable, {
        addRows3: function(dataRows, index){
            alert(2222);
            var dt = this;
            if(index != null){
                for(var i=dataRows.length-1; i>-1; i--){
                    var retRow = dt.row.add(dataRows[i]);
                    var aiDisplayMaster = dt.fnSettings().aiDisplay;
                    // var aiDisplayMaster = table.fnSettings()['aiDisplayMaster'];
                    var moveRow = aiDisplayMaster.pop();
                    aiDisplayMaster.splice(index, 0, moveRow);
                }
            }
            else{
                dt.rows.add(dataRows);
            }
            return dt.draw(false);
        }
    });


    //internal
    // $.fn.dataTable.ext.search.push(
    //     function( settings, data, dataIndex ) {
    //         var min = parseInt( $('#min').val(), 10 );
    //         var max = parseInt( $('#max').val(), 10 );
    //         var age = parseFloat( data[3] ) || 0; // use data for the age column
    //
    //         if ( ( isNaN( min ) && isNaN( max ) ) ||
    //             ( isNaN( min ) && age <= max ) ||
    //             ( min <= age   && isNaN( max ) ) ||
    //             ( min <= age   && age <= max ) )
    //         {
    //             return true;
    //         }
    //         return false;
    //     }
    // );

    /**
     *
     * @param dt  dataTable()返回的实例对象
     * @param dataRows 要添加的数组对象
     * @param index   要插入的位置，默认为空（即添加到末尾）
     * @returns {*}
     */
    window.dt_addRows = function(dt, dataRows, index){
        var dtApi = dt.api();
        if(index != null){
            var aiDisplayMaster = dt.fnSettings()['aiDisplayMaster'];
            // var aiDisplayMaster = dtApi.aiDisplayMaster;
            for(var i=dataRows.length-1; i>-1; i--){
                dtApi.row.add(dataRows[i]);
                var moveRow = aiDisplayMaster.pop();
                aiDisplayMaster.splice(index, 0, moveRow);
            }
        }
        else{
            dtApi.rows.add(dataRows);
        }
        dtApi.draw(false);
        return dtApi.rows();
    };

    /**
     * 隐藏列
     * @param dt
     * @param colArr 列索引数组
     * @param reDraw 是否重绘，默认为false
     */
    window.dt_hideCols = function(dt, colArr, reDraw){
        var dtApi = dt.api();
        for (var i=0 ; i<colArr.length ; i++ ) {
            console.log(colArr[i])
            dtApi.column(colArr[i]).visible( false, false );
        }
        reDraw = reDraw==undefined?false:true;
        dtApi.columns.adjust().draw( reDraw ); // adjust column sizing and redraw
    };
    /**
     * 删除选中的行
     * @param tableId table的id, 必选参数。
     * @param url 后端删除接口, 必选参数。
     * @param callback  回调函数，接收两个参数(result,index),result: 删除成功时返回的结果,index:弹出层的索引。可选参数,只有删除所有数据才调用该函数。
     */
    window.dt_deletRows = function(tableId,url,callback){
        var bol = false;
        var idArr = [];  //保存选中的id
        $(tableId).find("tr td input.i-checks:checkbox").each(function (index, item) {
            if ($(this).is(":checked")) {
                var id = $(this).attr('id');
                if (id != undefined && id != '' && id != 0) {
                    idArr.push($(this).attr("id")) ;
                }
                bol = true;
            }
        });
        if (bol) {
            top.layer.confirm('请您确认是否要删除勾选数据', {icon: 3, title: '系统提示'}, function (index) {
                if (idArr.length > 0) { //新增的元素+已存在的数据 或全是已存在的数据
                    var data = {
                        ids: idArr.join(',')
                    };
                    Api.ajaxForm(url, data, function (result) {
                        if (result.success) {
                            Mom.layMsg('删除成功！');
                            $(tableId).find("tr td input.i-checks:checkbox").each(function (index, item) {
                                if ($(this).is(':checked')) {
                                    var table = $(tableId).DataTable();
                                    var tr = $(this).parents('tr');
                                    var row = table.row( tr );
                                    row.remove().draw();
                                }
                            });
                            var idNum = idArr.length;
                            var num = $('span.count').text();
                            var count = num - idNum;
                            if(count == 0){
                                if(callback){
                                    return callback(result,index);
                                }else{
                                    $(tableId).find('thead input').iCheck('uncheck');// 把input设置为不勾选，如果不设置,刷新列表会一直显示勾选。
                                    pageLoad();
                                }
                            }else{
                                $('span.count,span.count1').text(count);
                            }
                        } else {
                            Mom.layMsg(result.message);
                        }
                    });
                } else { //只选择新增的元素
                    $(tableId).find("tr td input.i-checks:checkbox").each(function () {
                        if ($(this).is(':checked')) {
                            var table = $(tableId).DataTable();
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
    };

    /**
     * 渲染数据，通过option参数来加载不同的js
     * @param tableId table的id
     * @param option 对象 参数如下{
     * colReorder: true, //交换列，可选
        fixedHeader: true,//固定表头，可选
        colResizable:true //列的宽度拖拽，可选
        fixedColumns:true//固定列
        config:{} 对象，datatable的配置项， 必须有。
     * }
     */
    window.dt_renderData = function(tableId,option){
        renderTableData(tableId);
        if(option.colReorder){
            require(['dataTable_colReorder'],function(){
                renderTableData(tableId,option.config);
                // 列交换重新渲染多选框
                var table = $(tableId).DataTable();
                table.on( 'column-reorder', function () {
                    $('.ul').css('display','none');
                    renderIChecks();
                    renderSelect2($('.select2')); //渲染select2样式
                });
            })
        };
        if(option.fixedHeader){
            require(['dataTable_fixedHeader'],function(){
                renderTableData(tableId,option.config);
            });
        };
        if(option.fixedColumns){
            require(['dataTable_fixedColumns'],function(){
                renderTableData(tableId,option.config);
            });
        };
        if(option.colResizable){
            require(['colResizable'],function(){
                renderTableData(tableId,option.config);
                $(tableId).colResizable({resizeMode:'flex'});//拖动列宽
            });
        };

         idArr = [];// 全局定义，保存修改行的id
        $(tableId).on('change','input,select',function(){
            var id = $(this).parents('tr').find('td:first-child input').attr('id');
            idArr.push(id);
        })
    };

    // 渲染表格调用
    function renderTableData(tableId,config) {
        dt = $(tableId).dataTable(config);
        renderIChecks();
    };

    /**
     * 获取修改的数据，需要在th上定义自定义属性 data-name，它的值为datatable配置项中的aoColumns的data的值相对应。必须的。参考0_0/newDataTables.html页面中的table。
     *  @param tableId table的id
     *  @param idArr：数组， 保存修改后的行的id,需要配合window.dt_renderData 一起使用。idArr全局定义。
     *  返回值:dataArr 数组对象，修改的行的所有数据。
     */
    window.dt_getData = function(tableId,idArr){
        //把th中的data-name赋值给当前列的td
        $(tableId).find('thead th').each(function(index,item){
            $(tableId).find('tbody tr').each(function(){
                $(this).find('td').each(function(i){
                    if(i == index){
                        $(this).attr('data-name',$(item).attr('data-name'));
                    }
                })

            })
        });
        function uniq(array){
            var temp = []; //一个新的临时数组
            for(var i = 0; i < array.length; i++){
                if(temp.indexOf(array[i]) == -1){
                    temp.push(array[i]);
                }
            }
            return temp;
        }
        var newArr = uniq(idArr);
        var dataArr = [];//获取修改的行数据。
        newArr.forEach(function(item,index){
            $(tableId).find('tbody tr td:first-child input').each(function(){
                var obj = {};
                if(item == $(this).attr('id')){
                    $(this).parents('tr').find('td').each(function(){
                        if($(this).find('input[type="text"]').length > 0){
                            var name = $(this).attr('data-name');
                            if(name.indexOf('.') != -1){
                                var nameArr = name.split('.');
                                var firstName = nameArr[0];
                                var lastName = nameArr[1];
                                obj[firstName] = {};
                                obj[firstName][lastName] =$(this).find('input[type="text"]').val();
                            }else{
                                obj[$(this).attr('data-name')] = $(this).find('input[type="text"]').val();
                            }
                            //obj[$(this).attr('data-name')] = $(this).find('input[type="text"]').val();
                        }else if($(this).find('input[type="checkbox"]').length > 0){
                            obj[$(this).attr('data-name')] = $(this).find('input[type="checkbox"]').attr('id');
                        } else if($(this).find('select').length > 0){
                            var name = $(this).attr('data-name');
                            if(name.indexOf('.') != -1){
                                var nameArr = name.split('.');
                                var firstName = nameArr[0];
                                var lastName = nameArr[1];
                                obj[firstName] = {};
                                obj[firstName][lastName] =$(this).find('select').val()
                            }else{
                                obj[$(this).attr('data-name')] = $(this).find('select').val();
                            }
                            //obj[$(this).attr('data-name')] = $(this).find('select').val();
                        }else{
                            var name = $(this).attr('data-name');
                            if(name.indexOf('.') != -1){
                                var nameArr = name.split('.');
                                var firstName = nameArr[0];
                                var lastName = nameArr[1];
                                obj[firstName] = {};
                                obj[firstName][lastName] =$(this).text();;
                            }else{
                                obj[$(this).attr('data-name')] = $(this).text();
                            }
                            //obj[$(this).attr('data-name')] = $(this).text();
                        }
                    })
                    dataArr.push(obj);
                }
            })
        })
        return dataArr;
    };


    /**
     * 渲染ul,数据是表格的表头,配合 window.dt_columnVisible一起使用，隐藏和显示列。默认为右键鼠标点击th显示隐藏列
     *  @param tableId table的id
     *  @param parentsClass 承载ul的父节点div的class或id。非必填
     */
    window.dt_renderVisible = function(tableId,parentsClass){
        var str= '';
        var tableTh=$(tableId).find("thead th");
        var icheck = tableTh.eq(0).find('input[type=checkbox]');
        if(icheck.length == 0){
            for(var i = 0;i<tableTh.length;i++){
                var dataTitles = $(tableTh[i]).attr("data-titles");
                str+=' <li class="toggle-vis" data-titles="'+dataTitles+'"  data-column="'+i+'"><input class="i-checks" type="checkbox" checked="true" />'+tableTh.eq(i).html()+'</li>'
            }
        }else{
            //str+=' <li class="toggle-vis" data-titles="复选框" data-column="0"><input class="i-checks" type="checkbox" checked="true" />复选框</li>'
            for(var i = 1;i<tableTh.length;i++){
                var dataTitles = $(tableTh[i]).attr("data-titles");
                str+=' <li class="toggle-vis" data-titles="'+dataTitles+'"  data-column="'+i+'"><input class="i-checks" type="checkbox" checked="true" />'+tableTh.eq(i).html()+'</li>'
            }
        }

        //for(var i = num || 0;i<tableTh.length;i++){
        //    str+=' <li class="toggle-vis" data-column="'+i+'"><input class="i-checks" type="checkbox" checked="true" />'+$(tableId).find("thead").find("th").eq(i).html()+'</li>'
        //}
        var ul = "<ul class='ul' style='width:150px;border:1px solid #ccc;display:none;background-color: #fff;z-index: 100;'>"+str+"</ul>"

        if(parentsClass){
            $(parentsClass).append(ul);
            renderIChecks();
            dt_divColumnVisible(tableId,parentsClass);
        }else{
            $('body').append(ul);
            renderIChecks();
            dt_columnVisible(tableId); //调用隐藏列的方法。
        }

    };
    /**
     * ，固定隐藏和显示列的位置
     *  @param tableId table的id
     *  @param parentsClass 承载ul元素的父级标签的类名或id
     */
    window.dt_divColumnVisible = function(tableId,parentsClass){
        $(parentsClass).click(function(e){
            e.preventDefault();
            e.stopPropagation();
            $('.ul').css('position','absolute').toggle();
        });
        $('.ul').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            $('.ul').css('display','block');
        });

        $(parentsClass).mouseup(function(){
            commonVisible(tableId);
        })
    };

    /**
     *隐藏和显示列，显示位置在table的th上。
     *  @param tableId table的id
     */
    window.dt_columnVisible = function(tableId){
        //点击不是th的地方隐藏ul
        $('body').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            $('.ul').css('display','none');
        });
        $('.ul').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            $('.ul').css('display','block');
        });

        $(tableId).find('thead th').each(function(index,item){
            document.oncontextmenu = function(){return false};
            $(this).mouseup(function(e){
                var e = e || window.event;
                if(e.button == 2){
                    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    var x= e.clientX;
                    var y = e.clientY;
                    //ul显示的位置
                    $('.ul').css({
                        'display':'block',
                        'position':'absolute',
                        'top': y + scrollY ,
                        left: x +scrollX
                    });
                    commonVisible(tableId);
                }
            })
        })
    };

    function commonVisible(tableId){
        $('.ul input').each(function(){
            $(this).on('ifChanged', function(e){
                e.preventDefault();
                e.stopPropagation();
                var num = 0;
                $('.ul input').each(function(){
                    if($(this).is(':checked')){
                        num++;
                    }
                });
                //如果只有一个就不让点击复选框
                if(num ==1){
                    $('.ul input').each(function(){
                        if($(this).is(':checked')){
                            $(this).iCheck('disable');
                        }
                    });
                }else{
                    $('.ul input').each(function(){
                        if($(this).is(':checked')){
                            $(this).iCheck('enable');
                        }
                    });
                }
                //var num=$(this).parents('li').attr('data-column');
                //var table = $(tableId).DataTable();
                //var column = table.column(num);
                if($(this).is(':checked')){
                    //column.visible(true);
                    var dataTitle = $(this).parents('li').attr("data-titles");
                    showFn(tableId,dataTitle);
                }else{
                    //column.visible(false);
                    var dataTitle = $(this).parents('li').attr("data-titles");
                    hideFn(tableId,dataTitle);
                }
            });
        });
        // 点击li，切换选中状态。
        $('.ul li').each(function(){
            $(this).unbind('click').click(function(){
                if($(this).find('input').is(':checked') && !$(this).find('input').attr('disabled')){
                    $(this).find('input').iCheck('uncheck');
                }else{
                    $(this).find('input').iCheck('check');
                }
            });
        });
    }
    //显示列
    function showFn(tableId,dataTitle) {
        var hideIndex = 0;
        $(tableId).find('thead tr th').each(function (index,item) {
            if($(this).attr("data-titles") == dataTitle){
                $(this).show();
                hideIndex = index;
                $(tableId).find('tbody tr').each(function (index,items) {
                    $(this).find("td").eq(hideIndex).show()
                })
            }
        });
    };
    //隐藏列
    function hideFn(tableId,dataTitle) {
        var hideIndex = 0;
        $(tableId).find('thead tr th').each(function (index,item) {
            if($(this).attr("data-titles") == dataTitle){
                hideIndex = index;
                $(this).hide();
                $(tableId).find('tbody tr').each(function (index,items) {
                    $(this).find("td").eq(hideIndex).hide();
                });
            }
        });
    }
    
});
