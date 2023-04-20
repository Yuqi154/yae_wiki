import showdown from 'showdown';

import { render } from './html';
import { common } from './config';
import  utils  from './utils';
import user from './user';

// see wrangler.toml
declare const PAGES: KVNamespace;

async function save(name: string, content: string, auth: string): Promise<string> {
    //将内容，时间，用户合并成一个json字符串
    let username = await user.getusername(auth);
    let contentjson = utils.createcontentjson();
    contentjson.content = content;
    contentjson.contenttime = utils.datenow(new Date);
    contentjson.contentuser = auth;
    await PAGES.put(name, JSON.stringify(contentjson));
    
    return render(name, showHTML(name, content, username, utils.datenow(new Date)), name);
}

async function edit(name: string,auth?:string): Promise<string> {
    const { content } = await get(name);
    return render(name, editHTML(name, content),auth, name);
}

async function show(name: string,auth?:string): Promise<string> {
    const content = await PAGES.get(name);
    if (content === null) {
        return render(name, editHTML(name, ''),auth, name);
    }
    //解析json字符串
    let contentjson = JSON.parse(content);
    let html = "";
    try {
        let username= await user.getusername(contentjson.contentuser);
        html = showHTML(name, contentjson.content, username, contentjson.contenttime);
    }catch{
        return render(name, editHTML(name, ''),auth, name);
    }
    return render(name, html,auth, name)
}

async function list(): Promise<string[]> {
    return (await PAGES.list()).keys.map(k => k.name);
}

async function get(name: string): Promise<{ name: string, content: string }> {
    const contentjson = (await PAGES.get(name));
    if (contentjson === null) {
        return { name, content: '' };
    }
    let content = JSON.parse(contentjson).content;
    return { name, content };
}

async function showHelp(auth?:string): Promise<string> {
    const html = markdown(`
你好，这是一个[[wiki]]！

您可以编辑任何页面。页面以[Markdown](https://markdown.com.cn/)书写
这个页面内部的链接有额外的语法（就像在维基百科上一样，双方括号中的单词是维基链接）。

通过访问它们来创建新页面，也许可以先创建一个指向它们的链接。
`);
    return (await render(common.wikiname + ' - 帮助', '<h2 class="text-primary">帮助</h2>' + html,auth));
}

async function showHome(login: boolean,auth?:string): Promise<string> {
    let html = "";
    let users = "";
    if (auth==undefined){
        login = false;
    }else{
        users = await user.getusername(auth);
    }
    if (login == true) {
        html = markdown(`
### ${users},欢迎来到八重wiki
###您已经登录，可以编辑和[创建页面](/control/createpage)
`);
    } else {
        html = markdown(`
###欢迎来到八重wiki
`);
    }
    return (await render(common.wikiname, '<h2 class="text-primary">主页</h2>' + html,auth));
}

export default { save, show, edit, list, get, showHelp, showHome,createpage };

function markdown(code: string): string {
    return new showdown.Converter().makeHtml(wiki2md(code));
}

function wiki2md(code: string): string {
    return code.replace(/\[\[([^\]]*)\]\]/ig, '[$1]($1)')
}

function showHTML(name: string, content: string, user: string, time: string): string {
    try {
        return `
<h1 class="text-primary">${name}</h1>
${markdown(content)}
<p>上次编辑：${time} 用户：${user}</p>

`
    } catch (e) {
        return `
<h1 class="text-primary">${name}</h1>
<p>内容解析错误</p>
`
            ;//添加上次编辑时间和用户
    }
}
function editHTML(name: string, content: string): string {
    return `
<h1 class="text-primary">${name} <small class="text-muted">(正在编辑)</small></h1>
<form method="post" action="/${name}">
  <div class="form-group">
    <textarea class="form-control" id="pageContent" name="content" rows="10">${content}</textarea>
  </div>
  <div class="form-group">
    <button type="submit" class="btn btn-primary">保存</button>
    <a class="btn btn-secondary" href="/${name}" role="button">取消</a>
  </div>
</form>
`;
}

async function createpage(auth?:string){
    //一个输入框，一个按钮
    //输入框输入页面名，点击按钮创建页面
    //创建页面后，跳转到编辑页面
    //创建页面前，检查是否已经存在
    const html =`
    <div class="input-group mb-3">
        <form method="post" action="/api/v1/createpage">
            <div class="form-group">
                <input type="text" name="pagename" class="form-control" placeholder="页面名" aria-label="页面名" aria-describedby="button-addon2">
            </div>
            <div class="input-group-append">
                <button type="submit" class="btn btn-primary">创建</button>
            </div>
        </form>
    </div>
    `
    return await render(common.wikiname + ' - 创建页面', html,auth);
}