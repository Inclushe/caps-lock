# CAPS LOCK

RANT OR RAVE IN A THOUSAND CHARACTERS OR LESS

## Installation

Postgres & Node
```bash
git clone
npm i
heroku create
git push heroku master
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SESSION_SECRET=$(openssl rand -hex 512)
heroku config:set SENDGRID_API_KEY=<SENDGRID KEY>
heroku run npm run migrate
```