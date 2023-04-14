//an user script
//导入加密模块
import {SHA256} from 'crypto-js';
import { common } from './config';
import { render } from './html';

declare const USERS: KVNamespace;
declare const USERS_INDEX: KVNamespace;

async function checkUser(username:string,password:string):Promise<string>{
    //从KV中获取用户名对应的密码
    let userhash = await  USERS_INDEX.get(username);
    //如果用户不存在，返回false
    if(userhash == null){
        return "No such user";
    }else{
        //如果用户存在，将用户输入的密码加密后与KV中的密码比较
        let userjson = await USERS.get(userhash);
        if (userjson == null){
            return "No such user";
        }
        let userPassword = JSON.parse(userjson).userpassword;
        if (userPassword == SHA256(password).toString()){
            return "success";
        }else{
            return "Wrong password";
        }
    }
}

async function checkauth(cookie:string){
    let userhash = await USERS.get(cookie);
    if(userhash == null){
        return false;
    }else{
        return true;
    }
}

async function getuserhash(username:string){
    let userhash = await USERS_INDEX.get(username);
    if(userhash == null){
        return null;
    }else{
        return userhash;
    }
}

async function getusername(userhash:string){
    let userjson = await USERS.get(userhash);
    if(userjson == null){
        return null;
    }else{
        return JSON.parse(userjson).username;
    }
}


async function saveUser(username:string,password:string){
    let userhash = SHA256(username+password).toString();
    USERS_INDEX.put(username,userhash );
    //console.log(userhash)
    let userjson = createuserjson();
    userjson.username = username;
    userjson.userpassword = SHA256(password).toString();
    userjson.userlastlogin = new Date().toString();
    userjson.userregister = new Date().toString();
    USERS.put(userhash,JSON.stringify(userjson));
    return null;
}



function getCookie(name:string,cookieStr: string): string {
    const cookies = cookieStr.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return '';
    //获取cookie
}

async function showUser(userhash:string){
    //显示用户信息
    const userjson = await USERS.get(userhash);
    if (userjson == null) {
    } else {
        const user = JSON.parse(userjson);
        //解析json
        if (userjson == null) {
        } else {
            //将json转换为html
            /*
            const html = `
                <h1>用户信息</h1>
                <p>用户名：${user.username}</p>
                <p>用户密码：${user.userpassword}</p>
                <p>用户邮箱：${user.useremail}</p>
                <p>用户电话：${user.userphone}</p>
                <p>用户QQ：${user.userqq}</p>
                <p>用户性别：${user.usersex}</p>
                <p>用户生日：${user.userbirthday}</p>
                <p>用户简介：${user.userintroduction}</p>
                <p>用户头像：${user.useravatar}</p>
                <p>用户背景：${user.userbackground}</p>
                <p>用户等级：${user.userlevel}</p>
                <p>用户经验：${user.userexperience}</p>
                <p>用户金钱：${user.usermoney}</p>
                <p>用户文章：${user.userarticle}</p>
                <p>用户评论：${user.usercomment}</p>
                <p>用户收藏：${user.usercollect}</p>
                <p>用户历史：${user.userhistory}</p>
                <p>用户消息：${user.usermessage}</p>
                <p>用户最后登录时间：${user.userlastlogin}</p>
                <p>用户最后登出时间：${user.userlastlogout}</p>
                <p>用户注册时间：${user.userregister}</p>
                <p>用户最后登录IP：${user.userlastip}</p>
                <p>用户最后登录地点：${user.userlastlocation}</p>
                <p>用户最后登录设备：${user.userlastdevice}</p>
                <p>用户最后登录浏览器：${user.userlastbrowser}</p>
                <p>用户最后登录操作系统：${user.userlastos}</p>
                <p>用户最后登录系统：${user.userlastsystem}</p>
                <p>用户最后登录分辨率：${user.userlastresolution}</p>
                <p>用户最后登录语言：${user.userlastlanguage}</p>
                <p>用户最后登录时区：${user.userlasttimezone}</p>
                <p>用户最后登录时区偏移：${user.userlasttimezoneoffset}</p>
                <p>用户最后登录时区名称：${user.userlasttimezonename}</p>
                <p>用户最后登录时区缩写：${user.userlasttimezoneabbreviation}</p>
                <p>用户最后登录时区是否夏令时：${user.userlasttimezoneisdst}</p>
                `
*/
            const html = `
                <h3 class="text-primary">${user.username}</h3>
                <p>用户最后登录时间：${user.userlastlogin}</p>
                <p>用户注册时间：${user.userregister}</p>

                `
            return render(common.wikiname+" - 用户信息",html,userhash)
        }
        //返回html
    }
    return render(common.wikiname+" - 用户信息",`<h5 class="text-primary">错误</h5>"`);

}

async function updatelogintime(userhash:string){
    //更新登录时间
    const userjson = await USERS.get(userhash);
    if (userjson == null) {
        return null;
    }
    let user= JSON.parse(userjson);
    user.userlastlogin = new Date().toString();
    USERS.put(userhash,JSON.stringify(userjson));
    return null;
}





function createuserjson(){
    //创建用户json
    let userjson = {
        "username":"username",
        "userpassword":"userpassword",
        "useremail":"useremail",
        "userphone":"userphone",
        "userqq":"userqq",
        "usersex":"usersex",
        "userbirthday":"userbirthday",
        "userintroduction":"userintroduction",
        "useravatar":"useravatar",
        "userbackground":"userbackground",
        "userlevel":"userlevel",
        "userexperience":"userexperience",
        "usermoney":"usermoney",
        "userarticle":"userarticle",
        "usercomment":"usercomment",
        "usercollect":"usercollect",
        "userhistory":"userhistory",
        "usermessage":"usermessage",
        "userregister":"userregister",
        "userlastlogin":"userlastlogin",
        "userlastlogout":"userlastlogout",
        "userlastip":"userlastip",
        "userlastlocation":"userlastlocation",
        "userlastdevice":"userlastdevice",
        "userlastbrowser":"userlastbrowser",
        "userlastos":"userlastos",
        "userlastsystem":"userlastsystem",
        "userlastresolution":"userlastresolution",
        "userlastlanguage":"userlastlanguage",
        "userlasttimezone":"userlasttimezone",
        "userlastnetwork":"userlastnetwork",
        "userlastisp":"userlastisp"
    }
    return userjson;
}

export default {checkUser,saveUser,getCookie,checkauth,getuserhash,getusername,showUser,updatelogintime};