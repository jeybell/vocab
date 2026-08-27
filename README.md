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

Dockerfile              # 앱(Expo Go)용 이미지 — Expo 개발 서버 실행
Dockerfile.web          # 웹용 이미지 — 번들 빌드 후 nginx로 서빙
deploy.sh               # 웹·앱 두 컨테이너를 한 번에 재배포
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

정적 파일로 빌드해 nginx로 서빙합니다. Expo Go 설치 없이 브라우저 주소만으로 접속할 수 있고, **재배포해도 주소가 바뀌지 않습니다** (앱 배포의 Expo 터널은 재시작할 때마다 서브도메인이 새로 발급됩니다).

**현재 접속 주소: `http://168.110.106.156:8082`**

### 로컬에서 확인

```bash
npx expo export --platform web && npx serve dist
```

`dist/` 는 빌드 산출물이라 git에 커밋하지 않습니다 (`.gitignore` 포함).

### 서버 배포

빌드와 서빙을 한 이미지로 묶어두었습니다 (`Dockerfile.web`: node로 번들 빌드 → nginx로 서빙). 서버 호스트에는 Node.js가 없지만, 빌드가 컨테이너 안에서 이뤄지므로 설치할 필요가 없습니다.

```bash
git -C ~/vocab pull origin main
docker build -f ~/vocab/Dockerfile.web -t vocab-web ~/vocab
docker rm -f vocab-web
docker run -d --name vocab-web --restart unless-stopped -p 8082:80 vocab-web

curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8082   # 200 이어야 정상
```

### 포트 개방 (최초 1회)

OCI 인스턴스는 클라우드 방화벽이 기본으로 막고 있어, **OCI 콘솔에서 8082 포트를 열어야** 외부에서 접속됩니다.

```
콘솔 → 컴퓨트 → 인스턴스 → 기본 VNIC의 서브넷 링크
  → 보안 목록 → 수신 규칙 추가
```

| 항목 | 값 |
| --- | --- |
| 소스 CIDR | `0.0.0.0/0` |
| IP 프로토콜 | TCP |
| 대상 포트 범위 | `8082` |

> 서버 안의 `iptables` 는 건드릴 필요가 없습니다. 도커가 게시한 포트는 `INPUT` 체인을 거치지 않고 `FORWARD`/`DOCKER` 체인으로 처리되기 때문입니다. 접속이 안 될 때 서버 방화벽부터 의심하기 쉬운데, 원인은 대부분 위의 OCI 보안 목록입니다.

### 재배포

웹과 앱을 함께 운영하므로 **`deploy.sh` 하나로 두 컨테이너를 모두 갱신**합니다. 한쪽만 빌드하면 다른 쪽이 예전 코드로 남습니다.

```bash
cd ~/vocab && ./deploy.sh
```

최신 코드를 받아 두 이미지를 빌드하고 컨테이너를 교체한 뒤, 각각 정상인지 확인해 접속 주소를 출력합니다. 포트 개방은 최초 1회로 끝나므로 주소는 그대로입니다.

두 이미지를 **모두 빌드한 뒤에** 컨테이너를 교체하므로, 빌드가 실패하면 기존 컨테이너는 살아 있는 상태로 남습니다.

서버 IP나 포트가 바뀌면 환경변수로 넘길 수 있습니다.

```bash
PUBLIC_HOST=1.2.3.4 WEB_PORT=9000 ./deploy.sh
```

웹만 따로 갱신하려면 아래처럼 직접 실행해도 됩니다.

```bash
git -C ~/vocab pull origin main
docker build -f ~/vocab/Dockerfile.web -t vocab-web ~/vocab
docker rm -f vocab-web
docker run -d --name vocab-web --restart unless-stopped -p 8082:80 vocab-web
```

### 나중에 도메인을 붙인다면

도메인을 등록해 Cloudflare에 연결하면 `https://vocab.도메인` 형태의 주소를 쓸 수 있습니다. 이 경우 컨테이너를 포트 게시 대신 전용 네트워크에 두고, cloudflared 커넥터를 같은 네트워크에 붙인 뒤 공개 호스트명의 서비스를 `vocab-web:80` 으로 지정하면 됩니다.

### 웹에서의 동작 참고

- 저장은 브라우저 localStorage를 사용합니다 (위 "저장 방식" 참고).
- 발음 듣기는 브라우저의 Web Speech API로 동작하며, 음성 지원 범위는 브라우저마다 다릅니다.
- 애니메이션은 웹에 네이티브 드라이버가 없어 JS 기반으로 동작합니다 (`Platform.OS`로 분기 처리되어 있음).
- favicon은 설정하지 않아 브라우저가 `/favicon.ico`를 404로 받습니다. 동작에는 영향이 없으며, 필요하면 `app.json`의 `web.favicon`에 이미지를 지정하면 됩니다.

## 앱 배포 (OCI 상시 운영)

OCI 인스턴스에서 Docker 컨테이너로 Expo 개발 서버를 상시 띄워두고, Expo Go에서 접속하는 방식입니다. 서버의 저장소 경로는 `~/vocab`, 컨테이너 이름은 `vocab-app` 입니다.

**접속 주소: `exp://168.110.106.156:8081`** (웹과 마찬가지로 고정)

### 배포 (코드 갱신 후 재기동)

웹과 함께 갱신하려면 `./deploy.sh` 를 쓰면 됩니다 (위 "웹 배포 → 재배포" 참고). 앱만 따로 재기동하려면:

```bash
git -C ~/vocab pull origin main
docker build -t vocab-app ~/vocab
docker rm -f vocab-app
docker run -d --name vocab-app --restart unless-stopped \
  -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=168.110.106.156 \
  vocab-app

docker logs vocab-app        # "Waiting on http://localhost:8081" 이 뜨면 정상
```

`REACT_NATIVE_PACKAGER_HOSTNAME` 은 Expo가 클라이언트에게 알려줄 주소입니다. 지정하지 않으면 컨테이너 내부 IP(`172.x.x.x`)를 알려주어 접속이 되지 않습니다.

### 포트 개방 (최초 1회)

웹(8082)과 마찬가지로 OCI 보안 목록에 **8081** 수신 규칙이 필요합니다. 절차는 위 "웹 배포 → 포트 개방" 항목과 같고 대상 포트만 다릅니다.

### Expo Go 접속

- **URL 직접 입력**: Expo Go에서 "Enter URL manually" → `exp://168.110.106.156:8081`
- **iOS**: 수동 입력란이 없으면 메모장이나 Safari 주소창에 위 주소를 넣고 탭하면 딥링크로 열립니다
- **QR 공유**: 위 주소를 QR 생성기에 넣어 이미지로 만들어 전달하면 됩니다

> 예전에는 `expo start --tunnel`(ngrok)을 사용했는데, 컨테이너를 재시작할 때마다 서브도메인이 새로 발급되어 이전에 공유한 QR과 링크가 모두 `ERR_NGROK_3200` 으로 죽는 문제가 있었습니다. 포트를 직접 여는 방식으로 바꿔 주소가 고정됩니다.

### 유지보수 참고

`REACT_NATIVE_PACKAGER_HOSTNAME` 은 Expo CLI 소스에서 deprecated로 표시되어 있습니다(동작은 정상). SDK 업그레이드 후 접속이 안 되면 이 변수가 제거되었는지 먼저 확인하세요.

### 참고

- 서버에서 두 컨테이너가 각각 다른 포트로 동시에 운영됩니다: `vocab-web`(8082, 브라우저용), `vocab-app`(8081, Expo Go용).
- `docker-compose.snippet.yml` 은 compose로 운영할 경우를 위한 참고용 예시이며, 현재 서버는 위의 `docker build` / `docker run` 방식으로 운영 중입니다.

## 다른 사람과 공유하기

- **웹 주소 전달**: `http://168.110.106.156:8082` 를 전달 → 앱 설치 없이 브라우저에서 바로 실행 (가장 간단, 주소 고정)
- **Expo Go 주소 전달**: `exp://168.110.106.156:8081` 을 전달 → 상대방이 Expo Go 앱만 있으면 실행 (주소 고정)
- **로컬에서 임시 공유**: `npx expo start` 후 뜨는 QR/링크를 그대로 전달 (빌드/배포 불필요)
- **TestFlight(iOS)**: Apple Developer 계정 필요. `npx eas build --platform ios` → EAS Submit → TestFlight 링크로 최대 100명 배포
- **APK(Android)**: `npx eas build --platform android` 로 만든 APK 파일을 그냥 전달하면 스토어 없이도 설치 가능

## 참고

- 폰트는 별도 설치 없이 iOS(Georgia/Menlo)·Android(serif/monospace) 내장 서체를 사용합니다.
- 단어 데이터는 정의쌤 블로그 자료를 개인 학습용으로 정리한 것입니다. 앱을 여러 사람에게 배포하는 단계로 간다면 원저작자 콘텐츠 사용 범위를 확인해두는 게 안전합니다.
