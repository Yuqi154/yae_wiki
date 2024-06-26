# Yae Wiki

A Wiki build on Cloudflare Workers with Workers KV

基于Cloudflare Workers 和 Workers KV 构建的 Wiki

## Setup 安装

You need npm and a Cloudflare account (free).

您将需要安装node npm和Cloudflare帐户（免费）。

1. Run `npm install`.

   运行`npm install`

1. You need a cloudflare account, register at

   您需要一个cloudflare帐户，
<https://dash.cloudflare.com/sign-up/workers>

1. login to cloudflare

   登录到cloudflare

   `wrangler login`

1. Create namespace through wrangler:

   通过wrangler创建命名空间：

   `wrangler kv:namespace create "PAGES"`

   `wrangler kv:namespace create "PAGE_INDEX"`

   `wrangler kv:namespace create "USERS"`

   `wrangler kv:namespace create "USERS_INDEX"`

   `wrangler kv:namespace create "PAGE_HISTORY"`

   `wrangler kv:namespace create "COMMON"`

1. Edit [wrangler.toml](./wrangler.toml) to insert your KV space ids

    编辑[wrangler.toml](./wrangler.toml)并插入您的KV空间ID

## Running 开发

`wrangler dev`

## Publishing 发布

`wrangler publish` will make your worker public

`wrangler publish` 将使您的worker公开

## Notes

## TODO

- [x] user auth
- [x] user page
- [ ] user profile
- [ ] user settings
- [ ] email verification
- [x] edit history
