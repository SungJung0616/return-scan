# CLAUDE.md — Return Scan App (GPS Logix)

## 프로젝트 개요
3PL 풀필먼트 회사(GPS Logix)에서 리턴 상품을 빠르게 처리하기 위한 모바일 웹앱.
핸드폰 카메라로 바코드/텍스트를 스캔해서 구글 시트에 자동으로 데이터를 기록한다.

## 관계자
- **Brand501** — 고객사
- **Acrossb** — 주문 취합 및 계정 관리 서비스 (워크패드 운영)
- **GPS Logix** — 우리 회사, 3PL 풀필먼트 담당 (이 앱 개발 주체)

## 핵심 워크플로우
1. 리턴 패키지의 트래킹 번호 스캔 (바코드 스캔)
2. 내품 상품의 UPC 바코드 스캔 → SKU 자동 매핑
3. 상품 하단의 EXP(유통기한) / Lot 번호 촬영 → OCR로 자동 입력
4. 상태 선택: `양품 재포장 가능` / `박스 데미지` / `폐기`
5. 같은 트래킹 번호 내 SKU 여러 개 연달아 입력 가능s
6. 입력 완료 후 전체 서머리 확인
7. 구글 시트에 자동 전송

## 기술 스택
- **Frontend**: 모바일 웹앱 (HTML / Vanilla JS) — 앱 설치 없이 브라우저에서 실행
- **Backend**: Node.js + Express
- **바코드 스캔**: ZXing.js 또는 QuaggaJS (브라우저 내장 카메라 API 사용)
- **OCR** (EXP/Lot 읽기): Tesseract.js (오프라인 가능) 또는 Google Vision API
- **데이터 저장**: Google Sheets API (v4)
- **향후 확장 가능**: MongoDB 또는 PostgreSQL

## 구글 시트 컬럼 구조
| 트래킹 번호 | SKU 번호 | Lot 번호 | EXP | 상태 | 입력 시각 |

## 코딩 규칙
- 언어: JavaScript (Node.js 백엔드, Vanilla JS 프론트)
- 변수명/함수명: camelCase
- 주석: 한국어로 작성
- 에러 처리: 모든 async 함수에 try/catch 필수
- 모바일 우선 UI (Mobile First)
- 카메라 권한 요청 실패 시 수동 입력 fallback 항상 제공

## 우선순위
1. 바코드 스캔 정확도와 속도 (시간이 돈)
2. 구글 시트 전송 안정성 (데이터 유실 금지)
3. UI 단순함 (현장 작업자가 빠르게 쓸 수 있어야 함)

## 향후 고려사항 (지금 당장 개발 안 해도 됨)
- Acrossb DB에 리턴 번호 필드 추가 요청 → 오더 번호와 리턴 데이터 교집합
- 고객(Brand501)이 반품 실제 발송 여부 더블체킹 기능
- MongoDB 또는 PostgreSQL로 자체 DB 전환
