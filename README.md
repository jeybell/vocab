# 정의쌤 단어장 (Expo)

Day01~05, 499단어 플래시카드/퀴즈/오답노트 앱.

## 실행

```bash
npm install
npx expo start
```

터미널에 뜨는 QR코드를 iPhone 카메라 앱으로 스캔하면 Expo Go 앱이 열리며 바로 실행됩니다.
(App Store에서 "Expo Go" 먼저 설치 필요)

## 폴더 구조

```
App.js                  # 화면 전환 상태 관리 루트
src/data/words.js       # Day01~05 단어 데이터 (499개)
src/screens/            # Home / Flashcard / Quiz / Review 화면
src/components/         # TopBar, DayTab, Stamp(채점 스탬프), SessionSummary
src/utils/               # shuffle, 퀴즈 보기 생성(동의어 중복 방지)
src/storage.js          # AsyncStorage 기반 오답노트 저장
src/theme.js            # 색상 / 폰트 토큰
```

## 오답노트 저장 방식

`@react-native-async-storage/async-storage`로 기기 로컬에 저장됩니다.
앱을 지우면 초기화되고, 클라우드 동기화는 안 됩니다. 필요하면 나중에 Supabase 등으로 교체 가능.

## 다른 사람과 공유하기

- **가장 쉬운 방법**: `npx expo start` 후 뜨는 QR/링크를 그대로 전달 → 상대방이 Expo Go 앱만 있으면 바로 실행 (빌드/배포 불필요)
- **TestFlight(iOS)**: Apple Developer 계정 필요. `npx eas build --platform ios` → EAS Submit → TestFlight 링크로 최대 100명 배포
- **APK(Android)**: `npx eas build --platform android` 로 만든 APK 파일을 그냥 전달하면 스토어 없이도 설치 가능

## 참고

- 폰트는 별도 설치 없이 iOS(Georgia/Menlo)·Android(serif/monospace) 내장 서체를 사용합니다.
- 단어 데이터는 정의쌤 블로그 자료를 개인 학습용으로 정리한 것입니다. 앱을 여러 사람에게 배포하는 단계로 간다면 원저작자 콘텐츠 사용 범위를 확인해두는 게 안전합니다.
