# 앱(Expo Go) 배포용 이미지.
# 브라우저 접속용 웹은 Dockerfile.web 을 사용합니다.
FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Expo CLI가 대화형 프롬프트(업데이트 확인 등)를 띄우지 않도록
ENV CI=1
ENV EXPO_NO_TELEMETRY=1

EXPOSE 8081

# --tunnel 대신 포트를 직접 열어 고정 주소(exp://<서버IP>:8081)를 사용합니다.
# 터널은 재시작할 때마다 서브도메인이 새로 발급되어 이전 QR/링크가 모두 죽습니다.
#
# Expo Go에 알려줄 주소는 컨테이너 내부 IP가 아니라 서버 공인 IP여야 하므로,
# 실행할 때 REACT_NATIVE_PACKAGER_HOSTNAME 으로 넘겨줍니다. (README 참고)
CMD ["npx", "expo", "start", "--host", "lan", "--port", "8081", "--no-dev", "--minify"]
