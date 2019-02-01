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


    jQuery.fn.DataTable.prototype.addRows2 = function(){
        alert(444);
    };
    jQuery.extend(true, jQuery.fn.DataTable, {
        addRows3: function(dataRows, index){
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
    }

    /**
     * 隐藏列
     * @param dt
     * @param colArr 列索引数组
     * @param reDraw 是否重绘，默认为false
     */
    window.dt_hideCols = function(dt, colArr, reDraw){
        var dtApi = dt.api();
        for (var i=0 ; i<colArr.length ; i++ ) {
            dtApi.column(colArr[i]).visible( false, false );
        }
        reDraw = reDraw==undefined?false:true;
        dtApi.columns.adjust().draw( reDraw ); // adjust column sizing and redraw
    }


});
