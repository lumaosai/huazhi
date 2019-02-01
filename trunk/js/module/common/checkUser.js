/**
 * Created by mac on 18/2/9.
 * 用户校验
 */

define(['Common'],function(require){
    var tokenType = Mom.getCookie("token_type"),
        authorization = Mom.getCookie("authorization");
    if(tokenType=null || tokenType == "" || authorization ==null || authorization == "") {
        alert('未登录或登录超时。请重新登录，谢谢！');
        location.href = Mom.basePath+"/login.html";
    }
});
