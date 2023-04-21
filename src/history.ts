
import {SHA256} from 'crypto-js';
import { render } from './html';
import user from './user';
import utils from './utils';
import { extra } from './Page';
declare const PAGE_HISTORY: KVNamespace;
declare const PAGES: KVNamespace;

async function saveHistory(content:string,pagename:string){
    let historyhash = SHA256(content).toString();
    //console.log(userhash)
    let history = await PAGE_HISTORY.get(pagename)
    let historyjson;
    if(history == null){
        historyjson = utils.createhistoryjson();
    }else{
        historyjson = JSON.parse(history);
    }
    //将historyhash加入historyjson
    historyjson.history.push(historyhash);
    //将historyjson存入KV
    await PAGE_HISTORY.put(pagename,JSON.stringify(historyjson));
    console.log("history saved");
    return historyhash;
}

async function getHistory(pagename:string){
    return await PAGE_HISTORY.get(pagename);
}

async function list(pageName:string): Promise<{shorthash:string[],editer:string[],time:string[]}> {
    try{
        const pagehistory = await PAGE_HISTORY.get(pageName);
        if (pagehistory == null) {
            return {shorthash:[""],editer:[""],time:[""]};
        }
        const historyjson = JSON.parse(pagehistory);
        //解析historyjson并读取history每个元素对应的内容
        let historyrjson = {shorthash:[""],editer:[""],time:[""]};
        for(let i = 1;i<historyjson.history.length;i++){
            let historyhash = historyjson.history[i];
            
            let historycontent = await PAGES.get(historyhash);
            if (historycontent === null) {
                break;
            }

            let historycontentjson = JSON.parse(historycontent);
            historyrjson.shorthash.push(historyhash.substring(0,8));
            historyrjson.editer.push(await user.getusername(historycontentjson.contentuser));
            historyrjson.time.push(historycontentjson.contenttime);
        }
        //删除第一个空元素
        historyrjson.shorthash.shift();
        historyrjson.editer.shift();
        historyrjson.time.shift();
        return historyrjson;
    }catch{
        return {shorthash:["500 内部服务器错误"],editer:[""],time:[""]};
    }
}

async function getHistorypage(pageName:string,historyhash:string){
    try{
        const pagehistory = await PAGE_HISTORY.get(pageName);
        if (pagehistory == null) {
            return {content:"404 没有所指向的页面",editer:"",time:""};
        }
        const historyjson = JSON.parse(pagehistory);
        //解析historyjson并计算history的短哈希
        let historyshorthash = [];
        for(let i = 1;i<historyjson.history.length;i++){
            historyshorthash.push(historyjson.history[i].substring(0,8));
        }
        //判断historyhash是否在history中
        if(!historyshorthash.includes(historyhash)){
            return {content:"404 没有所指向的页面",editer:"",time:""};
        }
        //找到historyhash对应的长哈希
        historyhash = historyjson.history[historyshorthash.indexOf(historyhash)+1];
        //读取historyhash对应的内容
        let historycontent = await PAGES.get(historyhash);
        if (historycontent === null) {
            return {content:"404 没有所指向的页面",editer:"",time:""};
        }
        let historycontentjson = JSON.parse(historycontent);
        let username= await user.getusername(historycontentjson.contentuser);
        return {content:historycontentjson.content,editer:username,time:historycontentjson.contenttime};
    }catch{
        return {content:"500 内部服务器错误",editer:"",time:""};
    }
}

async function showHistory(pageName:string,historyhash:string,auth?:string){
    try{
        const pagehistory = await getHistorypage(pageName,historyhash)
        if (pagehistory.content == "404 没有所指向的页面" || pagehistory.content == "500 内部服务器错误") {
            return pagehistory.content;
        }
        
        const html = extra.showHTML(pageName, pagehistory.content, await user.getusername(pagehistory.editer), pagehistory.time);
        return render(pageName,html,auth);
    }
    catch{
        return "500 内部服务器错误";
    }
}
export default {saveHistory,getHistory,list,showHistory};