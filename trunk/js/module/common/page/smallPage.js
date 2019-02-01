/**
 * 简单分页插件，仅支持内存分页（不支持接口分页）
 * update by Qiyh | 2018-09-23 | 解决一个页面存在多个分页对象数据污染的bug
 * @returns
 * @constructor
 */
var SmallPage = function(){
	var dataList,pageNo,pageSize,pageCount,pageRender,container;

	//初始化
	var init = function(pageCfg, pageRender_){
		this.pageNo = pageCfg.pageNo || 1;
        this.pageSize = pageCfg.pageSize || 10;
        this.dataList = pageCfg.dataList || [];
        this.pageCount = this.pageSize>0?parseInt(this.dataList.length/this.pageSize):0;
        if(this.dataList.length%this.pageSize != 0){
            this.pageCount++;
        }
        this.container = pageCfg.container;
		if(this.container){
			var exist = $(this.container).find('.small-page').length;
			if(exist==0){
				var html = "<a class='firstP' href='javascript:;'>首页</a>";
				html += "<a class='preP' href='javascript:;'>上页</a>";
				html += "<a class='nextP' href='javascript:;'>下页</a>";
				html += "<a class='lastP' href='javascript:;'>末页</a>";
				$(this.container).append("<div class='small-page'>"+html+"</div>");
				//注册事件
				var that = this;
                $(this.container).find('.firstP').unbind('click').bind('click',function(){
                    that.first();
				});
                $(this.container).find('.preP').unbind('click').bind('click',function(){
                    that.pre();
                });
                $(this.container).find('.nextP').unbind('click').bind('click',function(){
                    that.next();
                });
                $(this.container).find('.lastP').unbind('click').bind('click',function(){
                    that.last();
                });
			}
		}
		if(pageRender_){
			this.pageRender = pageRender_;
			this.first();
		}
	};
	
	//首页
	var first = function(){
		if($(this.container).find('.firstP').hasClass('disabled')){
			return;
		}
		if(this.dataList || this.dataList.length>0){
			if(this.pageRender){
                this.pageNo = 1;
                this.pageRender(getPageRows());
			}
		}
        setPageDisabled();
	};
	//末页
	var last = function(){
        if($(this.container).find('.lastP').hasClass('disabled')){
            return;
        }
		if(this.dataList || this.dataList.length>0){
			if(this.pageRender){
                this.pageNo = this.pageCount;
                this.pageRender(getPageRows());
			}
		}
        setPageDisabled();
	};
	//上一页
	var pre = function(){
        if( $(this.container).find('.preP').hasClass('disabled')){
            return;
        }
		if(this.dataList || this.dataList.length>0){
			if(this.pageRender){
                this.pageNo --;
                this.pageRender(getPageRows());
			}
		}
        setPageDisabled();
	};
	//下一页
	var next = function(){
        if( $(this.container).find('.nextP').hasClass('disabled')){
            return;
        }
		if(this.dataList || this.dataList.length>0){
			if(this.pageRender){
				if(this.pageNo < this.pageCount){
                    this.pageNo ++;
                    this.pageRender(getPageRows());
				}else{
                    this.pageNo = this.pageCount;
				}
			}
		}
        setPageDisabled();
	};

	var getPageRows = function(){
        if(this.pageNo<1){
            this.pageNo = 1;
        }
        //获取开始索引
        var startIdx = (this.pageNo-1)*this.pageSize;
        if(startIdx < 0){
            startIdx = 0;
        }
        if(startIdx >= this.dataList.length){
            startIdx = this.dataList.length-1;
        }
		//获取结束索引
        var endIdx = startIdx+this.pageSize-1;
        if(endIdx >= this.dataList.length){
            endIdx = this.dataList.length-1;
        }
		var pageRows_ = [];
        for(var j=startIdx; j<=endIdx; j++){
            pageRows_.push(this.dataList[j]);
        }
        return pageRows_;
	};

    var setPageDisabled = function(){
        if(this.pageNo <= 1){
            $(this.container).find('.firstP,.preP').addClass("disabled");
        }else{
            $(this.container).find('.firstP,.preP').removeClass("disabled");
        }
        if(this.pageNo >= this.pageCount){
            $(this.container).find('.nextP,.lastP').addClass("disabled");
        }else{
            $(this.container).find('.nextP,.lastP').removeClass("disabled");
        }
        $(this.container).find('.firstP').attr('title','首页 当前:'+this.pageNo);
        $(this.container).find('.preP').attr('title','上页 当前:'+this.pageNo);
        $(this.container).find('.nextP').attr('title','下页 当前:'+this.pageNo);
        $(this.container).find('.lastP').attr('title','末页 当前:'+this.pageNo);
    };

	return {
		init: init,
		first: first,
		last: last,
		pre: pre,
		next: next
	};
};