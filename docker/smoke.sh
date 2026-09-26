#!/usr/bin/env bash
# Проверка Docker-версии: собрать, поднять и убедиться, что сайт, API заявок
# и админка работают. Запускается в CI (.github/workflows/docker.yml), можно
# и руками на сервере после восстановления.
#
#   docker/smoke.sh          собрать, поднять, проверить
#   docker/smoke.sh check    только проверить уже запущенное
set -euo pipefail
cd "$(dirname "$0")/.."

BASE=http://127.0.0.1:${APP_PORT:-3104}
SITE=${SITE_URL:-https://www.ascora.education}
CI_PASSWORD=ci-admin-password-123
CI_MARK="# создан docker/smoke.sh — тестовые секреты"
FAIL=0

if [ "${1:-}" != check ]; then
  if [ ! -f docker.env ]; then
    # Тестовые секреты — только для проверки, не для боевого запуска.
    { echo "$CI_MARK"; grep -v '^JWT_SECRET=' docker.env.example; echo "JWT_SECRET=$(openssl rand -hex 32)"; } > docker.env
  fi
  docker compose up -d --build
fi

for _ in $(seq 1 90); do
  curl -sf -o /dev/null "$BASE/api/health" && break
  sleep 2
done

ok() { echo "  ✓ $*"; }
bad() { echo "  ✗ $*"; FAIL=1; }
expect() { # expect <код> <путь> [curl-аргументы…]
  local want=$1 path=$2; shift 2
  local got; got=$(curl -s -o /dev/null -w '%{http_code}' "$@" "$BASE$path")
  [ "$got" = "$want" ] && ok "$path → $got" || bad "$path → $got (ожидалось $want)"
}

echo "ascora: $BASE"
for p in / /obuchenie-za-rubezhom /letnie-lagerya-za-rubezhom /leto-lager-v-turcii /robots.txt /sitemap.xml /llms.txt /api/health; do
  expect 200 "$p"
done
# Пререндеренные страницы отдаются как есть, без редиректа на адрес со слешем.
grep -q "<link rel=\"canonical\" href=\"$SITE/leto-lager-v-turcii\"" <<<"$(curl -s "$BASE/leto-lager-v-turcii")" \
  && ok "canonical Антальи = $SITE/leto-lager-v-turcii" || bad "у /leto-lager-v-turcii не тот canonical"
expect 404 /api/no-such-route
expect 201 /api/inquiries -X POST -H 'Content-Type: application/json' \
  -H "X-Forwarded-For: 198.51.100.$((RANDOM % 250))" \
  --data '{"name":"Проверка Докер","phone":"+7 701 555 44 33","lang":"ru","camp_name":"Анталья","camp_price":890000}'

if [ -n "${SMOKE_ADMIN_PASSWORD:-}" ] || grep -qx "$CI_MARK" docker.env; then
  # Админа создаёт тот же скрипт, что на боевом сервере (повторный вызов безопасен).
  [ -n "${SMOKE_ADMIN_PASSWORD:-}" ] || docker compose exec -T app node server/change-password.js "$CI_PASSWORD" >/dev/null
  TOKEN=$(curl -s -X POST "$BASE/api/admin/login" -H 'Content-Type: application/json' \
    -H "X-Forwarded-For: 203.0.113.$((RANDOM % 250))" \
    --data "{\"username\":\"admin\",\"password\":\"${SMOKE_ADMIN_PASSWORD:-$CI_PASSWORD}\"}" | sed -nE 's/.*"token":"([^"]+)".*/\1/p')
  [ -n "$TOKEN" ] && ok "вход в админку" || bad "вход в админку не удался"
  grep -q 'Проверка Докер' <<<"$(curl -s "$BASE/api/admin/inquiries" -H "Authorization: Bearer $TOKEN")" \
    && ok "заявка видна в админке" || bad "заявки нет в списке"
fi

if [ "$FAIL" -ne 0 ]; then
  docker compose ps -a
  docker compose logs --tail 80
  exit 1
fi
echo "ascora: всё работает"
