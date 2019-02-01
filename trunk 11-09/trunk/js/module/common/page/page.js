/**
 * 分页组件，支持后端分页
 * Created by mac on 18/2/1.
 * update by Qiyh | 2018-09-23 | 解决一个页面存在多个分页对象数据污染的bug
 */
var Page = function(){
    var that = this;
    this.url_ = "";         //分页接口地址
    this.paramData = null;  //分页参数
    this.renderTableFn = null;  //渲染数据回调函数
    this.pageSizeArr = [5,10,20,25,30,40,50];
    this.defaultPageSizeIndex = 2;  //每页显示多少条，默认为pageSizeArr中的第3个值
    this.rowCount = 0;      //共？条记录
    this.pageShowNum = 10;  //显示10个页码选择（如果配置为0则显示简单样式）
    this.pageContainDom = $(".pagination-box");

    /**
     * 调用：new Page().init()进行分页渲染,
     * 如果要调整每页显示大小:Page.defaultPageSizeIndex=?
     * @param url: 分页接口
     * @param data：分页参数
     * @param vari：是否初始化
     * @param renderTableFn：回调函数进行数据渲染
     */
    this.init = function(url,data,vari,renderTableFn){
        that.url_ = url;
        that.paramData = data;
        if(renderTableFn){
            var selPs = parseInt($("#pag-sel option:selected").val());
            that.paramData.page = {
                pageSize: (isNaN(selPs) || selPs<0)?that.pageSizeArr[that.defaultPageSizeIndex]:selPs,
                pageNo: 1
            };
            that.renderTableFn = renderTableFn;

        }
        that.pageCom(data,vari);
    };
    this.reload = function(){
        if(that.paramData){
            that.pageCom(that.paramData,false);
        }
    };
    this.bindEvent = function(){
        $("#pag-sel").unbind('change').change(function(){
            var _ps = parseInt($(this).val());
            that.paramData.page.pageSize = (_ps==-1?that.rowCount:_ps);
            that.pageCom(that.paramData,true);
        });
    };
    this.reset = function(arrParam){
        var len = arrParam.length;
        if(len){
            for(var i = 0;i<len;i++ ){
                if(typeof(that.paramData[arrParam[i]]) == "object"){
                   var obj = that.paramData[arrParam[i]];
                    for(var key in obj){
                        var arr =[]; arr.push(arrParam[i][key]);
                        obj[key] = "";
                    }
                }else{
                    that.paramData[arrParam[i]] = "";
                }
            }
        }

        that.paramData.page.pageSize = $("#pag-sel").val();
        that.pageCom(that.paramData,true);
    };
    this.pageCom = function(data,vari){
        Api.ajaxJson(that.url_, JSON.stringify(data), function(result){
            if(result.success){
                var page = result.page;
                that.rowCount = page.count;
                var showInfo = "";
                if(that.pageShowNum == 0){
                    showInfo += "共"+page.pageCount+"页 共"+page.count+"条记录";
                    showInfo += "   <span>每页显示</span><select name='' id='pag-sel' class='form-control' style='height:28px;padding:0 4px;display:inline;font-size:12px;'>";
                    var pageSizeArr_ = that.pageSizeArr;
                    var allSelected=' selected';
                    pageSizeArr_.forEach(function(o,i){
                        var selected = o==page.pageSize?' selected':'';
                        showInfo += "<option value='"+o+"' "+selected+">"+o+"</option>";
                        if(selected != ''){
                            allSelected = '';
                        }
                    });
                    showInfo += "<option value='-1' "+allSelected+">所有</option>";
                    showInfo += "</select>条记录";
                    that.pageShowNum = 0;
                }else{
                    showInfo += "显示第"+(page.startRowNum+1)+"~"+(page.endRowNum+1)+"条记录，共 "+(page.count)+"条记录";
                    showInfo += "   <span>每页显示</span><select name='' id='pag-sel' class='form-control' style='height:28px;padding:0 4px;display:inline;font-size:12px;'>";
                    var pageSizeArr_ = that.pageSizeArr;
                    var allSelected=' selected';
                    pageSizeArr_.forEach(function(o,i){
                        var selected = o==page.pageSize?' selected':'';
                        showInfo += "<option value='"+o+"' "+selected+">"+o+"</option>";
                        if(selected != ''){
                            allSelected = '';
                        }
                    });
                    showInfo += "<option value='-1' "+allSelected+">所有</option>";
                    showInfo += "</select>条记录";
                }
                if($(that.pageContainDom).length==0){
                    alert('未找到分页插件容器');
                    return;
                }
                $(that.pageContainDom).find('.page-info').empty().html(showInfo);
                that.bindEvent();
                $(that.pageContainDom).find('.pagination-detail').show();
                if( that.renderTableFn){
                    that.renderTableFn(page.rows, result);
                }
                if(vari){
                    that.callBackPagination(page.pageSize,page.pageCount,page.count);
                }
                $('html,body').animate({scrollTop: '0px'}, 300);
            }else{
                Mom.layMsg(result.message);
            }

        })
    };
    this.callBackPagination = function(limit,showCount,totalCount) {
        $('#pagination').extendPagination({
            totalCount: totalCount,
            showCount: showCount,
            showPage: that.pageShowNum,
            limit: limit,
            callback: function (curr,limit, totalCount) {
                that.paramData.page = {
                    pageSize:limit,
                    pageNo:curr
                };
                that.init(that.url_,that.paramData,false);
            }
        });
    }
};
