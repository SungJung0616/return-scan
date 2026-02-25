# GPS Logix — Return Scan App

## 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행 (로컬 테스트)
npm run dev

# 3. 브라우저에서 열기
# → http://localhost:5173
# → 핸드폰에서 접속: http://[내 IP]:5173

# 4. 프로덕션 빌드 (GitHub Pages 배포용)
npm run build
# → dist/ 폴더 생성됨 → GitHub Pages에 업로드
```

## 프로젝트 구조

```
src/
├── main.jsx              ← 앱 진입점
├── App.jsx               ← 전체 상태 관리 + 라우팅
├── styles/
│   └── global.css        ← 공통 스타일
├── hooks/
│   ├── useToast.js       ← 토스트 알림 훅
│   └── useSettings.js    ← 설정 저장/불러오기 훅
├── components/
│   ├── Header.jsx        ← 상단 헤더
│   ├── ProgressBar.jsx   ← 단계 진행 바
│   ├── BarcodeScanner.jsx ← ZXing 바코드 스캐너
│   ├── Toast.jsx         ← 알림 메시지
│   ├── SettingsModal.jsx ← 설정 모달
│   └── SKUList.jsx       ← 추가된 SKU 목록
└── steps/
    ├── StepTracking.jsx  ← Step 1: 트래킹 번호
    ├── StepUPC.jsx       ← Step 2: UPC 스캔 + SKU 매핑
    ├── StepOCR.jsx       ← Step 3: EXP/Lot OCR
    ├── StepStatus.jsx    ← Step 4: 상태 선택
    └── StepSummary.jsx   ← 서머리 + 구글 시트 전송
```

## Google Apps Script 설정

1. Google Sheets 열기 → 확장 프로그램 → Apps Script
2. 아래 코드 붙여넣기:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  data.items.forEach(item => {
    sheet.appendRow([
      item.trackingNo,
      item.sku,
      item.lot,
      item.exp,
      item.status,
      item.timestamp
    ]);
  });

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 배포 → 새 배포 → 웹 앱 → 액세스: 모든 사용자 → 배포
4. 생성된 URL을 앱 설정(⚙)에 붙여넣기
