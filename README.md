# 파파펭귄

[공개 사이트](https://nobot-kang.github.io/) · [오류·의견](https://github.com/nobot-kang/nobot-kang.github.io/issues) · [개인정보처리방침](https://nobot-kang.github.io/privacy/)

첫 집과 갈아타기를 고민하는 독자를 위한 부동산 데이터 노트입니다.
이 저장소는 **검증된 정적 산출물**을 보관합니다. 저작 원본, Python 공통
템플릿, 집계 검증은 비공개 작업 저장소에서 관리합니다. Jekyll은 사용하지
않으며, `.nojekyll`을 포함한 산출물을 GitHub Pages에 배포합니다.
개별 거래, 단지 식별자, 원시 데이터, 비공개 검토 기록은 포함하지 않습니다.

## 구조와 미리보기

- `index.html`, `series/`, `posts/`: 홈, 시리즈, 네 편의 글.
- `privacy/`, `404.html`: 개인정보 안내와 없는 주소의 복귀 화면.
- `assets/`: 공통 스타일·광고/분석 스크립트, 그림, 공개 집계 JSON.
- `ads.txt`, `robots.txt`, `sitemap.xml`, 아이콘: 광고·검색·브라우저 자산.
- `public-files.json`: 실제 Pages 배포 허용 목록.
- `tools/check.py`, `.github/workflows/check.yml`: 링크·JSON·정책·HTML 검사와 배포.

Python 3.13 이상에서 `python -m http.server 8766 --bind 127.0.0.1`로 열고
`http://127.0.0.1:8766/`에 접속합니다. 로컬에서는 분석·광고 요청 없이
광고 위치의 미리보기 상자만 표시합니다. `python tools/check.py`로 정적 검사를
실행할 수 있습니다. 게임은 별도 Project Pages의 운영 주소를 가리킵니다.

## 글 추가와 설정 변경

1. 비공개 원본의 `weblog/content/`에 본문을 쓰고 `pages.json`에 경로·제목·날짜·광고 위치를 등록합니다. 시리즈 목록은 `weblog/series.py`에서 관리합니다.
2. 루트 환경에서 생성기와 본문·집계·브라우저 검사를 실행합니다. 공개 집계만 승인하며 기존 경로를 유지합니다.
3. `python -m weblog.export_public <공개 저장소 체크아웃>`으로 허용된 파일만 복사하고 변경을 검토한 뒤 PR을 만듭니다. 필수 CI 통과 후 `main`에 병합하면 Pages에 배포됩니다.

메뉴·푸터·메타는 비공개 원본의 `weblog/build.py`, GA·AdSense 계정 및 슬롯은
`weblog/monetization.json`, 공통 런타임은 `weblog/scripts/integrations.js`에서
수정한 뒤 다시 내보냅니다. 생성된 HTML을 직접 수정하면 다음 빌드에서 덮어씁니다.
공개 ID는 비밀번호가 아니며, API 키나 인증 토큰은 이 저장소에 넣지 않습니다.
운영 호스트는 `nobot-kang.github.io` 한 곳이며 사용자 도메인 연결 계획은 없습니다.

## 광고와 개인정보

글마다 본문 중간·끝 광고 슬롯 두 개를 사용합니다. 설정된 슬롯은 HTML에서
공간을 확보합니다. 미충전·로더 실패·10초 시간 초과 시 접으며, 읽는 화면에
걸쳐 있으면 화면 밖으로 나갈 때까지 접기를 미룹니다. 개인정보처리방침과
404에서는 Auto ads 로더도 실행하지 않습니다. 로컬에서 실제 광고를 클릭하거나
노출 테스트를 하지 않습니다.

EEA·영국·스위스의 Consent Mode 기본값은 거부입니다. 인증 Google CMP의
유럽 규정 메시지와 광고·분석 Consent Mode 연동은 AdSense 계정에서 별도로
게시해야 합니다. 코드만으로 계정 승인이나 CMP 게시가 완료되지는 않습니다.
GA 데이터 보존 기간은 계정에서 확인하고 개인정보처리방침에 반영합니다.

## 공개 집계 JSON 읽기

`price-comparison.json`은 지역·월·면적군의 건수(`n`)와 매매금액 중앙값(`amount`),
`series-followups.json`은 두 달의 면적군별 `groups`, 합산 `totals`, 평균 변화의
`mix`, 거래 근거 분포 `support`를 담습니다. 금액 단위는 **만원**, 관측은
호가나 같은 주택의 가격지수가 아닌 적격 매매 신고입니다.

- `region`은 법정동코드 앞 5자리의 구 코드이며 `regions`가 이름을 제공합니다.
- `ym`/`month(s)`는 계약월입니다. `snapshot_built_date`는 분석 스냅샷 생성일,
  `snapshot_reference_end`는 보유 자료의 마지막 계약월입니다.
- `information_cutoff: null`은 최초 수집·정보 입수 시점을 복원하지 못했다는
  뜻입니다. 과거 당시에 알 수 있었던 자료만 사용했다고 해석할 수 없습니다.
- `p17_18`, `p25_26`은 전용면적을 3.3058로 나누고 0.5 이상 올림한 정수
  평형 17·18과 25·26의 묶음입니다. 정확히 59㎡·84㎡ 또는 공급면적이 아닙니다.
- `policy`의 `strict`는 식별된 해제·직거래 및 정제 부적격 관측 제외,
  `P2`는 분석용 면적·금액 품질 기준을 통과한 관측, `land leasehold excluded`는
  토지임대부 제외를 뜻합니다. 미확인 거래 상태를 모두 확인했다는 뜻은 아닙니다.
- `minimum_support: 10`은 공개 셀의 최소 거래 수입니다. `support` 구간은
  최소 10개 단지×면적군 셀과 최소 10건의 거래를 함께 만족합니다.
- `mean`, `median`은 평균·중앙값이고, `mix`는 5월 구성비 고정 항과 구성비
  변화 항으로 평균 차이를 분해합니다. 인과효과나 동일 주택 변화가 아닙니다.
- `support`의 `one`/`multiple`은 6월 적격 거래가 1건/2건 이상인 단지×면적군
  묶음입니다. `cells`는 묶음 수, `transactions`는 거래 수입니다. 무거래 묶음은
  포함하지 않으므로 전체 단지의 유동성 비율로 해석할 수 없습니다.

출처는 [국토교통부 아파트 매매 실거래가 상세 자료](https://www.data.go.kr/data/15126468/openapi.do)이며,
포털의 이용허락범위는 제한 없음입니다(2026-10-06 확인). 원자료 이용 조건과
사이트 저작물의 이용 조건은 구분합니다. 집계는 승인된 고정 스냅샷입니다.
재집계가 달라지면 자동 덮어쓰지 않고 저작 원본에서 검증·수정 이력을 남깁니다.
필드의 단순 설명 추가는 현재 schema 버전을 유지하고, 의미·단위·분모 변경은
새 버전(`v2`)과 변경 설명을 함께 제공합니다.

## CI와 배포

PR과 `main` 푸시에 내부 링크·앵커, 이미지 경로, JSON·JSON-LD, 메타데이터,
광고 제외와 개인정보 노출 검사를 실행하고 Nu Html Checker로 HTML을 검증합니다.
고의로 깨진 링크를 삽입했을 때 검사 실패하는지도 확인합니다. 외부 링크와
게임 링크는 주 1회 별도 검사하여 일시적인 외부 장애로 PR을 막지 않습니다.

배포 소스는 GitHub Actions입니다. 검사를 통과한 `main`의 `public-files.json`
목록만 `_site/`로 모아 Pages artifact로 업로드합니다. README, 도구, 워크플로,
검토 자료는 사이트로 배포하지 않습니다. 필수 검사 이름은 `Public site checks`입니다.
