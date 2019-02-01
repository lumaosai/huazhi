/**
 * @auth: qiyh
 * 先引入的将添加到head前边，优先级最高的样式文件要先调用include
 */
define(['Common'],function(require){

    //公共样式
    Mom.include('_myPluginCss','/js/plugins/',[
        'font-awesome/css/font-awesome.min.css',
        'bootstrap/css/bootstrap.min.css',
        'icheck/skins/flat/green.css',
        'select2/dist/css/select2.min.css',
        'datetimepicker/css/bootstrap-datetimepicker.css'
    ]);

    //自定义样式
    Mom.include('_myCss','/css/',[
        'common.css'
        // 'customDataTable.css',

    ]);



});
