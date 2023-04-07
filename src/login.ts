
import { render } from './html';
import user from './user';

function showpage(): string {
    const html = `
<div class="container">
    <div class="row">
                <div class="panel-body">
                    <form method="post" action="/_login">
                        <div class="form-group">
                            <input class="form-username" placeholder="username" name="username" type="username" autofocus>
                        </div>
                        <div class="form-group">
                            <input class="form-password" placeholder="Password" name="password" type="password" value="">
                        </div>
                        <button type="submit" class="btn btn-primary">登录/注册</button>
                    </form>
        </div>
    </div>
</div>

`;//这里是登录页面的html代码,包括账户密码输入框,登录按钮
    return (render('登录', '<h5 class="text-primary">登录</h5>' + html));
}


async function login(account:string,password:string):Promise<string>{
    if (account == null || password == null) {
        return showpage();
    }
    return await user.checkUser(account, password);
}




export default {showpage,login}