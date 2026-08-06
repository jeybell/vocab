FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expo CLI가 대화형 프롬프트(업데이트 확인 등)를 띄우지 않도록
ENV CI=1
ENV EXPO_NO_TELEMETRY=1

EXPOSE 8081

CMD ["npx", "expo", "start", "--tunnel", "--port", "8081"]

