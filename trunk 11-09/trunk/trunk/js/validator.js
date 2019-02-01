/*
* 表单验证处理
* 支持类型[dataType]: Email,Phone,Mobile,Url,IdCard,Number,Zip,QQ,Integer,Double,English,Chinese,DateTime
*                    Date,Repeat,Range,Compare,Custom,Group,Limit,LimitB,SafeStr,CompareTime
* require:是否必填 
* label :提示信息的主题
* min:最小值
* max:最大值
* dataType 为Compare时：
* operator:confirmPwd,NotEqual:!=,GreaterThan:>,GreaterThanEqual:>=,LessThan:<,LessThanEqual:<=
* to:比较的值或输入框对象
* 使用方法 Validator.Validate(form对象,1)
* <body onload="documentOnload()">
* 添加了自定义类型
* 自定义类型以UF_开头
* 应该添加相应的处理函数如
	function UF_MaterialId_Validate(msgs,obj){
		if (obj.value.length>5){
		   msgs[0]=obj.label+'长度不能大于【5】';
		   return false;
		}
	  return true;
	}
  其中参数msgs是一个数组,第一个值对应的是返回的异常信息
  其中参数obj是对应的对象
  数组ErrorItems:第1个元素是form，其它元素是验证失败的表单对象
* 2016-3-17 13:35
*/
var error_not_empty="值不能为空";
var error_not_phone="值不是合法的电话号码的格式";
var error_not_Mobile="值不是合法的手机号码格式";
var error_not_Url="值不是合法的Url格式";
var error_not_IdCard="值不是合法的身份证格式";
var error_not_Number="值不是有效数字";
var error_not_Zip="值不是合法的邮编格式";
var error_not_QQ="值不是合法的QQ号码格式";
var error_not_English="值不全为字母";
var error_not_Chinese="值不全为汉字";
var error_not_UnSafe="值不是合法的格式";
var error_not_DateTime="值不是合法的日期格式";
var error_not_email="值不是合法的Email格式";
var error_not_integer="值不是整数";
var error_not_double="值不是数值";
var error_not_long="字数过长";
var error_ConfirmPwd="两次密码输入不一致";
var error_errormessage="以下原因导致操作失败";
var Validator = window.Validator || {
    /*正则校验*/
    Require:/.+/,
    Email:/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    /*固定电话:*/
    Phone:/^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/,
    /*手机号:*/
    Mobile:/^((\+86)|(86))?(13|15|18)\d{9}$/,
    /*固话或手机号:*/
    Tel:/(^((\+86)|(86))?(13|15|18)\d{9}$)|(^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$)/,
    Url:/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
    IdCard:/^\d{15}(\d{2}[A-Za-z0-9])?$/,
    Currency:/^\d+(\.\d+)?$/,
    Zip:/^[1-9]\d{6}$/,
    QQ:/^[1-9]\d{4,12}$/,
    Number:/^\d+$/,
    Integer:/^[-\+]?\d+$/,
    Double:/^[-\+]?\d+(\.\d+)?$/,   /*在属性添加scale='n'表示保留几位小数*/
    English:/^[A-Za-z]+$/,
    Chinese:/^[\u0391-\uFFE5]+$/,
    //Safe:/^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,
    Safe:/^(?:\w*\s*)+$/,
    //DateTime:/^((\d{4}-(((0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01]))|((0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30))|((02)-(0[1-9]|1[0-9]|2[0-8]))))|(((([0-9]{2})(0[48]|[2468][048]|[13579][26]))|((0[48]|[2468][048]|[13579][26])00))-02-29))$/,
    DateTime:/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/,
    /*函数校验*/
    Date:"(function(validator){with(validator){TempMsg[0]='值不是合法的日期格式';return IsDate(value,getAttribute('format'));}})(this)",
    Limit:"(function(validator){with(validator){TempMsg[0]='字符数不能小于['+(getAttribute('min')?getAttribute('min'):'0')+']也不能大于['+getAttribute('max')+']';return limit(value.length,getAttribute('min'), getAttribute('max'));}})(this)",
    LimitB:"(function(validator){with(validator){TempMsg[0]='字节数不能小于['+(getAttribute('min')?getAttribute('min'):'0')+']也不能大于['+getAttribute('max')+']';return limit(LenB(value), getAttribute('min'), getAttribute('max'));}})(this)",
    Repeat:"(function(validator){with(validator){TempMsg[0]='与'+document.getElementsByName(getAttribute('to'))[0].label+' 值不相等';return value == document.getElementsByName(getAttribute('to'))[0].value;}})(this)",
    Range:"(function(validator){with(validator){TempMsg[0]='值必须在'+(getAttribute('min')?getAttribute('min'):'0')+' ~ '+(getAttribute('max')?getAttribute('max'):'9999999')+'之间';return parseFloat(getAttribute('min')) <= parseFloat(value) && parseFloat(value) <= parseFloat(getAttribute('max')?getAttribute('max'):9999999);}})(this)",
    ConfirmPwd:"(function(Validator){with(Validator){return ConfirmPwd_fun(value,getAttribute('to'));}})(this)",
    CompareTime:"(function(validator){with(validator){return compareTime(getAttribute('to'),value,getAttribute('tip'));}})(this)",
    Equal:"(function(validator){with(validator){return Equal_fun(value,getAttribute('to'));}})(this)",
    NotEqual:"(function(validator){with(validator){return NotEqual_fun(value,getAttribute('to'));}})(this)",
    GreaterThan:"(function(validator){with(validator){return GreaterThan_fun(value,getAttribute('to'));}})(this)",
    GreaterEquaThan:"(function(validator){with(validator){return GreaterEquaThan_fun(value,getAttribute('to'));}})(this)",
    LessThan:"(function(validator){with(validator){return LessThan_fun(value,getAttribute('to'));}})(this)",
    LessEqualThan:"(function(validator){with(validator){return LessEqualThan_fun(value,getAttribute('to'));}})(this)",
    Custom:"(function(validator){with(validator){TempMsg[0]='';return Exec(value, getAttribute('regexp'));}})(this)",
    Group:"(function(validator){with(validator){TempMsg[0]='选中的数量不能小于['+(getAttribute('min')?getAttribute('min'):'0')+']也不能大于['+getAttribute('max')+']';return MustChecked(getAttribute('name'), getAttribute('min'), getAttribute('max'));}})(this)",
    SafeStr:"(function(validator){with(validator){TempMsg[0]='值不能包含非法字符';return IsSafe(value);}})(this)",
    IsSafe:function(str) {return this.Safe.test(str);},
    ErrorItems:[document.forms[0]],
    ErrorMessage:[error_errormessage+"：\t\t\t\t"],
    RegularMsg:{Require:error_not_empty,
        Email:error_not_email,
        Phone:error_not_phone,
        Mobile:error_not_Mobile,
        Tel:error_not_phone,
        Url:error_not_Url,
        IdCard:error_not_IdCard,
        Number:error_not_Number,
        Zip:error_not_Zip,
        QQ:error_not_QQ,
        Integer:error_not_integer,
        Double:error_not_double,
        English:error_not_English,
        Chinese:error_not_Chinese,
        UnSafe:error_not_UnSafe,
        DateTime:error_not_DateTime
    },
    TempMsg:[""],
    MultiNames:[],
    theXmlHttp:null,
    valid:function(theForm, mode) {
        var formObj = theForm || event.srcElement;
        if (formObj!=null){
            if(formObj instanceof jQuery){
                formObj = formObj[0];
            }
            if (formObj.tagName.toUpperCase()!="FORM"){
                formObj=formObj.form;
            }
        }
        if (formObj==null || formObj.tagName.toUpperCase()!="FORM"){
            alert("没有定义form对象");
            return false;
        }
        var count = formObj.elements.length;
        this.ErrorMessage.length = 1;
        this.ErrorItems.length = 1;
        this.MultiNames = new Array();
        this.ErrorItems[0] = formObj;
        for (var i = 0; i < count; i++) {
            var ele = formObj.elements[i];
            var eleType = ele.type;
            this.TempMsg[0]='';
            with (ele) {
                if(eleType == undefined)continue;
                this.ClearState(ele);
                var eleVal = ele.value;
                var eleName = ele.getAttribute("name");
                if(eleType=='checkbox' || eleType=='radio'){
                    if(eleName == null){
                        continue;
                    }
                    eleVal = '';
                    //判断是否已经校验过
                    if(this.ArrayContains(this.MultiNames, eleName)){
                        continue;
                    }
                    this.MultiNames.push(eleName);
                    var curEles = document.getElementsByName(eleName);
                    for(var e=0; e<curEles.length; e++){
                        if(curEles[e].checked){
                            eleVal += curEles[e].value+",";
                        }
                    }
                }

                if (eleVal==""){
                    if (getAttribute("require")=="true"){
                        this.AddError(ele, error_not_empty);
                    }
                    continue;
                }

                //dataType校验
                var _dataTypes = getAttribute("dataType");
                if (_dataTypes==null || _dataTypes=="") continue;
                var dataTypeArr=_dataTypes.split(";");
                for (var t=0;t<dataTypeArr.length;t++){
                    var _dataType=dataTypeArr[t];
                    if (_dataTypes=="") continue;
                    if (typeof(_dataType) == "object" || typeof(this[_dataType]) == "undefined") continue;
                    if (_dataType.indexOf("UF_") > -1){
                        try{
                            if (!this[_dataType](this.TempMsg,ele)){
                                this.AddError(ele, this.TempMsg[t]);
                                break;
                            }
                        }catch(e){
                            //this.AddError(ele, this.TempMsg[0]);
                        }
                        continue;
                    }
                    switch (_dataType) {
                        case"Date":
                        case"Repeat":
                        case"Range":
                        case"Custom":
                        case"Group":
                        case"Limit":
                        case"LimitB":
                        case"SafeStr":
                        case"Equal":
                        case"NotEqual":
                        case"GreaterThan":
                        case"GreaterEquaThan":
                        case"LessThan":
                        case"LessEqualThan":
                        case"ConfirmPwd":
                            if (!eval(this[_dataType])){
                                this.AddError(ele, this.TempMsg[0]);
                            }
                            break;
                        case"CompareTime":
                            var errorstr = eval(this[_dataType]);
                            if (errorstr != "") {
                                this.AddError(ele, errorstr);
                            }
                            break;
                        default:
                            if (!this[_dataType].test(eleVal)) {
                                if (typeof(this.RegularMsg[_dataType]) != "undefined"){
                                    this.AddError(ele, this.RegularMsg[_dataType]);
                                } else{
                                    this.AddError(ele);
                                }
                            }else if(_dataType == 'Double'){
                                var scale = getAttribute('scale');
                                if(scale){
                                    var theValArr = value.toString().split(".");
                                    if(theValArr.length==2 && theValArr[1].length>scale){
                                        this.AddError(ele, '值只能有'+scale+'位有效小数');
                                    }
                                }
                            }
                            break;
                    }
                }

            }
        }
        if (this.ErrorMessage.length > 1) {
            mode = mode || 1;
            var errCount = this.ErrorItems.length;
            //支持jquery和Layer时
            if(window.jQuery && window.layer){
                if(mode < 2){
                    var pos = 3;
                    mode = mode.toString();
                    if(mode.indexOf(".") > 0){
                        pos = mode.substr(mode.indexOf(".")+1);
                    }
                    for (var j = 1; j < errCount; j++) {
                        var ele = this.ErrorItems[j];
                        if(ele.type=='checkbox' || ele.type=='radio'){
                            ele = ele.parentNode;//在父标签上显示提示信息
                        }
                        //tips:弹出位置（1:上；2:右；3:下；4:左）
                        /*layer.tips(this.ErrorMessage[j], ele, {tips:3, time:4000, tipsMore:true});*/
                        layer.tips(this.ErrorMessage[j], ele, {tips:[pos, '#F90'], tipsMore:true} );
                    }
                }else{
                    var erMsgStr = '';
                    for(var m=0; m<this.ErrorMessage.length; m++){
                        erMsgStr += (m+1)+":"+this.ErrorMessage[m]+"<br>";
                    }
                    top.layer.alert(erMsgStr, {
                        skin: 'layui-layer-lan',
                        title: '警告',
                        closeBtn: 0,
                        anim: 5 //动画类型
                    });
                }
            }
            else{
                if(mode == 2){
                    for (var j = 1; j < errCount; j++)
                        this.ErrorItems[j].style.color = "red";
                }
                else if(mode == 3){
                    for (var j = 1; j < errCount; j++) {
                        try {
                            var span = document.createElement("SPAN");
                            span.id = "__ErrorMessagePanel";
                            span.style.color = "red";
                            this.ErrorItems[i].parentNode.appendChild(span);
                            span.innerHTML = this.ErrorMessage[j].replace(/\d+:/, "*");
                        } catch(e) {
                            alert(e.description);
                        }
                    }
                    this.ErrorItems[1].focus();
                }
                else {
                    var erMsgStr = '';
                    for(var m=0; m<this.ErrorMessage.length; m++){
                        erMsgStr += (m+1)+":"+this.ErrorMessage[m]+"\n";
                    }
                    alert(erMsgStr);
                    try{
                        this.ErrorItems[1].focus();
                    }catch(e){}
                }
            }
            return false;
        }
        return true;
    },
    limit:function(len, min, max) {
        min = min || 0;
        max = max || Number.MAX_VALUE;
        return min <= len && len <= max;
    },
    LenB:function(str) {
        return str.replace(/[^\x00-\xff]/g, "**").length;
    },
    ClearState:function(elem) {
        with (elem) {
            if (style.color == "red") style.color = "";
            var lastNode = parentNode.childNodes[parentNode.childNodes.length - 1];
            if (lastNode.id == "__ErrorMessagePanel") parentNode.removeChild(lastNode);
        }
    },
    AddError:function(ele, str) {
        str = str||"";
        //str=(ele.getAttribute("label")?(ele.getAttribute("label")+': '):ele.getAttribute("name"))+str;
        str=(ele.getAttribute("label")?(ele.getAttribute("label")+': '):'')+str;
        this.ErrorItems[this.ErrorItems.length] = ele;
        // this.ErrorMessage[this.ErrorMessage.length] = this.ErrorMessage.length + ":" + str;
        this.ErrorMessage[this.ErrorMessage.length] = str;
    },
    Exec:function(op, reg) {
        return new RegExp(reg, "g").test(op);
    },
    ConfirmPwd_fun:function(op1, sop2){
        var op2Obj = document.getElementById(sop2);
        if(op2Obj == null){
            alert('未找到id为:'+sop2+'的对象!');
            return false;
        }
        var op2 = op2Obj.value;
        this.TempMsg[0]=error_ConfirmPwd;
        return(op1 == op2);
    },
    Equal_fun:function(op1, sop2) {
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            this.TempMsg[0]=' 值不等于['+op2+']!';
            return(op1 == op2);
        }
    },
    NotEqual_fun:function(op1, sop2){
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            op1 = Number(op1);
            op2 = Number(op2);
            this.TempMsg[0]='值不能等于['+op2+']!';
            return(op1 != op2);
        }
    },
    GreaterThan_fun:function(op1, sop2){
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            op1 = Number(op1);
            op2 = Number(op2);
            this.TempMsg[0]='值不大于['+op2+']!';
            return(op1 > op2);
        }
    },
    GreaterEquaThan_fun:function(op1, sop2){
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            op1 = Number(op1);
            op2 = Number(op2);
            this.TempMsg[0]='值不大于等于['+op2+']!';
            return(op1 >= op2);
        }
    },
    LessThan_fun:function(op1, sop2){
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            op1 = Number(op1);
            op2 = Number(op2);
            this.TempMsg[0]='值不小于['+op2+']!';
            return(op1 < op2);
        }
    },
    LessEqualThan_fun:function(op1, sop2){
        var op2;
        if (isNaN(sop2))
            op2 = document.getElementById(sop2).value;
        else
            op2 = sop2;
        if (isNaN(op1) || isNaN(op2)) {
            this.TempMsg[0]='值不是有效数值类型!';
            return false;
        } else {
            op1 = Number(op1);
            op2 = Number(op2);
            this.TempMsg[0]='值不小于等于['+op2+']!';
            return(op1 <= op2);
        }
    },
    compareTime:function(date1, dtvalue2, tipmes) {
        var strtip = new Array();
        strtip[0] = "开始时间";
        strtip[1] = "结束时间";
        if (tipmes != "" || tyepof(tipmes) != "undefined"){
            strtip = tipmes.split(",");
        }
        var errormsg = "";
        var dateformat = /^\d{4}(?:-\d{1,2}){2}$/;
        var dtvalue1 = document.getElementById(date1).value;
        if (dtvalue1 != "" && !this["DateTime"].test(dtvalue1)){
            errormsg = strtip[0] + "不是合法的日期格式";
            return errormsg;
        }
        if (dtvalue2 != "" && !this["DateTime"].test(dtvalue2)){
            errormsg = strtip[1] + "不是合法的日期格式";
            return errormsg;
        }
        if (dtvalue2 != "" && dtvalue1 == ""){
            errormsg = "缺少" + strtip[0];
            return errormsg;
        }
        if (dtvalue2 == "" && dtvalue1 != ""){
            errormsg = "缺少" + strtip[1];
            return errormsg;
        }
        var strdt1 = (dtvalue1).replace(/-/g, "/");
        var strdt2 = (dtvalue2).replace(/-/g, "/");
        var time1 = new Date(strdt1);
        var time2 = new Date(strdt2);
        var datediff = time2 - time1;
        if (datediff < 0)
        {
            errormsg = strtip[1] + "不能早于" + strtip[0];
            return errormsg;
        }
        return errormsg;
    },
    MustChecked:function(name, min, max) {
        var groups = document.getElementsByName(name);
        var hasChecked = 0;
        min = min || 1;
        max = max || groups.length;
        for (var i = groups.length - 1; i >= 0; i--)
            if (groups[i].checked)hasChecked++;
        return min <= hasChecked && hasChecked <= max;
    },
    IsDate:function(op, formatString) {
        formatString = formatString || "ymd";
        var m,year,month,day;
        switch (formatString) {
            case"ymd":
                m = op.match(new RegExp("^((\\d{4})|(\\d{2}))([-./])(\\d{1,2})\\4(\\d{1,2})$"));
                if (m == null) return false;
                day = m[6];
                month = --m[5];
                year = (m[2].length == 4) ? m[2] : GetFullYear(parseInt(m[3], 10));
                break;
            case"dmy":
                m = op.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2((\\d{4})|(\\d{2}))$"));
                if (m == null)return false;
                day = m[1];
                month = --m[3];
                year = (m[5].length == 4) ? m[5] : GetFullYear(parseInt(m[6], 10));
                break;
            default:
                break;
        }
        if (isNaN(parseInt(month))) return false;
        month = month == 12 ? 0 : month;
        var date = new Date(year, month, day);
        return(typeof(date) == "object" && year == date.getFullYear() && month == date.getMonth() && day == date.getDate());
        function GetFullYear(y) {
            return((y < 30 ? "20" : "19") + y) | 0;
        }
    },
    ArrayContains: function(arr, val){
        return RegExp("(^|,)" + val.toString() + "($|,)").test(arr);
    },

    /*
     根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
     地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
     出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
     顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
     校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

     出生日期计算方法。
     15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
     2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
     下面是正则表达式:
     出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
     身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i
     15位校验规则 6位地址编码+6位出生日期+3位顺序号
     18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
     校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
     公式(1)中：
     i----表示号码字符从由至左包括校验码在内的位置序号；
     ai----表示第i位置上的号码字符值；
     Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
     i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
     Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1
     */
    //身份证号合法性验证
    //支持15位和18位身份证号
    //支持地址编码、出生日期、校验位验证
    IdentityCodeValid: function(code) {
        var tip = "";
        if(code=='')return tip;
        var city = { 11 : "北京", 12 : "天津", 13 : "河北", 14 : "山西", 15 : "内蒙古", 21 : "辽宁",
            22 : "吉林", 23 : "黑龙江 ", 31 : "上海", 32 : "江苏", 33 : "浙江", 34 : "安徽",
            35 : "福建", 36 : "江西", 37 : "山东", 41 : "河南", 42 : "湖北 ", 43 : "湖南",
            44 : "广东", 45 : "广西", 46 : "海南", 50 : "重庆", 51 : "四川", 52 : "贵州",
            53 : "云南", 54 : "西藏 ", 61 : "陕西", 62 : "甘肃", 63 : "青海", 64 : "宁夏",
            65 : "新疆", 71 : "台湾", 81 : "香港", 82 : "澳门", 91 : "国外 "
        };
        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
        }
        else if (!city[code.substr(0, 2)]) {
            tip = "地址编码错误";
        } else {
            // 18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                // ∑(ai×Wi)(mod 11)
                // 加权因子
                var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                // 校验位
                var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for ( var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17].toUpperCase()) {
                    tip = "校验位错误";
                }
            }
        }
        return tip;
    },

    /**
     * 检查表单值是否为空
     */
    checkNull: function(formElement,info) {
        var isNull = false;
        var obj = formElement;
        if (formElement != null) {
            if(typeof(formElement)=='string'){
                obj = document.forms[0][formElement];
            }
            if (obj.value.trim() == "") {
                isNull=true;
                if(info!=null && info!=undefined){
                    window.alert(info);
                }
                try{
                    obj.focus();
                }catch(err){}
            }
        }
        return isNull;
    },

    /**
     * 验证单选组是否选择
     * @param _obj
     * @returns {boolean}
     */
    checkRadiosIsSelected: function (_obj){
        var flag=false;
        var objs = _obj;
        if(typeof(_obj)=='string'){
            objs = document.getElementsByName(_obj);
        }
        if(objs==undefined || 0==objs.length)
            return true;
        for(var i=0;i<objs.length;i++) {
            if(objs[i].checked) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    /**
     * 设置复选框的值，选中状态
     */
    setCheckboxValue: function(name,values){
        var objs=document.getElementsByName(name);
        if(objs == null || values==null || values=='') return;
        var valArr = String(values).split(',');
        var len=objs.length;
        for(var i=0;i<len;i++) {
            if(this.ArrayContains(valArr,objs[i].value)){
                try{
                    $(objs[i]).iCheck('check');
                }catch(e){
                    objs[i].checked = true;
                    console.log(e);
                }
            }else{
                try{
                    $(objs[i]).iCheck('uncheck');
                }catch(e){
                    objs[i].checked = false;
                    console.log(e);
                }
                try{$(objs[i]).val(value).trigger("change");}catch(e){}
            }
        }
    },

    /**
     * 获取表单默认值
     * @param obj
     * @returns {*}
     */
    getDefaultVal: function(obj){
        var eleType = obj.type;
        if(eleType == "select-one"){
            var dropdown = obj.options;
            for (var i = dropdown.length-1; i >= 0; i--) {
                if (dropdown[i].defaultSelected) {
                    return dropdown[i].value;
                }
            }
        }else{
            return obj.defaultValue;
        }
    },

    /**
     * 获取复选框的值
     */
    getCheckboxValue: function(name){
        var val = [];
        var objs=document.getElementsByName(name);
        if(objs==null || objs.length==0){
            return '';
        }
        var len=objs.length;
        for(var i=0;i<len;i++) {
            if(objs[i].checked){
                val.push(objs[i].value);
            }
        }
        return val.join(",");
    },

    /**
     * 获取单选按钮的值
     */
    getRadiosValue: function(name){
        var objs=document.getElementsByName(name);
        if(objs == null)
            return "";
        for(var i=0;i<objs.length;i++) {
            if(objs[i].checked) {
                return objs[i].value;
            }
        }
        return "";
    },

    /**
     * 获取选择的下拉框的text
     * @param obj
     * @returns {string}
     */
    getOptionText: function(obj){
        var val="";
        for(var i=0; i < obj.options.length; i++){
            if (obj.options[i].selected && obj.value!=""){
                val = obj.options[i].text;
                break;
            }
        }
        return val;
    },

    /**
     * 设置复选框/单选框 全不选
     */
    allRadiosSelect: function(name,flag){
        var objs=document.getElementsByName(name);
        for(var i=0;i<objs.length;i++) {
            if(null!=objs[i]) {
                objs[i].checked=flag;
                try{objs[i].fireEvent("onclick");}catch(e){}
            }
        }
    },

    /**
     * 清空下拉框
     */
    clearOpts: function(selectObj){
        if(selectObj == null) return;
        while(selectObj.childNodes.length>0){
            selectObj.removeChild(selectObj.childNodes[0]);
        }
        var option = null;
        option = document.createElement("option");
        option.appendChild(document.createTextNode("-- 请选择 --"));
        option.setAttribute("value","");
        selectObj.appendChild(option);
    },

    renderData: function(data,renderID){
        var arr = Validator.getJsonData(data);
        for(var i = 0;i<arr.length;i++){
            var obj = arr[i];
            var eleId = obj.name.replaceAll("\\.","\\.");
            var eleDom =  $(renderID).find("#"+eleId);
            if(eleDom.length == 0){
                eleDom =  $(renderID).find("*[name = '"+obj.name+"']");
            }
            if(eleDom.length>0){
                var eleType = eleDom[0].type;
                if(eleType){
                    if(eleType == 'radio'){
                        Validator.setCheckboxValue(obj.name,obj.value);
                    }else if(eleType == 'checkbox'){
                        Validator.setCheckboxValue(obj.name,obj.value);
                    }else if(eleType == 'select-one' || eleType =='select-multiple'){
                        if(Mom.BrowserType(9) || Mom.BrowserType(10)){
                            $(eleDom).val(obj.value);
                            eleDom.change();
                        }else{
                            $(eleDom).val(obj.value);
                        }
                    }
                    else{
                        $(eleDom).val(obj.value);
                    }
                }else{
                    $(eleDom).text(obj.value);
                }

            }

        }
    },

    //获取json数据，遍历数据。返回数组对象
    getJsonData: function(data, arr, key){
        if(key==undefined)key='';
        if(arr==undefined)arr=new Array();
        for(var item in data){
            var value = data[item];
            if( value instanceof Array || typeof value != 'object' ){
                var ret = key==''?item:(key+"."+item)
                arr.push({'name':ret, 'value':value}); //将获取到的属性名称赋值给"name",属性值赋值给"value"
            }else{
                var ret = key==''?item:(key+"."+item);
                this.getJsonData(value, arr, ret);
            }
        }
        return arr;
    }




};

