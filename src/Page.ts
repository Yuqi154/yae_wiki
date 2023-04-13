import showdown from 'showdown';

import { render } from './html';
import { common } from './config';

// see wrangler.toml
declare const PAGES: KVNamespace;

async function save(name: string, content: string, username: string): Promise<string> {
    //将内容，时间，用户合并成一个json字符串
    //创建json对象
    let contentstr = content + "`,`" + datenow() + "`,`" + username;
    await PAGES.put(name, contentstr);

    
    
    
    return render(name, showHTML(name, content, username, datenow()), name);
}

async function edit(name: string): Promise<string> {
    const { content } = await get(name);
    let contentl = content.split("`,`");
    return render(name, editHTML(name, contentl[0]), name);
}

async function show(name: string): Promise<string> {
    const content = await PAGES.get(name);
    if (content === null) {
        return render(name, editHTML(name, ''), name);
    }
    //将content分割成三部分，分别是内容，时间，用户
    let html = "";
    try {
        let contentl = content.split("`,`");
        html = (content === null) ? editHTML(name, '') : showHTML(name, contentl[0], contentl[1], contentl[2]);
    }catch{
        html = (content === null) ? editHTML(name, '') : showHTML(name, content, "", "");
    }
    return render(name, html, name)
}

async function list(): Promise<string[]> {
    return (await PAGES.list()).keys.map(k => k.name);
}

async function get(name: string): Promise<{ name: string, content: string }> {
    const content = (await PAGES.get(name)) || '';
    return { name, content };
}

function showHelp(): string {
    const html = markdown(`
你好，这是一个[[wiki]]！

您可以编辑任何页面。页面以[Markdown](https://markdown.com.cn/)书写
这个页面内部的链接有额外的语法（就像在维基百科上一样，双方括号中的单词是维基链接）。

通过访问它们来创建新页面，也许可以先创建一个指向它们的链接。
`);
    return (render(common.wikiname + '-帮助', '<h2 class="text-primary">帮助</h2>' + html));
}

function showHome(login: GLint64,user:string): string {
    let html = "";
    if (login == 1) {
        html = markdown(`
### ${user},欢迎来到八重wiki
###您已经登录，可以编辑页面
`);
    } else {
        html = markdown(`
###欢迎来到八重wiki
###在编辑页面前，请先[登录](/login)
`);
    }
    return (render(common.wikiname, '<h2 class="text-primary">主页</h2>' + html));
}

export default { save, show, edit, list, get, showHelp, showHome };

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


function datenow(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hour = ('0' + now.getHours()).slice(-2);
    const minute = ('0' + now.getMinutes()).slice(-2);
    const second = ('0' + now.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

}