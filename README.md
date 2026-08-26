# 단어장 (Expo)

Day 1~10, 999단어 플래시카드/퀴즈/오답노트 앱.

## 기능

- **플래시카드**: 단어 → 뜻 뒤집어 보기, "알아요 / 다시 볼래요"로 채점
- **퀴즈**: 영 → 한 4지선다 (같은 Day 안에서 우선 보기 생성, 동의어 중복 방지)
- **오답노트**: 틀린 단어만 모아서 다시 학습
- **이어서 학습하기**: 진행 중이던 세션을 앱을 껐다 켜도 이어서 진행
- **학습 기록**: 완료한 세션별 점수 보기 (최대 200개 보관)
- **어원 정보**: 999단어 중 595단어에 어원 풀이 수록
- **발음 듣기**: 플래시카드·퀴즈에서 스피커 버튼으로 단어 발음 재생 (`expo-speech` 기반 TTS)

앱(Expo Go)과 웹 브라우저 양쪽에서 같은 코드로 동작합니다.

## 실행 (로컬 개발)

```bash
npm install
npx expo start          # 앱 (Expo Go)
npx expo start --web    # 웹 브라우저
```

앱은 터미널에 뜨는 QR코드를 iPhone 카메라 앱으로 스캔하면 Expo Go 앱이 열리며 바로 실행됩니다.
(App Store에서 "Expo Go" 먼저 설치 필요)

## 폴더 구조

```
App.js                  # 화면 전환 · 세션 상태 관리 루트
src/data/words.js       # Day 1~10 단어 데이터 (999개) + WORDS_BY_ID 조회 맵
src/screens/            # Home / Flashcard / Quiz / Review / History 화면
src/components/         # TopBar, DayTab, Stamp(채점 스탬프), SessionSummary, SpeakButton
src/utils/              # shuffle, 퀴즈 보기 생성(동의어 중복 방지), 발음 텍스트 정리
src/storage.js          # AsyncStorage 기반 오답노트 · 진행중 세션 · 학습 기록 저장
src/theme.js            # 색상 / 폰트 토큰
```

## 저장 방식

`@react-native-async-storage/async-storage`로 기기 로컬에 저장됩니다. 저장되는 항목은 3가지입니다.

| 키 | 내용 |
| --- | --- |
| `vocab.wrongWords` | 오답노트 (틀린 단어 id 목록) |
| `vocab.activeSession` | 진행 중인 세션 (이어서 학습하기용) |
| `vocab.history` | 완료한 학습 기록 (최대 200개) |

앱에서는 기기 로컬에, 웹에서는 브라우저의 localStorage에 저장됩니다. 계정 개념이 없으므로 **접속자마다 자기 기기·브라우저에만 진도가 쌓입니다.** 기기나 브라우저를 바꾸면 진도가 이어지지 않고, 앱을 지우거나 브라우저 데이터를 삭제하면 초기화됩니다.

기기 간 동기화가 필요해지면 백엔드(Supabase 등)와 로그인을 붙여야 합니다.

## 웹 배포 (브라우저 접속)

정적 파일로 빌드해 nginx로 서빙하면 Expo Go 설치 없이 브라우저 주소만으로 접속할 수 있습니다. cloudflared 터널을 붙이면 **재기동해도 주소가 바뀌지 않습니다** (앱 배포의 Expo 터널은 재시작할 때마다 서브도메인이 새로 발급됩니다).

### 로컬에서 확인

```bash
npx expo export --platform web && npx serve dist
```

`dist/` 는 빌드 산출물이라 git에 커밋하지 않습니다 (`.gitignore` 포함).

### 서버 배포

빌드와 서빙을 한 이미지로 묶어두었습니다 (`Dockerfile.web`: node로 번들 빌드 → nginx로 서빙).

```bash
git -C ~/vocab pull origin main
docker build -f ~/vocab/Dockerfile.web -t vocab-web ~/vocab
docker rm -f vocab-web 2>/dev/null

# cloudflared와 같은 네트워크에 두어야 터널이 컨테이너 이름으로 접근할 수 있습니다.
docker network create vocab-net 2>/dev/null
docker run -d --name vocab-web --restart unless-stopped --network vocab-net vocab-web

curl -s -o /dev/null -w '%{http_code}\n' http://localhost:80   # 컨테이너 내부 확인용
```

### cloudflared 연결

터널을 `vocab-web` 컨테이너와 같은 네트워크에 붙이고, 공개 호스트명의 서비스를 **`http://vocab-web:80`** 으로 지정합니다.

```bash
docker network connect vocab-net <cloudflared-컨테이너명>
```

라우팅 설정 위치는 터널 운영 방식에 따라 다릅니다.

- **토큰 방식** (`cloudflared tunnel run --token ...`): Cloudflare Zero Trust 대시보드의 해당 터널 → Public Hostname 에서 `서비스 = http://vocab-web:80` 으로 추가
- **설정 파일 방식** (`config.yml`): `ingress` 에 항목 추가 후 터널 재시작

```yaml
ingress:
  - hostname: vocab.example.com
    service: http://vocab-web:80
  - service: http_status:404      # 마지막 catch-all 규칙은 항상 유지
```

### 재배포

코드가 갱신되면 이미지를 다시 빌드해 컨테이너만 교체하면 됩니다. 도메인은 그대로 유지됩니다.

```bash
git -C ~/vocab pull origin main
docker build -f ~/vocab/Dockerfile.web -t vocab-web ~/vocab
docker rm -f vocab-web
docker run -d --name vocab-web --restart unless-stopped --network vocab-net vocab-web
```

### 웹에서의 동작 참고

- 저장은 브라우저 localStorage를 사용합니다 (위 "저장 방식" 참고).
- 발음 듣기는 브라우저의 Web Speech API로 동작하며, 음성 지원 범위는 브라우저마다 다릅니다.
- 애니메이션은 웹에 네이티브 드라이버가 없어 JS 기반으로 동작합니다 (`Platform.OS`로 분기 처리되어 있음).
- favicon은 설정하지 않아 브라우저가 `/favicon.ico`를 404로 받습니다. 동작에는 영향이 없으며, 필요하면 `app.json`의 `web.favicon`에 이미지를 지정하면 됩니다.

## 앱 배포 (OCI 상시 운영)

OCI 인스턴스에서 Docker 컨테이너로 `expo start --tunnel`을 상시 띄워두고, Expo Go에서 터널 URL로 접속하는 방식입니다. 서버의 저장소 경로는 `~/vocab`, 컨테이너 이름은 `vocab-app` 입니다.

### 배포 (코드 갱신 후 재기동)

```bash
ssh ubuntu@<서버-IP>

git -C ~/vocab pull origin main
docker build -t vocab-app ~/vocab
docker stop vocab-app && docker rm vocab-app
docker run -d --name vocab-app --restart unless-stopped vocab-app
docker logs -f vocab-app     # Tunnel ready 확인 후 Ctrl+C (컨테이너는 계속 실행됨)
```

`Tunnel connected.` / `Tunnel ready.` 가 뜨면 정상 기동입니다.

### 접속 URL 확인

컨테이너가 `CI=1` 환경에서 실행되므로 로그에 QR코드나 URL이 출력되지 않습니다. 대신 ngrok 관리 API로 조회합니다.

```bash
docker exec vocab-app curl -s http://127.0.0.1:4040/api/tunnels
```

응답 JSON의 `public_url` (예: `https://xxxxxxx-anonymous-8081.exp.direct`) 이 접속 주소입니다.

- **Expo Go 접속**: 앱에서 "Enter URL manually" 선택 → `exp://xxxxxxx-anonymous-8081.exp.direct` 입력
  (연결이 안 되면 `:443` 을 뒤에 붙여서 시도)
- **QR로 공유**: `https://...` 주소를 QR 생성기에 넣어 이미지로 만들어 전달

> 터널 서브도메인은 컨테이너를 재시작할 때마다 새로 발급되므로, 재기동 후에는 URL을 다시 확인해서 공유해야 합니다.

### 참고

- 컨테이너는 호스트 포트를 퍼블리시하지 않습니다 (터널로만 외부 접근). `docker run` 에 `-p` 옵션이 없는 것이 정상입니다.
- `docker-compose.snippet.yml` 은 compose로 운영할 경우를 위한 참고용 예시이며, 현재 서버는 위의 `docker build` / `docker run` 방식으로 운영 중입니다.

## 다른 사람과 공유하기

- **웹 주소 전달**: 위 웹 배포로 올린 주소를 전달 → 앱 설치 없이 브라우저에서 바로 실행 (가장 간단)
- **Expo Go 터널 URL 전달**: 상시 떠 있는 터널 URL을 전달 → 상대방이 Expo Go 앱만 있으면 실행 (재기동 시 주소 변경됨)
- **로컬에서 임시 공유**: `npx expo start` 후 뜨는 QR/링크를 그대로 전달 (빌드/배포 불필요)
- **TestFlight(iOS)**: Apple Developer 계정 필요. `npx eas build --platform ios` → EAS Submit → TestFlight 링크로 최대 100명 배포
- **APK(Android)**: `npx eas build --platform android` 로 만든 APK 파일을 그냥 전달하면 스토어 없이도 설치 가능

## 참고

- 폰트는 별도 설치 없이 iOS(Georgia/Menlo)·Android(serif/monospace) 내장 서체를 사용합니다.
- 단어 데이터는 정의쌤 블로그 자료를 개인 학습용으로 정리한 것입니다. 앱을 여러 사람에게 배포하는 단계로 간다면 원저작자 콘텐츠 사용 범위를 확인해두는 게 안전합니다.
