define([''], function () {
    /**作者：贾旭光
     *日期：2018.9.26
     *
     */
    Mom.include('computed_css', '/css/', ['computedCommons.css']);

    var computedFn = {
        //渲染select
        selectRead:function (url) {
            //一加载默认请求select
            Api.ajaxForm(url,{}, renderSelect);
            function renderSelect(result) {
                Bus.appendOptionsValue('#cxSelectFn', result.funcTypeList);
                Bus.appendOptionsValue('#jqselectFn', result.funcTypeList);
            }
        },
        //切换选项时渲染左侧物料
        renderChange:function (innerbox,contentbox,liList,url,callback) {
            computedFn.renderinit(innerbox,contentbox,liList,url,callback);
            //切换时候执行的方法
            $('.tabChange').find('li').each(function (i) {
                $(this).unbind('click').on('click', function () {
                    $(this).addClass('active').siblings('li').removeClass('active');
                    $(contentbox).eq(i).addClass('active').siblings('div').removeClass('active');
                    $(contentbox).eq(i).find(liList).each(function (e) {
                        //到时候要传参数
                        $(this).unbind('click').on('click', function () {
                            Api.ajaxForm(url,{},function (result) {
                                computedFn.renderMaterials(result,i,e);
                            });
                            $('.valbox').eq(i).find('.context').eq(e).addClass('active').siblings('.context').removeClass('active');
                            $(this).find('i.fa').addClass('fa-dot-circle-o').removeClass('fa-circle-o').parents('li').siblings('li').find('i.fa').addClass('fa-circle-o').removeClass('fa-dot-circle-o');
                        });
                    });
                    $(contentbox).eq(i).find(liList).eq(0).trigger('click');
                    $('#boxindex').val($('.tabChange>li').eq(i).attr('data-name'));
                    if(callback){
                        callback();
                    }
                });
            });
        },
        //根据li渲染下方div内容 物料   2
        renderMaterials:function (result, i, e) {
            var innerbox='.contentBox.active';
            $(innerbox).find('.searchUl').empty();
            $(result.nodeAreaTypeInstrList[e].value).each(function (c) {
                var liText = '<li data-id="'+this.id+'">' + this.instrName+ '</li>';
                $(innerbox).find('.searchUl').append(liText)
            });
            $(innerbox).find('.searchUl>li').each(function (b) {
                $(this).on('click',function () {
                    $(this).addClass('active').siblings('li').removeClass('active');
                })
            });
            $('#tabindex').val($('.contentChange>li').eq(e).text())
        },
        //一上来默认选中第一个    1
        renderinit:function (innerbox,contentbox,liList,url,callback) {
            $(innerbox).find(liList).each(function (e) {
                //到时候要传参数
                $(this).unbind('click').on('click', function () {
                    Api.ajaxForm(url,{}, function (result) {
                        computedFn.renderMaterials(result,0,e)
                    });

                    $('.valbox').eq(0).find('.context').eq(e).addClass('active').siblings('.context').removeClass('active');
                    $(this).find('i.fa').addClass('fa-dot-circle-o').removeClass('fa-circle-o').parents('li').siblings('li').find('i.fa').addClass('fa-circle-o').removeClass('fa-dot-circle-o');
                })
            });
            $(innerbox).find(liList).eq(0).trigger('click');
            if(callback){
                callback();
            }
            $('#boxindex').val($('.tabChange>li').eq(0).attr('data-name'));
        },
        /**正则验证方法  val为要验证符号以及括号的值字符串*/
        regularFn: function (val) {
            var regFourSymbols = /^\+|^\-|^\*|^\/|(\+|\-|\*|\/)\1{1}|(\+\-)|(\-\+)|(\+\*)|(\*\+)|(\/\+)|(\+\/)|(\-\*)|(\*\-)|(\-\/)|(\/\-)|(\*\/)|(\/\*)|(\+|\-|\*|\/)+$/;
            var regBracket = /[(][^()]*[)]/;
            if(val==null||val==''){
                Mom.layMsg('匹配项内容为空,请输入信息后再进行操作')
            }else if (regFourSymbols.test(val)) {
                Mom.layMsg('符号不匹配,请检查运算符号!')
            }else if (regBracket.test(val)) {
                str = val.replace(/[(][^()]*[)]/g, '');
                if (/[()]/.test(str)) {
                    Mom.layMsg('括号不匹配,请检查小括号!')
                }else{
                    Mom.layMsg('公式正确，可进行保存')
                }
            }else{
                Mom.layMsg('手动输入公式可直接进行保存')
            }
        }
    };
    return {
        // com_tabChange: computedFn.tabChange,
        // com_innerChange: computedFn.innerChange,
        com_selectRead: computedFn.selectRead,
        com_renderChange: computedFn.renderChange,
        com_ajaxjson: computedFn.ajaxjson,
        com_regularFn: computedFn.regularFn
    };
});



