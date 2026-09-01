#!/usr/bin/env bash
# 웹(브라우저)과 앱(Expo Go) 두 컨테이너를 한 번에 다시 배포합니다.
# 코드를 고친 뒤 서버에서 이 스크립트만 실행하면 됩니다.
#
#   ./deploy.sh
#
# 두 이미지를 모두 빌드한 뒤에 컨테이너를 교체하므로, 빌드가 실패하면
# 기존 컨테이너는 그대로 살아 있습니다.
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/vocab}"
WEB_PORT="${WEB_PORT:-8082}"
APP_PORT="${APP_PORT:-8081}"

# 서버 주소는 저장소에 두지 않습니다(공개 저장소). 서버의 deploy.env 에 보관하며,
# 이 파일은 .gitignore 에 있습니다. 환경변수로 직접 넘긴 값이 우선합니다.
if [ -z "${PUBLIC_HOST:-}" ] && [ -f "$REPO_DIR/deploy.env" ]; then
  # shellcheck source=/dev/null
  . "$REPO_DIR/deploy.env"
fi

# Expo Go에 알려줄 주소입니다. 컨테이너 내부 IP가 아니라 서버 공인 IP여야 합니다.
if [ -z "${PUBLIC_HOST:-}" ]; then
  echo "PUBLIC_HOST 가 설정되지 않았습니다." >&2
  echo "  ${REPO_DIR}/deploy.env 에 PUBLIC_HOST=<서버-IP> 를 넣거나," >&2
  echo "  PUBLIC_HOST=<서버-IP> ./deploy.sh 로 실행하세요." >&2
  echo "  (deploy.env.example 을 복사해서 쓰면 됩니다)" >&2
  exit 1
fi

cd "$REPO_DIR"

echo "==> 최신 코드 받기"
git pull origin main

echo "==> 웹 이미지 빌드 (Dockerfile.web)"
docker build -f Dockerfile.web -t vocab-web .

echo "==> 앱 이미지 빌드 (Dockerfile)"
docker build -t vocab-app .

echo "==> 웹 컨테이너 교체"
docker rm -f vocab-web >/dev/null 2>&1 || true
docker run -d --name vocab-web --restart unless-stopped \
  -p "${WEB_PORT}:80" \
  vocab-web >/dev/null

echo "==> 앱 컨테이너 교체"
docker rm -f vocab-app >/dev/null 2>&1 || true
docker run -d --name vocab-app --restart unless-stopped \
  -p "${APP_PORT}:8081" \
  -e "REACT_NATIVE_PACKAGER_HOSTNAME=${PUBLIC_HOST}" \
  vocab-app >/dev/null

echo "==> 확인"
failed=0

# 컨테이너 기동 직후에는 잠시 연결이 거부될 수 있어 재시도합니다.
web_code=""
for _ in $(seq 1 15); do
  web_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${WEB_PORT}" || true)"
  [ "$web_code" = "200" ] && break
  sleep 2
done

if [ "$web_code" = "200" ]; then
  echo "    웹  정상  http://${PUBLIC_HOST}:${WEB_PORT}"
else
  echo "    웹  실패 (응답: ${web_code:-없음}) — docker logs vocab-web 을 확인하세요" >&2
  failed=1
fi

# Expo 개발 서버는 번들러 기동에 시간이 걸려 HTTP 응답으로 판단하기 어렵습니다.
# 대신 기동 직후 죽는 경우를 잡기 위해, 잠시 기다렸다가 여전히 살아 있는지 봅니다.
sleep 10
if [ -n "$(docker ps -q --filter name=vocab-app --filter status=running)" ]; then
  echo "    앱  실행 중  exp://${PUBLIC_HOST}:${APP_PORT}"
else
  echo "    앱  실패 (컨테이너가 실행 중이 아님) — docker logs vocab-app 을 확인하세요" >&2
  failed=1
fi

# 확인 단계가 실패하면 스크립트도 실패로 끝냅니다.
# 그래야 자동 배포에서 "성공 = 실제로 서비스 중" 이 됩니다.
if [ "$failed" -ne 0 ]; then
  echo "==> 배포 확인 실패" >&2
  exit 1
fi

echo "==> 배포 완료"
