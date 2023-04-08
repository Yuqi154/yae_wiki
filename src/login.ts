
import { render } from './html';
import user from './user';

function showpage(): string {
    const html = `
<div class="container">
    <div class="row">
                <div class="panel-body">
                    <form method="post" action="/login">
                        <div class="form-group">
                            <input class="form-username" placeholder="username" name="username" type="username" autofocus>
                        </div>
                        <div class="form-group">
                            <input class="form-password" placeholder="Password" name="password" type="password" value="">
                        </div>
                        <button type="submit" class="btn btn-primary">登录</button>
                        <a href="/signup" class="btn btn-primary">注册</a>
                    </form>
        </div>
    </div>
</div>

`;//这里是登录页面的html代码
    return (render('八重wiki-登录', '<h5 class="text-primary">登录</h5>' + html));
}

function signuppage(): string {
    const html = `
<div class="container">
    <div class="row">
                <div class="panel-body">
                    <form method="post" action="/signup">
                        <div class="form-group">
                            <input class="form-username" placeholder="username" name="username" type="username" autofocus>
                        </div>
                        <div class="form-group">
                            <input class="form-password" placeholder="Password" name="password" type="password" value="">
                        </div>
                        <button type="submit" class="btn btn-primary">注册</button>
                        <a href="/login" class="btn btn-primary">返回登录</a>
                    </form>
        </div>
    </div>
</div>

`;//这里是注册页面的html代码
    return (render('八重wiki-注册', '<h5 class="text-primary">注册</h5>' + html));
}

async function login(account:string,password:string):Promise<string>{
    return await user.checkUser(account, password);
}




export default {showpage,login,signuppage}