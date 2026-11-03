#!/usr/bin/env bash
# Весь стек без Docker: одноразовый локальный PostgreSQL (с TLS, как в
# compose.yaml) + сервер в режиме production, который отдаёт собранный сайт и
# API, + docker/smoke.sh check. Только локальная база и тестовые секреты —
# никаких боевых DATABASE_URL, Google Sheets и Bitrix.
#
#   docker/local-stack.sh up      собрать сайт, поднять базу и сервер, прогнать проверки
#   docker/local-stack.sh down    остановить всё и удалить данные
#
# Нужны бинарники PostgreSQL (по умолчанию /usr/lib/postgresql/16/bin) и openssl.
# От root база запускается от пользователя postgres.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD

PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
PGPORT=${PGPORT:-54325}
APP_PORT=${APP_PORT:-3104}
PGDATA=${PGDATA:-/tmp/pgdata-ascora-stack}
RUN=${RUN_DIR:-/tmp/ascora-stack}
ADMIN_PASSWORD=local-stack-admin-pass
export JWT_SECRET=local-stack-only-secret-0123456789abcdef0123456789

as_pg() { if [ "$(id -u)" = 0 ]; then (cd /tmp && runuser -u postgres -- "$@"); else "$@"; fi; }

down() {
  [ -f "$RUN/app.pid" ] && kill "$(cat "$RUN/app.pid")" 2>/dev/null || true
  [ -d "$PGDATA" ] && as_pg "$PGBIN/pg_ctl" -D "$PGDATA" -m fast stop >/dev/null 2>&1 || true
  rm -rf "$PGDATA" "$RUN"
  echo "stack stopped, data removed"
}

[ "${1:-up}" = down ] && { down; exit 0; }

mkdir -p "$RUN" "$PGDATA"
if [ "$(id -u)" = 0 ]; then chown postgres "$PGDATA"; touch "$RUN/pg.log"; chown postgres "$RUN/pg.log"; chmod o+x "$RUN"; fi
chmod 700 "$PGDATA"

as_pg "$PGBIN/initdb" -D "$PGDATA" -A trust -E UTF8 >/dev/null
# Самоподписанный сертификат: в production сервер подключается к базе только по TLS.
openssl req -new -x509 -days 1 -nodes -subj "/CN=localhost" -newkey rsa:2048 \
  -keyout "$PGDATA/server.key" -out "$PGDATA/server.crt" 2>/dev/null
[ "$(id -u)" = 0 ] && chown postgres "$PGDATA/server.key" "$PGDATA/server.crt"
chmod 600 "$PGDATA/server.key"
as_pg "$PGBIN/pg_ctl" -D "$PGDATA" -l "$RUN/pg.log" -w \
  -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1 -c ssl=on" start </dev/null >/dev/null 2>&1
as_pg "$PGBIN/createdb" -h 127.0.0.1 -p "$PGPORT" ascora
export DATABASE_URL="postgresql://postgres@127.0.0.1:$PGPORT/ascora"

[ -d client/dist ] || (cd client && npm ci --no-audit --no-fund && npm run build)
[ -d server/node_modules ] || (cd server && npm ci --no-audit --no-fund)

(cd server && node change-password.js "$ADMIN_PASSWORD" >/dev/null)
(cd server && NODE_ENV=production PORT=$APP_PORT TRUST_PROXY=1 GOOGLE_SHEET_ID=unused \
  nohup node index.js </dev/null > "$RUN/app.log" 2>&1 & echo $! > "$RUN/app.pid")

APP_PORT=$APP_PORT SMOKE_ADMIN_PASSWORD=$ADMIN_PASSWORD docker/smoke.sh check
echo "site: http://127.0.0.1:$APP_PORT   (docker/local-stack.sh down to clean up)"
