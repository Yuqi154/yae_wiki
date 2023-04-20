import user from "./user";

function datenow(now:Date): string {
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hour = ('0' + now.getHours()).slice(-2);
    const minute = ('0' + now.getMinutes()).slice(-2);
    const second = ('0' + now.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

}

export default { datenow,createcontentjson,getauth };


function createcontentjson(){
    //创建内容json
    let contentjson = {
        "content":"content",
        "contenttime":"contenttime",
        "contentuser":"contentuser",
    }
    return contentjson;
}


function getauth(cookiestr:string|undefined){
  if (cookiestr == null) {
  } else if (cookiestr.indexOf("auth") == -1) {
  } else {
    const auth = user.getCookie("auth", cookiestr)
    return auth;
  }
  return undefined;
}