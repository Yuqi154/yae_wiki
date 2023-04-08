# Yae Wiki

A stupid experiment building a Wiki on Cloudflare Workers with Workers KV for
persistence.

Durable Objects would probably be a better idea, and enable simple page edit
history.

## Setup

You will need npm and a Cloudflare account (free).

1. Run `npm install`.

1. You'll need a Workers account, register at
https://dash.cloudflare.com/sign-up/workers

1. Create an API token from the "Edit Cloudflare Workers" template on
https://dash.cloudflare.com/profile/api-tokens

1. Export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the shell you
use `wrangler`

1. Create a PAGES , a PAGE_INDEX KV and an USER namespace through wrangler:
https://developers.cloudflare.com/workers/wrangler/cli-wrangler/commands/#kv

1. Edit [wrangler.toml](./wrangler.toml) to insert your KV space ids

## Running

`wrangler dev`

## Publishing

`wrangler publish` will make your worker public, remember to set the
basic auth secrets.

## License

MIT, see [LICENSE](./LICENSE).

## Notes

## TODO

- [x] user auth
- [ ] change history
