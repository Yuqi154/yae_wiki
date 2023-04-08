import { Context, Hono } from 'hono';
import { bodyParse } from 'hono/body-parse';

import { link, listGroup, render } from './html';
import wikiPage from './wikiPage';
import login from './login';
import wikiSearch, { searchWords } from './wikiSearch';
import user from './user';




const app = new Hono();

app.get('/', (ctx) => {
  return ctx.redirect('/home');
});

app.get('/help', async (ctx) => {
  return ctx.html(wikiPage.showHelp());
})

app.get('/login', async (ctx) => {
  return ctx.html(login.showpage());
})

app.get('/home', async (ctx) => {
  return ctx.html(wikiPage.showHome());
})

app.get('/index', async (ctx) => {
  const pageNames = await wikiPage.list();
  const htmlList = listGroup(pageNames.map((name) => link(name)));
  return ctx.html(render('所有内容', `<h2 class="text-primary">所有内容</h2>${htmlList}`));
})

app.get('/search', async (ctx) => {
  const query = searchWords(ctx.req.query('q'));
  const hits = await wikiSearch.find(query);
  let html = '<p>no hits :(</p>'
  if (0 < hits.length) {
    html = listGroup(hits.map((pageName) => link(pageName)));
  }
  return ctx.html(render('搜索结果', `<h2 class="text-primary">搜索结果 (${query})</h2>${html}`));
})

app.get('/:pageName', async (ctx) => {
  const pageName =   decodeURIComponent(ctx.req.param('pageName'));
  const edit = ctx.req.query().hasOwnProperty('edit');
  const html = edit ? wikiPage.edit(pageName) : wikiPage.show(pageName);
  return ctx.html(await html);
});

app.post('/login', bodyParse(), async (ctx) => {
  let htmlstr = "";
  const { username, password } = ctx.req.parsedBody;

  const result = await login.login(username, password);
  if (result == "success") {
    htmlstr =  '<h5 class="text-primary">登录成功</h5>';
  } else if (result == "No such user") {
    htmlstr = `<h5 class="text-primary">用户名或密码错误</h5>`;
    return ctx.html(render('八重wiki-登录',htmlstr),401);
  }
  let headers={'Set-Cookie':'username='+username+',password='+password};
  return ctx.html(render('八重wiki-登录', htmlstr),200,headers);

});

app.post('/signup', bodyParse(), async (ctx) => {
  let htmlstr = "";
  const { username, password } = ctx.req.parsedBody;

  const result = await login.login(username, password);
  if (result == "success") {
    htmlstr =  '<h5 class="text-primary">用户名已注册</h5>';
    return ctx.html(render('八重wiki-注册', htmlstr),401);
  } else if (result == "No such user") {
    user.saveUser(username, password);
    htmlstr =  '<h5 class="text-primary">注册成功</h5>';
  } else {
    htmlstr =  '<h5 class="text-primary">用户名已注册</h5>';
    return ctx.html(render('八重wiki-注册', htmlstr),401);
  }
  let headers={'Set-Cookie':'username='+username+',password='+password};
  return ctx.html(render('八重wiki-注册', htmlstr),200,headers);

});

app.post('/:pageName',bodyParse(), async (ctx) => {
  const pageName =   decodeURIComponent(ctx.req.param('pageName'));
  const cookiestr = ctx.req.headers.get("cookie")?.toString();
  if (cookiestr==null){
    return ctx.text('请先登录', 401);
  }else if ((cookiestr.indexOf("username")==-1)&&(cookiestr.indexOf("password")==-1)){
    return ctx.text('请先登录', 401);
  }

  const username = user.getCookie("username",cookiestr)
  const password = user.getCookie("password",cookiestr)
  const result = await user.checkUser(username, password);
  if(result!="success"){
    return ctx.text('凭证错误'+result, 401);
  }

  if (50 < pageName.length) {
    return ctx.text(`过长的条目名 (${pageName.length}), 长度上限为50字符`, 414);
  }
  const { content } = ctx.req.parsedBody;
  if (12800 < content.length) {
    return ctx.text(`过长的内容 (${content.length}), 长度上限为12800字符`, 413)
  }
  const html = await wikiPage.save(pageName, content, username);
  console.info(`用户 '${username}' 更新了 /${pageName}`);
  await wikiSearch.index(pageName, content);
  return ctx.html(html);
});


app.fire();

addEventListener('scheduled', (event: ScheduledEvent) => {
  event.waitUntil(onScheduleEvent(event));
});

async function onScheduleEvent(event: ScheduledEvent) {
  switch (event.cron) {
    case '*/60 * * * *':
      await reIndex();
      break;
  }
  console.log('cron processed');
}

async function reIndex(): Promise<void> {

  const pageNames = await wikiPage.list();
  console.log(`re-indexing wiki pages (${pageNames.join(', ')})`);

  // collect current contents
  const pages: Record<string, string> = {};
  for (const pageName of pageNames) {
    const { content } = await wikiPage.get(pageName);
    pages[pageName] = content;
  }

  // clear index and re-fill from new page content
  await wikiSearch.clear();
  for (const [name, content] of Object.entries(pages)) {
    await wikiSearch.index(name, content);
  }
}
