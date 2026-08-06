FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# expo start --tunnel 에 필요한 패키지를 미리 설치해서
# 런타임에 설치 여부를 묻는 프롬프트가 뜨지 않도록 함
RUN npm install -g @expo/ngrok@^4.1.0

# Expo CLI가 대화형 프롬프트(업데이트 확인 등)를 띄우지 않도록
ENV CI=1
ENV EXPO_NO_TELEMETRY=1

EXPOSE 8081

CMD ["npx", "expo", "start", "--tunnel", "--port", "8081", "--no-dev", "--minify"]
