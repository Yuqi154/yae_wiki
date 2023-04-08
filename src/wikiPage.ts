import showdown from 'showdown';

import { render } from './html';

// see wrangler.toml
declare const PAGES: KVNamespace;

async function save(name: string, content: string, username: string): Promise<string> {
    content += "\n上次编辑：" + datenow() + " 用户：" + username
    await PAGES.put(name, content);
    return render(name, showHTML(name, content), name);
}

async function edit(name: string): Promise<string> {
    const { content } = await get(name);
    return render(name, editHTML(name, content), name);
}

async function show(name: string): Promise<string> {
    const content = await PAGES.get(name);
    const html = (content === null) ? editHTML(name, '') : showHTML(name, content);
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
    return (render('八重wiki-帮助', '<h2 class="text-primary">帮助</h2>' + html));
}

function showHome(): string {
    const html = markdown(`
###欢迎来到八重wiki
###在编辑页面前，请先[登录](/login)

`);
    return (render('八重wiki-主页', '<h2 class="text-primary">主页</h2>' + html));
}

export default { save, show, edit, list, get, showHelp, showHome };

function markdown(code: string): string {
    return new showdown.Converter().makeHtml(wiki2md(code));
}

function wiki2md(code: string): string {
    return code.replace(/\[\[([^\]]*)\]\]/ig, '[$1]($1)')
}

function showHTML(name: string, content: string): string {
    return `
<h1 class="text-primary">${name}</h1>
${markdown(content)}
`;
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