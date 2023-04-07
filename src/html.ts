export function render(title: string, body: string, pagename?: string): string {
    return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>
<body>
<header>
  ${navbar(pagename)}
</header>
<div class="container">
  ${body}
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

<script>
// warn on external links
var thisHost = new URL(location.href).host;
var links = document.getElementsByTagName('a');
for (i = 0; i < links.length; i++) {
    var link = links[i];
    if (new URL(link.href).host == thisHost) {
        continue;
    }
    link.onclick = function() {
        return confirm('确认离开八重wiki?\\n(即将前往 ' + link.href + ')');
    };
}
</script>
`;
}

function navbar(pagename?: string) {
    return `
<nav class="navbar navbar-expand-lg navbar-dark bg-dark" aria-label="Navbar">
  <div class="container">
    <a class="navbar-brand" href="/">八重Wiki</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" href="/">主页</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/help">帮助</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/index">内容</a>
        </li>
        ${pagename ? `
        <li class="nav-item">
          <a class="nav-link" href="/${pagename}?edit">[编辑 '${pagename}']</a>
        </li>` : ''}
      </ul>
      <form role="search" action="/search">
        <input name="q" class="form-control" type="search" placeholder="搜索" aria-label="Search">
      </form>
    </div>
  </div>
</nav>`;
}

export function link(href: string, text?: string): string {
    return `<a href="${href}">${text ? text : href}</a>`;
}

export function listGroup(stuff: string[]): string {
    let html = `<ul class="list-group">\n`;
    for (const thing of stuff) {
        html = html.concat(`<li class="list-group-item">${thing}</li>\n`);
    }
    html = html.concat('</ul>\n');
    return html;
}
