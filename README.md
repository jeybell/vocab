# 단어장 (Expo)

Day 1~10, 999단어 플래시카드/퀴즈/오답노트 앱.

## 기능

- **플래시카드**: 단어 → 뜻 뒤집어 보기, "알아요 / 다시 볼래요"로 채점
- **퀴즈**: 영 → 한 4지선다 (같은 Day 안에서 우선 보기 생성, 동의어 중복 방지)
- **오답노트**: 틀린 단어만 모아서 다시 학습
- **이어서 학습하기**: 진행 중이던 세션을 앱을 껐다 켜도 이어서 진행
- **학습 기록**: 완료한 세션별 점수 보기 (최대 200개 보관)
- **어원 정보**: 999단어 중 595단어에 어원 풀이 수록

## 실행 (로컬 개발)

```bash
npm install
npx expo start
```

터미널에 뜨는 QR코드를 iPhone 카메라 앱으로 스캔하면 Expo Go 앱이 열리며 바로 실행됩니다.
(App Store에서 "Expo Go" 먼저 설치 필요)

## 폴더 구조

```
App.js                  # 화면 전환 · 세션 상태 관리 루트
src/data/words.js       # Day 1~10 단어 데이터 (999개) + WORDS_BY_ID 조회 맵
src/screens/            # Home / Flashcard / Quiz / Review / History 화면
src/components/         # TopBar, DayTab, Stamp(채점 스탬프), SessionSummary
src/utils/              # shuffle, 퀴즈 보기 생성(동의어 중복 방지)
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

앱을 지우면 초기화되고, 클라우드 동기화는 안 됩니다. 필요하면 나중에 Supabase 등으로 교체 가능.

## 서버 배포 (OCI 상시 운영)

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

- **현재 방식**: 위 서버 배포로 상시 떠 있는 터널 URL을 전달 → 상대방이 Expo Go 앱만 있으면 바로 실행
- **로컬에서 임시 공유**: `npx expo start` 후 뜨는 QR/링크를 그대로 전달 (빌드/배포 불필요)
- **TestFlight(iOS)**: Apple Developer 계정 필요. `npx eas build --platform ios` → EAS Submit → TestFlight 링크로 최대 100명 배포
- **APK(Android)**: `npx eas build --platform android` 로 만든 APK 파일을 그냥 전달하면 스토어 없이도 설치 가능

## 참고

- 폰트는 별도 설치 없이 iOS(Georgia/Menlo)·Android(serif/monospace) 내장 서체를 사용합니다.
- 단어 데이터는 정의쌤 블로그 자료를 개인 학습용으로 정리한 것입니다. 앱을 여러 사람에게 배포하는 단계로 간다면 원저작자 콘텐츠 사용 범위를 확인해두는 게 안전합니다.
