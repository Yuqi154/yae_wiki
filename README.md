# Edge Wiki

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

1. Create a PAGES and a PAGE_INDEX KV namespace through wrangler:
https://developers.cloudflare.com/workers/wrangler/cli-wrangler/commands/#kv

1. Edit [wrangler.toml](./wrangler.toml) to insert your KV space ids

1. Set basic auth username and password through the secrets
`BASICAUTH_USERNAME` and `BASICAUTH_PASSWORD`:
https://developers.cloudflare.com/workers/wrangler/commands/#secret

## Running

`npm run start-worker`

## Publishing

`npm run publish-worker` will make your worker public, remember to set the
basic auth secrets.

## License

MIT, see [LICENSE](./LICENSE).

## Notes

(as of 2022-05-28) `wrangler` has a transitive dependency on a vulnerable
version of `dicer`, it's been bumped in `miniflare`
https://github.com/cloudflare/miniflare/pull/269 so should soon be fixed in
`wrangler` I assume.

## TODO

- [x] basic auth
- [ ] oidc auth
