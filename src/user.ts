//an user script
//导入加密模块
import * as crypto from 'crypto-js';

declare const USERS: KVNamespace;

async function checkUser(username:string,password:string):Promise<string>{
    //从KV中获取用户名对应的密码
    let userPassword = await  USERS.get(username);
    //如果用户不存在，返回false
    if(userPassword == null){
        return "No such user";
    }else{
        //如果用户存在，将用户输入的密码加密后与KV中的密码比较
        if (userPassword == crypto.SHA256(password).toString()){
            return "success";
        }else{
            return "Wrong password";
        }
    }
}

async function saveUser(username:string,password:string){
    //将用户名和密码加密后存入KV
    USERS.put(username, crypto.SHA256(password).toString());
    return null;
}

function encoder(username:string):string{
    return crypto.SHA256(username).toString();
}


function getCookie(name:string,cookieStr: string): string {
    const cookies = cookieStr.split(',');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return '';
}

export default {checkUser,saveUser,encoder,getCookie};