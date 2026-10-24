# 회의 미터기

회의에 드는 비용을 택시 미터기처럼 실시간으로 보여주는 앱. 서버 없이 브라우저 안에서만 동작한다.

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm test         # 테스트
npm run lint
```

## 웹 배포

[Vercel](https://vercel.com)에 GitHub 저장소를 연결해 배포한다. `main`에 push하면 운영 주소에, 다른 브랜치는 미리보기 주소에 자동으로 배포된다.

처음 연결할 때: Add New → Project → 이 저장소 Import. Framework Preset은 Vite, 빌드 명령 `npm run build`, 출력 폴더 `dist`(자동으로 채워진다).

`dist/`는 상대 경로로 된 정적 파일이라 다른 정적 호스팅(Netlify, Cloudflare Pages 등)에도 그대로 올릴 수 있다. 화면 꺼짐 방지와 이미지 복사는 HTTPS에서만 동작한다.

## 크롬 확장 (사이드 패널)

툴바 아이콘을 누르면 브라우저 옆 사이드 패널에 미터기가 열린다. 확장 전용 파일은 [extension/](extension/)에 있고, 버전은 `package.json`의 `version`을 따른다.

```bash
npm run build:ext   # dist-extension/ 생성
npm run zip:ext     # meeting-meter-extension.zip 생성 (웹 스토어 업로드용)
```

로컬에서 써보기: `chrome://extensions` → 개발자 모드 → "압축해제된 확장 프로그램을 로드합니다" → `dist-extension` 선택.

웹 스토어에 올리기: [개발자 대시보드](https://chrome.google.com/webstore/devconsole)에 등록(1회 5달러)하고 zip을 업로드한다. 스크린샷(1280×800), 설명, 개인정보처리방침(수집하는 데이터 없음)이 필요하다. 새 버전을 올릴 때는 `package.json`의 `version`을 올린다.
