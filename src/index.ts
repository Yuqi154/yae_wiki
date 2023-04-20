import { Context, Hono } from 'hono';
import { bodyParse } from 'hono/body-parse';

import { link, listGroup, render } from './html';
import Page from './Page';
import login from './login';
import wikiSearch, { searchWords } from './wikiSearch';
import user from './user';
import { common, loginc } from './config';
import utils from './utils';




const app = new Hono();

app.get('/', (ctx) => {
  return ctx.redirect('/home');
});

app.get('/control/createpage', async (ctx) => {
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  return ctx.html(await Page.createpage(auth));
})

app.get('/help', async (ctx) => {
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  return ctx.html(await Page.showHelp(auth));
})

app.get('/user/login', async (ctx) => {
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  return ctx.html(await login.showpage(auth));
})

app.get('/user/signup', async (ctx) => {
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  if (loginc.allowregister) {
    return ctx.html(await login.signuppage(auth));
  } else {
    return ctx.html('<h5 class="text-primary">注册功能已关闭</h5>');
  }
})

app.get('/home', async (ctx) => {
  let login = true;
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  if (auth != undefined) {  
    return ctx.html(await Page.showHome(login, auth));
  }
  return ctx.html(await Page.showHome(login));
})

app.get('/user', (ctx) => {
  return ctx.redirect('/user/dashboard');
})

app.get('/user/dashboard', async (ctx) => {
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  let login = true;
  if (auth == undefined) {
    return ctx.redirect('/user/login');
  }
  if (login){
    return ctx.html(await user.showUser(auth));
  }else{
    return ctx.redirect('/user/login');
  }
})

app.get('/index', async (ctx) => {
  const pageNames = await Page.list();
  const htmlList = listGroup(pageNames.map((name) => link(name)));
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  return ctx.html(await render(common.wikiname + '-所有内容', `<h2 class="text-primary">所有内容</h2>${htmlList}`, auth));
})

app.get('/search', async (ctx) => {
  const query = searchWords(ctx.req.query('q'));
  const hits = await wikiSearch.find(query);
  let html = '<p>没有匹配条目 :(</p>'
  if (0 < hits.length) {
    html = listGroup(hits.map((pageName) => link(pageName)));
  }
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  return ctx.html(await render(common.wikiname + '-搜索结果', `<h2 class="text-primary">搜索结果 (${query})</h2>${html}`, auth));
})

app.get('/:pageName', async (ctx) => {
  const pageName = decodeURIComponent(ctx.req.param('pageName'));
  const edit = ctx.req.query().hasOwnProperty('edit');
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  const html = await (edit ? Page.edit(pageName,auth) : Page.show(pageName,auth))
  return ctx.html(html);
});

app.post('/user/login', bodyParse(), async (ctx) => {
  let htmlstr = "";
  const { username, password } = ctx.req.parsedBody;
  const loginhead = common.wikiname + '-登录';
  const result = await user.checkUser(username, password);
  if (result == "success") {
    htmlstr = '<h5 class="text-primary">登录成功</h5><a href="/">返回首页</a>';
  } else if (result == "No such user") {
    htmlstr = `<h5 class="text-primary">用户名或密码错误</h5><a href="/user/login">返回</a>`;
    return ctx.html(await render(loginhead, htmlstr), 401);
  }
  const auth = await user.getuserhash(username);
  let headers = { 'Set-Cookie': 'auth=' + auth + '; Path=/; HttpOnly'};
  if (auth == null) {
    return ctx.html(await render(loginhead, htmlstr), 401);
  } else {
    user.updatelogintime(auth);
    return ctx.html(await render(loginhead, htmlstr, auth), 200, headers);
  }

});

app.post('/user/signup', bodyParse(), async (ctx) => {
  let htmlstr = "";
  const { username, password } = ctx.req.parsedBody;
  const signuphead = common.wikiname + '-注册';
  const result = await user.checkUser(username, password);
  if (result == "success") {
    htmlstr = '<h5 class="text-primary">用户名已注册</h5><a href="/user/signup">返回</a>';
    return ctx.html(await render(signuphead, htmlstr), 401);
  } else if (result == "No such user") {
    user.saveUser(username, password);
    htmlstr = '<h5 class="text-primary">注册成功</h5><a href="/user/login">前往登录</a>';
  } else {
    htmlstr = '<h5 class="text-primary">用户名已注册</h5><a href="/user/signup">返回</a>';
    return ctx.html(await render(signuphead, htmlstr), 401);
  }
  const auth = await user.getuserhash(username);
  let headers = { 'Set-Cookie': 'auth=' + auth  + '; Path=/; HttpOnly'};
  if (auth == null) {
    return ctx.html(await render(signuphead, htmlstr), 401);
  } else {
    return ctx.html(await render(signuphead, htmlstr, auth), 200, headers);
  }

});


app.post('/api/v1/createpage', bodyParse(), async (ctx) => {
  const { pagename,apikey } = ctx.req.parsedBody;
  if (apikey == undefined){
    const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
    if (auth == undefined) {
      return ctx.json({status:401,message:"未登录"});
    }
    const result = await user.checkauth(auth);
    if (!result) {
      return ctx.json({status:401,message:"凭证错误"});
    }    
    Page.save(pagename,"",auth);
    return ctx.redirect("/" + pagename)
  }else{
    const result = await user.checkauth(apikey);
    if (!result) {
      return ctx.json({status:401,message:"凭证错误"});
    }
    Page.save(pagename,"",apikey);
    return ctx.json({status:200,message:"success"});
  }
});

app.post('/:pageName', bodyParse(), async (ctx) => {
  const pageName = decodeURIComponent(ctx.req.param('pageName'));
  const auth = utils.getauth(ctx.req.headers.get("cookie")?.toString());
  if (auth == undefined) {
    return ctx.text('未登录', 401);
  }
  const result = await user.checkauth(auth);
  if (!result) {
    return ctx.text('凭证错误' + result, 401);
  }

  if (50 < pageName.length) {
    return ctx.text(`过长的条目名 (${pageName.length}), 长度上限为50字符`, 414);
  }
  const { content } = ctx.req.parsedBody;
  if (12800 < content.length) {
    return ctx.text(`过长的内容 (${content.length}), 长度上限为12800字符`, 413)
  }
  const html = await Page.save(pageName, content, auth);
  //console.info(`用户 '${auth}' 更新了 /${pageName}`);
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

  const pageNames = await Page.list();
  console.log(`重载wiki页面 (${pageNames.join(', ')})`);

  // collect current contents
  const pages: Record<string, string> = {};
  for (const pageName of pageNames) {
    const { content } = await Page.get(pageName);
    pages[pageName] = content;
  }

  // clear index and re-fill from new page content
  await wikiSearch.clear();
  for (const [name, content] of Object.entries(pages)) {
    await wikiSearch.index(name, content);
  }
}
