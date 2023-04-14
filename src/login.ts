
import { common } from './config';
import { render } from './html';

async function showpage(auth?:string): Promise<string> {
    const html = `
    <div class="input-group mb-20">
        <form method="post" action="/user/login">
            <div class="form-group">
                <input class="form-control" placeholder="用户名" name="username" type="username" autofocus>
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="密码" name="password" type="password" value="">
            </div>
            <button type="submit" class="btn btn-primary">登录</button>
            <a href="/user/signup">注册</a>
        </form>
    </div>
`;//这里是登录页面的html代码
    return (await render(common.wikiname+' - 登录', '<h5 class="text-primary">登录</h5>' + html,auth));
}

async function signuppage(auth?:string): Promise<string> {
    const html = `
    <div class="input-group mb-20">
        <form method="post" action="/user/signup">
            <div class="form-group">
                <input class="form-control" placeholder="用户名" name="username" type="username" autofocus>
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="密码" name="password" type="password" value="">
            </div>
            <button type="submit" class="btn btn-primary">注册</button>
            <a href="/user/login">返回登录</a>
        </form>
    </div>

`;//这里是注册页面的html代码
    return (await render(common.wikiname+' - 注册', '<h5 class="text-primary">注册</h5>' + html,auth));
}





export default {showpage,signuppage}