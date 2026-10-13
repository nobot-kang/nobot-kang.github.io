# 파파펭귄

[공개 사이트](https://nobot-kang.github.io/) · [오류·의견](https://github.com/nobot-kang/nobot-kang.github.io/issues) · [개인정보처리방침](https://nobot-kang.github.io/privacy/)

첫 집과 갈아타기를 고민하는 독자를 위한 부동산 데이터 노트입니다.
이 저장소는 **검증된 정적 산출물**을 보관합니다. 저작 원본, Python 공통
템플릿, 집계 검증은 비공개 작업 저장소에서 관리합니다. Jekyll은 사용하지
않으며, `.nojekyll`을 포함한 산출물을 GitHub Pages에 배포합니다.
개별 거래, 단지 식별자, 원시 데이터, 비공개 검토 기록은 포함하지 않습니다.

## 구조와 미리보기

- `index.html`, `topics/`, `series/`, `posts/`: 홈, 주제별 전체 글 목록, 주제별 시리즈와 게시물.
- `privacy/`, `license/`, `404.html`: 개인정보 안내와 없는 주소의 복귀 화면.
- `assets/`: 공통 스타일·광고/분석 스크립트, 그림, 공개 집계 JSON.
- `ads.txt`, `robots.txt`, `sitemap.xml`, 아이콘: 광고·검색·브라우저 자산.
- `games.json`: 별도 저장소에서 운영하는 게임의 공개 목록. 홈 링크·사이트맵 검증에 함께 사용합니다.
- `feed.xml`: 모든 글의 Atom 피드(발행일 역순). `llms.txt`: 답변 엔진·AI 도우미용 사이트 지도(llmstxt.org 형식). 둘 다 글 목록에서 자동 생성합니다.
- `public-files.json`: 실제 Pages 배포 허용 목록.
- `tools/check.py`, `.github/workflows/check.yml`: 링크·JSON·정책·HTML 검사와 배포.

Python 3.13 이상에서 `python -m http.server 8766 --bind 127.0.0.1`로 열고
`http://127.0.0.1:8766/`에 접속합니다. 로컬에서는 분석·광고 요청 없이
광고 위치의 미리보기 상자만 표시합니다. `python tools/check.py`로 정적 검사를
실행할 수 있습니다. 게임은 별도 Project Pages의 운영 주소를 가리킵니다.

## 글 추가와 설정 변경

1. 비공개 원본의 `weblog/content/`에 본문을 쓰고 `pages.json`에 경로·제목·날짜·광고 위치를 등록합니다. 서가·시리즈의 관계는 `weblog/catalog.py`, 시리즈별 글 목록은 해당 카탈로그 모듈에서 관리합니다.
2. 루트 환경에서 생성기와 본문·집계·브라우저 검사를 실행합니다. 공개 집계만 승인하며 기존 경로를 유지합니다.
3. `python -m weblog.export_public <공개 저장소 체크아웃>`으로 허용된 파일만 복사하고 변경을 검토한 뒤 PR을 만듭니다. 필수 CI 통과 후 `main`에 병합하면 Pages에 배포됩니다.

메뉴·경로 안내·본문 옆 탐색·서가 목록은 `weblog/navigation.py`, 공통 페이지와 메타는 `weblog/build.py`, GA·AdSense 계정 및 슬롯은
`weblog/monetization.json`, 공통 런타임은 `weblog/scripts/integrations.js`에서
수정한 뒤 다시 내보냅니다. 생성된 HTML을 직접 수정하면 다음 빌드에서 덮어씁니다.
공개 ID는 비밀번호가 아니며, API 키나 인증 토큰은 이 저장소에 넣지 않습니다.
운영 호스트는 `nobot-kang.github.io` 한 곳이며 사용자 도메인 연결 계획은 없습니다.

### 페이지 갱신과 사이트맵

페이지의 본문·링크를 수정할 때 해당 `pages.json`의 `modified`를 실제 수정일로
갱신하고, 생성된 `sitemap.xml`도 반드시 함께 배포합니다. 재빌드만 했다는 이유로
다른 페이지의 날짜를 바꾸지 않습니다. 글의 `dateModified`와 사이트맵의 `lastmod`는
같은 값이어야 하며 CI가 일치 여부를 확인합니다.

게임 추가·수정은 비공개 원본의 `weblog/content/games.json`에서 합니다. 홈 소개,
공개 `games.json`, 사이트맵의 게임 URL이 함께 생성됩니다. 게임 파일은 별도 저장소에
그대로 둡니다. 게임의 실제 수정일을 확인하지 못했다면 `lastmod`를 넣지 않습니다.
사이트맵은 블로그의 검색 대상 페이지와 등록된 모든 게임의 진입 주소를 담습니다.
CI는 누락·중복 주소와 잘못된 날짜를 검사합니다. 배포 후 공개 `sitemap.xml`과
`robots.txt`를 확인하며, 검색엔진의 수집·색인 완료는 별도로 확인해야 합니다.

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
  `P2`는 중개·직거래 구분 필드가 제공되기 시작한 2021년 11월 이후의 기간, `land leasehold excluded`는
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

## 연간 거래금액 집계

`annual-transaction-value.json`은 서울·수집 경기의 2010~2026년 계약금액·건수와
12개 가격대 집계입니다. 2026년은 1~9월이고 `jan_sep`/`jan_jun`은 모든 해의
같은 9개월/6개월 비교입니다. `invariant`는 관측 해제·직거래를 포함하며 `strict`는
확인된 해제·직거래만 제외합니다. 필드 기재 이전의 빈칸을 정상 중개거래로 확정하지
않습니다. 금액은 만원 단위지만 1,000,000만원(100억 원)으로 반올림했습니다.
평균·비중·분해는 표시값의 파생치입니다. 서울 2025년 1~9월 `invariant` 건수 하나는
100건 단위 반올림값이며 `n_interval`을 함께 둡니다. `withheld`는 비공개,
`empty`는 관측 없음입니다. 양의 거래가 있어도 반올림 금액은 0일 수 있습니다.
총액은 명목 계약금액으로 현금 유입·잔금 지급·주택 재고가치와 다릅니다.

`annual-transaction-value-active.json`은 같은 원천·기간의 추가 설정입니다.
`active`는 관측 해제만 제외하고 직거래는 포함하며, 글 본문의 기본값입니다.
해제 필드가 없는 과거를 해제 0건으로 확정하지 않습니다. `band="all"` 행은
전체 건수와 표시 총액에서 계산한 평균을 제공하고, 가격대 행은 금액만 제공합니다.
전체 행의 `rounded_count`는 100건 단위 반올림이며 `n_rounded`와 `n_interval`을 사용합니다.
따라서 가격대의 `n=null`은 건수 미제공이며 `status="withheld"`와 구별합니다.
두 파일의 금액·평균·비중·차이는 표시값으로만 계산합니다.

## CI와 배포


PR과 `main` 푸시에 내부 링크·앵커, 이미지 경로, JSON·JSON-LD, 메타데이터,
광고 제외와 개인정보 노출 검사를 실행하고 Nu Html Checker로 HTML을 검증합니다.
고의로 깨진 링크를 삽입했을 때 검사 실패하는지도 확인합니다. 외부 링크와
게임 링크는 주 1회 별도 검사하여 일시적인 외부 장애로 PR을 막지 않습니다.

배포 소스는 GitHub Actions입니다. 검사를 통과한 `main`의 `public-files.json`
목록만 `_site/`로 모아 Pages artifact로 업로드합니다. README, 도구, 워크플로,
검토 자료는 사이트로 배포하지 않습니다. 필수 검사 이름은 `Public site checks`입니다.

## 라이선스

코드는 [MIT](LICENSE.txt), 원본 글·분석 그림·비교표는 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ko)입니다.
상업적 이용이 가능하며 출처·라이선스·변경 사실을 표시하고, 수정한 저작물 공유 시
동일조건을 적용해야 합니다. 캐릭터·로고·캐릭터가 포함된 공유 카드와 아이콘은
**All rights reserved**로 제외됩니다. 원자료와 단순 사실·수치의 권리를 새로
제한하지 않습니다. 이전 배포본의 기부여 허락을 소급 철회하지 않습니다.
자세한 자산별 범위는 [이용 조건](https://nobot-kang.github.io/license/)에서 확인합니다.

## 통계의 함정 강의

[시리즈 목차](https://nobot-kang.github.io/series/statistics-traps/)에서 평균·중앙값, 집계의 재집계, 세대수·면적 가중, 변화율과 용어를 배웁니다. 실제 수치는 기존 `assets/series-followups.json`의 두 지역·두 평형군·두 계약월 집계를 재사용합니다. 세대수 가중 설명의 수치는 가상 예시입니다. `stats-*.svg`와 `stats-*.png`는 seaborn으로 만든 강의 그림이며 모바일용 SVG를 별도로 제공합니다.

## 서울 아파트 자료

`assets/seoul-apartments.json` v2 contains 2025–2026 Q1 Seoul aggregates, not individual trades.
`quarterly` holds year-quarter × region counts and amounts. `group_names` maps
internal A/B/C/D keys to 강남3구/마용성/노도강/금관구; `groups` names constituent districts.
`monthly` holds month × five right-closed price bands. `period_bands` and
`period_regions` hold the five complete 2025 policy windows plus a separate 2026 Q1
follow-up. Inclusive dates and day counts are defined in `periods`.
`n` is eligible contract count; `amount` is contract value in 만원. `audit` separates
2025 and 2026-Q1 before/after admission counts. Minimum support is 10 per cell.
The unnumbered `series/seoul-apartments/` category links three articles. Six figures
have mobile SVG variants and PNG metadata images. Monthly charts retain all twelve
2025 months on one axis; the 2026 follow-up is reported separately. The four-region
share figure uses only those twelve districts, while the Seoul-wide share figure
retains all 25. These comparisons do not estimate causal policy effects, actual
loan amounts, cash inflows or time-to-sale.

### 평균과 거래 구성 사례

`assets/seoul-mix.json` (`seoul_mix_v1`) is a separate admitted teaching example:
Nowon, December 2025 and January 2026, all exclusive areas, same eligibility and
October 4 snapshot as the Seoul series. `cells` has ten legal-dong/month aggregates;
`totals` has two pooled aggregates. `n` counts contracts; `amount` sums 만원;
`q25`, `median`, `q75` are transaction price quantiles in 만원, not uncertainty bounds;
`mean_area_m2` averages exclusive square metres. `synthetic` holds explicitly fictitious
two-dong counts and mean amounts. Never treat those rows as observed Seoul transactions.
`search` records the post-hoc example search over adjacent 2025–2026 Q1 months/quarters,
with minimum 10 trades per dong/period and identical observed dong sets in both periods.
`seoul-mix-*` figures distinguish the hypothetical reversal, actual dong mean changes,
and descriptive fixed-composition calculation. No individual transactions are published.

### 사용승인 연대별 면적 구성

`assets/completion-era.json` (`completion_era_limited_v1`) contains six current
inventory aggregates: Seoul / collected Gyeonggi × 1990s / 2010s / 2020 onward.
`households` is the measured household denominator; `small`, `mid`, `large` count
exclusive areas ≤60, (60,85], >85㎡. The separate `84` count covers [84,85)㎡ and
overlaps `mid`. Ratios are 100 × count / households. One preidentified complex
is excluded under the recorded population rule. These are surviving connected
inventory, not transactions, historical original supply, a probability sample
or a causal estimate. The article explains the restriction and missing coverage.
`completion-era*.svg` and `.png` visualize only these admitted aggregates.

### 직거래와 두 비교가격

`assets/direct-sale-comparison.json` (`direct_sale_comparison_fields_v1`) covers
2021.11–2026.6, current Seoul25 and collected Gyeonggi36. `panel_a` contains contract
percent gaps against retrospective prior-Thursday own-type model prices; `panel_b`
contains percent gaps against actual same-complex/type/quarter/floor-group broker
unit-price medians. `composition` applies common direct-count weights to A category
means. All prices require40 trades and ten complexes. Quantiles describe distributions,
not confidence intervals. B arithmetic means and exact complex/control counts are absent.

`status` distinguishes supported, insufficient support and joint-count protection.
`coverage_status` is separate: supported rows can retain n/prices while withholding both
coverage percentage and its population denominator. Do not fill absent fields with zero.
`regional_rates`/`monthly_rates` count explicitly flagged direct sales among all merged
reported contracts, including cancellations; their denominator differs from price
coverage. Original labels remain even when all numbers are withheld. The positive
Seoul2022 B counterexample is retained. These selected comparisons are not market-wide
discounts, causal effects, contemporary forecasts or valuations of individual homes.

`assets/high-price-thresholds.json` (`high_price_threshold_intervals_v1`) contains
2011–2025 annual nominal sale-price quantile intervals for Seoul25 and collected
Gyeonggi36, all exclusive areas and84≤area<85㎡, under two inclusion policies.
Each supported `median`/`p95`/`p99` has `lo` (inclusive) and `hi` (exclusive), in
만원, on one fixed5,000만원 grid. These are display precision intervals, not
confidence intervals or same-home returns. `n` counts contracts in the cohort.
All120cohort labels remain; six quantiles in Seoul2022 have explicit tail/bin
support reasons and no price bounds. Missing means neither zero nor no trades.
The invariant long comparison keeps cancellation/direct-sale labels; strict
excludes observed labels whose availability changes in2020/2021. Derived changes
and ratios use only displayed endpoints and outward rounding. Exact quantiles,
complex/tail/bin counts, Type1 prices and individual transactions are not provided.

`assets/published-jeonse.json` and `.csv` contain KB-published apartment monthly
ratios, sale/jeonse indices and province average prices for18quarter-end months,
2022.3–2026.6, retained2026-10-03. Rows identify2official provinces and61selected
cities/districts; Gyeonggi child coverage is not province-wide. Indices are
2026.1=100, ratios percent, average prices KRW10,000, index changes percent,
ratio changes percentage points. Null/blank means missing or not calculated;
no change crosses the2022.11reform. The full historical roster and nulls are
preserved. No private model or household/transaction support counts are included.

`assets/rent-income.json` compares monthly apartment rental contract costs with
one common KB HAI income series for 2011.1–2026.6. `scope` 11 means Seoul's 25
districts; 41 means the 36 collected Gyeonggi regions, not a province-wide tenant
survey. `p17_18`/`p25_26` are the standard 59형/84형 area groups. Each supported
row has four `costs_manwon` medians (KRW 10,000/month), rounded to 5만원, for
hypothetical annual deposit opportunity-cost rates `rates_pct` [0,2,4,6]. The
contract's rent and deposit are paired before taking each median. `ratios_pct`
uses the rounded public cost divided by that month's common `income_won`, rounded
to 0.1 percentage point. These are not actual tenants' income burdens. All 744
calendar rows remain; 53 insufficient rows have null costs/ratios, never zero.
`sensitivity` counts comparable calendar-month pairs and their ratio changes,
not contracts or pooled annual medians. Income method changes in 2017/2019 and
rental reporting changes in June 2021 limit historical comparisons. No individual
terms, IDs, exact contract counts or unrounded cost medians are supplied.

`assets/parking-era.json` describes current, connected apartment parking by canonical
construction-year group, using the selected K-apt snapshot of 2026-10-02. The 441
rows cover Seoul, collected Gyeonggi and their 61 regions, including unknown-year
and insufficient groups. Quartiles are equal-complex linear quantiles: parking per
household rounds to 0.05 spaces and underground shares to 5 percentage points.
`weighted_parking` separately weights by households and is withheld when a single
complex exceeds 20% of the observed household denominator. Ratios need at least ten
complexes; province threshold shares also suppress small nonzero parts/complements.
Coverage uses 10-percentage-point bands, lower-inclusive and upper-exclusive except
90–100 includes 100. Household coverage is conditional on known household counts;
unknown-household complex coverage is a separate field. Null does not mean zero.
There are no exact parking sums, household/complex counts, or complex IDs. Rounded
100% does not prove every space is underground. Current surviving complexes cannot
reconstruct original historical provision, parking availability, or price effects.

`assets/contract-duration.json` (`contract_duration_v1`) contains 56 reported-period
comparisons for Seoul25 and collected Gyeonggi36 apartment rentals. Main contracts
are June2021–June2026; July–September2026 is separately provisional. Periods are
positive start/end-month differences, not exact days, statutory protection or actual
occupancy. Two-digit years mean2000+YY;23 months are never corrected to24. Seven bins
uniformly combine36+ months. `eligible_n` is the cleaned cohort; `valid_n` excludes
missing/incomplete/reversed/same-month/conflicting periods. Coverage divides by the
former; period shares divide by the latter. Percentages round to0.1point; hypothetical
omission bounds use all eligible contracts and outward rounding, not confidence limits.

Area, lifecycle and year rows overlap: never sum different dimensions. Unknown
lifecycle is neither new nor unused renewal rights. `standardized` compares complete
2022–2025 years with common year/area/lifecycle groups having at least30 valid periods
in both regions, weighted by pooled valid counts. Common-sample unadjusted shares are
possible bounds from already published full counts and excluded sample sizes, not
exact common-sample shares. Excluded eligible/valid counts remain explicit. Exact
common24 counts, fine group denominators, weights and individual identifiers are absent.
Conflict, same-month, start-lag±12months and over60-month exclusions are separate
sensitivities. The main distribution retains long reported periods. The current files
contain some period values for2011 contracts; June2021 is a reporting-policy study
boundary, not a verified first publication date. These data do not identify legal
expiry dates, household moves, causal regional differences or every rental contract.

`assets/renewal-rights.json` (`renewal_rights_v1`) covers Seoul 25 districts and the
36 collected Gyeonggi regions, not all tenants or all Gyeonggi. Main observations
are June 2021–June 2026; July–September 2026 is separately provisional. The 208
ordinary comparisons retain new, marked-use renewal, unspecified-rights renewal
and unknown-type counts. `renewal_n` sums the two renewal categories. Recorded-use
percentages divide marked renewals by all classified renewals; type coverage
divides new plus renewal contracts by all eligible contracts. An unspecified right
is not confirmed nonuse; unknown contract type is not new. Different dimension
rows overlap and must not be added together. The first public quarter is June
2021 only; 2021 and 2026 annual comparisons are partial years.

Twenty policy comparisons retain recorded-use and type-coverage percentages for
exact statutory-date windows and the split around reporting's June 1, 2021 start.
The first window is July 31, 2020–July 30, 2022. Eight auxiliary comparisons shift
to whole months and retain only the recorded-use percentage. These ratio-only
windows do not expose their primitive counts. Percentages round to 0.1 point.
Missing-value assignment bounds round outward, assume marked-use values are true,
and concern observed contracts; they are not population confidence intervals.
Low early coverage, changing reporting scope, current retrospective labels and
unobserved renewals prevent inference to actual exercise rates or policy effects.
The 2023-12-29 official reporting form distinguishes exercise/nonexercise, but no
verified mapping from API blanks to its nonexercise selection is asserted. Individual
contract IDs, exact exercise histories and private historical anomaly counts are absent.

## 미분양 통계 범위 대조

`completed-unsold-scope.json`은 기존 `completed-unsold.json`과 별도의 보충자료입니다.
2022년 2월·2026년 5~7월 서울·경기 광역의 전체 미분양/공공/민간/민간 준공 후
수량8개 묶음과 네 출처 불일치 사례를 담습니다. 단위는 호이며 `null`은 미기재입니다.
`scope_rows`의 경기 코드는 도 전체로, 기존 면적 분석의 수집 경기와 범위가 다릅니다.
`discrepancies`의 배열 순서는 `discrepancy_order`를 따릅니다. KB 결측·구성합 불일치를
원표로 덮어쓰지 않았습니다. 보유 개정본 대조이며 과거 첫 발표본을 복원하지 않았고,
이 보충자료에 새로운 사적 거래·재고 수나 주택/거래 연결은 없습니다.

## 전월세 신고제 전후 관측 비교

`rental-reporting-cells.json`은 2011.1~2026.9 서울 25구·수집 경기 36지역의
아파트 유효 계약 건수입니다. `monthly`의 전세·월세 합계와 신규·갱신·미기재 합계는
같은 분모입니다. `recorded_pct`는 미기재를 포함한 전체 중 신규+갱신의 비율입니다.
`yearly_types`는 완결 연도와 2026 상반기/7~9월을 분리하고, `same_season`은 매년
6~12월, `yoy`는 2019~2023의 같은 달 전년비입니다. 7~9월은 잠정치입니다.
가격·개별 계약·아파트 식별자·정확 제외 수는 없습니다. 표시 비율은 공개 건수만으로
계산하며 신고율·임차 가구 비율·신고제의 인과효과로 바꾸어 읽지 않습니다.
전체 표와 두 도표는 이 파일의 값만 사용합니다. 과거 계약월의 기재는 현재 제공본의
정보이며 당시 최초 발표 시점까지 복원한 것은 아닙니다.
