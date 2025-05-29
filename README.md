## 📘 목차
1. [과제 개요](#1-과제-개요)  
2. [파이프라인 개요도](#2-파이프라인-개요도)  
3. [주요 링크](#3-주요-링크)  
4. [주요 개념 정리](#4-주요-개념-정리)  
5. [배포 프로세스 정리](#5-배포-프로세스-정리)  
6. [S3 → CloudFront 성능 최적화 분석 보고](#6-s3--cloudfront-성능-최적화-분석-보고)

## 1. 과제 개요

이번 4-1 과제는 GitHub와 AWS를 사용해 CDN이 적용된 프론트엔드 프로젝트 CI/CD 파이프라인을 구성합니다. 인프라 레벨 최적화, 특히 CDN을 사용한 최적화를 이해하고 성능 개선을 위한 사전 작업인 ‘모니터링’을 준비합니다.

---
## 2. 파이프라인 개요도

![파이프라인 개요도](https://raw.githubusercontent.com/unseoJang/front_5th_chapter4-1/refs/heads/main/app/assets/images/img-deploy-pipeline.jpeg)

---
## 3. 주요 링크

  - S3 버킷 웹사이트 엔드포인트: http://unseo-bucket.s3-website.ap-northeast-2.amazonaws.com/
  - CloudFrount 배포 도메인 이름: https://d2dqy6mkzzv7cu.cloudfront.net/
---
## 4. 주요 개념 정리
### GitHub Actions과 CI/CD 도구
#### ✅ 1. CI/CD 개념 먼저 정리

🧩 CI: Continuous Integration (지속적 통합)
`"개발자들이 자주 코드를 병합하고, 테스트를 자동으로 수행해 오류를 빠르게 발견하는 프로세스"`
모든 커밋마다 자동으로:
Lint 검사
Unit test
Build 여부 확인
버그를 빠르게 발견하고, 코드 품질 유지

🚀 CD: Continuous Delivery / Deployment (지속적 전달/배포)
`"코드가 자동으로 스테이징이나 프로덕션에 배포되도록 만드는 과정"`
- Delivery: 배포 준비까지 자동화 (수동 승인 필요)
- Deployment: 배포까지 완전 자동화 (버튼 한 번 누르거나, 아예 자동)

#### ✅ 2. GitHub Actions란?
GitHub에서 제공하는 CI/CD 자동화 플랫폼
`"코드를 push할 때마다 알아서 테스트, 빌드, 배포를 해주는 비서"`

💡 어떤 일들을 자동화할 수 있을까?
>	트리거(ex. Push)	실행 예시
>	git push	테스트 실행, 빌드 확인, S3 배포
>	PR 생성	코드 스타일 검사, 리뷰 요청
>	배포 브랜치 머지	Vercel / Firebase / S3로 자동 배포
>	매일 새벽 2시	cron 기반 정기 실행 가능 등등...

```yml
# .github/workflows/deploy.yml 예시
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Install deps
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --acl public-read
```
> 요약:
> "on: 언제 실행할지 (트리거)"
> "jobs: 무슨 일을 할지"
> "steps: 각 job에서 어떤 명령을 실행할지"

#### ✅ 4. 왜 GitHub Actions인가?

| 항목           | 이유                                                  |
| ------------ | --------------------------------------------------- |
| 🛠 GitHub 통합 | GitHub에 내장되어 있어 설정 간단                               |
| 💸 무료 사용 가능  | 퍼블릭 리포: 무제한, 프라이빗도 월 2천 분 제공                        |
| 🧩 생태계 풍부    | NPM publish, Docker, S3 배포, Firebase 등 다양한 공식 액션 제공 |
| 🔐 보안 관리 편리  | GitHub Secrets로 배포 토큰 등 안전하게 관리 가능                  |

#### ✅ 5. 다른 CI/CD 도구들과 비교
| 도구                 | 특징                                 |
| ------------------ | ---------------------------------- |
| **GitHub Actions** | GitHub 생태계 최적화. 설정 간단.             |
| **Jenkins**        | 강력한 커스터마이징, 자체 서버 필요               |
| **CircleCI**       | 빠르고 유연. Docker 기반.                 |
| **GitLab CI**      | GitLab 사용자에게 강력                    |
| **Travis CI**      | 예전부터 인기 있었으나 GitHub Actions에 많이 밀림 |

#### 6. 요약
> “CI는 코드를 자주 통합하고 자동 테스트해서 문제를 초기에 잡는 과정이고,
CD는 코드를 자동으로 배포까지 이어주는 과정이다.
GitHub Actions는 GitHub에 통합된 CI/CD 도구로, push만 해도 테스트부터 배포까지 자동화할 수 있다.”

#### S3와 스토리지
#### ✅ 1. 스토리지(Storage)란?
> 데이터를 저장하는 공간
> 우리가 컴퓨터에서 쓰는 SSD, 하드디스크도 일종의 스토리지

종류별로 나누면?
| 분류          | 설명                      | 예시                                  |
| ----------- | ----------------------- | ----------------------------------- |
| **블록 스토리지** | 디스크처럼 작동하는 저장소          | EBS (AWS EC2용)                      |
| **파일 스토리지** | 폴더/파일 시스템 기반 공유 저장소     | NFS, Amazon EFS                     |
| **객체 스토리지** | 파일을 "객체(Object)" 단위로 저장 | **Amazon S3**, Google Cloud Storage |

#### ✅ 2. S3란?

> Amazon Simple Storage Service
> AWS에서 제공하는 객체 스토리지 서비스로,
> 이미지, HTML, JS, 로그, 백업 등 정적 파일 저장에 최적화

핵심 특징:
| 항목               | 설명                                            |
| ---------------- | --------------------------------------------- |
| 📦 객체(Object) 저장 | 각각의 파일은 메타데이터와 함께 저장됨                         |
| 🌍 웹 접근 가능       | 파일마다 URL로 접근 가능 (`https://bucket-name.s3...`) |
| 🔄 무제한 확장        | 용량 제한 없이 확장 가능                                |
| 🔐 권한 제어         | 퍼블릭, 프라이빗, IAM 정책, 버킷 정책으로 보안 설정              |
| 💰 저렴한 요금        | 저장 용량 + 요청 수 기반 과금 (정적 파일에 유리)                |

#### ✅ 3. S3는 어디에 쓰나?
| 사용 사례            | 설명                                    |
| ---------------- | ------------------------------------- |
| **정적 웹사이트 호스팅**  | HTML/CSS/JS를 S3에 업로드하고 CloudFront와 연결 |
| **이미지/영상 저장**    | 썸네일, 프로필 이미지, 업로드 영상 등                |
| **로그/백업 저장소**    | 서버 로그, DB 백업 데이터                      |
| **모바일 앱 리소스 서버** | React Native, Flutter 앱에서 이미지 로딩용     |

#### ✅ 4. S3 작동 구조

```
[Bucket] → 폴더처럼 보이지만 실제로는 key prefix
  └── object (파일)
        └── key = 경로 + 파일명 (예: uploads/image.png)
```
- 버킷(Bucket): S3의 최상위 디렉토리. 프로젝트 단위로 관리
- 객체(Object): 파일 단위 (ex. index.html, profile.jpg)
- 키(Key): 파일의 "경로 + 이름" (ex. images/profile.jpg)

#### ✅ 5. S3 vs 일반 디스크 스토리지
| 항목       | S3 (객체 스토리지)                | 일반 디스크 (블록 스토리지)   |
| -------- | --------------------------- | ------------------ |
| 파일 접근 방식 | HTTP API (REST 기반)          | 운영체제가 직접 읽음/씀      |
| 구조       | Key-Value 형태                | 디렉토리/파일 기반         |
| 유스케이스    | 정적 파일, 백업, 웹자원              | DB 저장소, 운영체제 볼륨    |
| 장점       | 무제한 확장, 비용 효율적              | 빠른 디스크 I/O, 로컬 저장용 |
| 예시       | AWS S3, GCP GCS, Azure Blob | AWS EBS, 로컬 SSD    |

> "S3는 AWS의 객체 스토리지 서비스로, 이미지나 HTML 같은 정적 파일을 무제한 저장하고 웹으로 바로 제공할 수 있어요.
> CloudFront와 연결하면 글로벌 CDN 역할까지 하죠. 비용도 저렴해서 웹 자원 저장소로 많이 씁니다."

### CloudFront와 CDN
#### ✅ 1. CDN이란?
> Content Delivery Network의 약자
> 사용자의 지리적 위치에 가까운 서버에서 콘텐츠를 전달하는 분산형 네트워크

왜 필요할까?
- 서울에 있는 서버에서 미국 사용자가 콘텐츠를 요청하면 속도 느림
- CDN은 전 세계에 분산된 서버(엣지 서버)에 콘텐츠를 캐싱해서
→ 가까운 위치에서 빠르게 제공

📦 예를 들어:
- 이미지, JS, CSS, 폰트, 영상 같은 정적 자산
- 웹사이트 HTML 페이지

#### ✅ 2. CDN의 작동 원리
```
사용자 → 가까운 CDN 엣지 서버 → (없으면) 원본 서버에서 가져와 캐싱 → 사용자에게 응답
```
- 엣지 서버(Edge Location): 전 세계에 분산된 캐시 서버
- 오리진 서버(Origin): 원본 파일이 있는 서버 (예: S3, 웹서버)
> 📌 캐시 덕분에 빠르고, 원본 서버 부하도 줄어듬

#### ✅ 3. CloudFront란?
> AWS가 제공하는 CDN 서비스

CloudFront는 CDN의 모든 기능을 제공하며,
S3, EC2, ALB, Lambda, 외부 서버까지 어떤 오리진에도 연결 가능

#### ✅ 4. CloudFront의 주요 특징
| 기능              | 설명                           |
| --------------- | ---------------------------- |
| 🌍 전 세계 엣지 로케이션 | 400개 이상 위치에서 콘텐츠 제공          |
| ⚡ 빠른 응답         | 가까운 서버에서 제공 (저지연)            |
| 💾 캐싱           | 자주 요청되는 파일을 저장, 오리진 요청 줄임    |
| 🔐 보안           | SSL(HTTPS), WAF, OAC로 보안 강화  |
| 🚫 접근 제어        | 특정 국가 제한, 서명된 URL/S3 프라이빗 지원 |
| 🧠 사용자 맞춤       | 쿠키/쿼리 기반으로 다르게 캐싱 가능         |
| 📈 로그 및 분석      | CloudWatch, S3, 로그 추적 가능     |

#### ✅ 5. CloudFront와 S3 관계
| 항목         | 설명                                         |
| ---------- | ------------------------------------------ |
| S3         | 원본 파일 저장소 (정적 웹, 이미지 등)                    |
| CloudFront | 전 세계 사용자에게 빠르게 콘텐츠 전달하는 CDN                |
| 연결         | S3를 **오리진(origin)** 으로 지정하여 CloudFront에 연결 |
> 📌 S3 + CloudFront = 빠르고 안전한 정적 콘텐츠 배포

#### ✅ 실무 예시 흐름
1. 개발자가 S3에 웹사이트 파일 업로드
2. CloudFront 배포(distribution) 생성 후, S3를 origin으로 설정
3. CloudFront의 URL을 사용자에게 제공 (https://d123.cloudfront.net)
4. 사용자가 접속하면 → 가까운 엣지 서버에서 콘텐츠 전달

#### ✅ 자주 쓰는 용어 정리
| 용어                | 설명                      |
| ----------------- | ----------------------- |
| **Origin**        | 원본 서버 (S3, EC2 등)       |
| **Edge location** | 사용자와 가까운 캐시 서버          |
| **Distribution**  | CloudFront 설정 단위        |
| **TTL**           | 캐시 유지 시간 (Time To Live) |
| **Invalidation**  | 캐시 무효화 요청 (파일 변경 시)     |

#### ✅ 요약 정리
> CDN은 전 세계 어디서든 빠르게 콘텐츠를 전달하기 위한 네트워크이고,
CloudFront는 AWS가 제공하는 CDN 서비스입니다.
S3와 연결하면 정적 콘텐츠를 안전하고 빠르게 배포할 수 있어요.
(→ 속도 개선, 서버 부하 감소, 보안 강화까지 가능)

### 캐시 무효화(Cache Invalidation)
#### ✅ 캐시(Cache)란?
> 자주 사용하는 데이터를 임시로 저장해두는 공간.
덕분에 빠르게 응답할 수 있지만, 변경된 데이터가 반영 안 되는 문제 가 생길 수 있어요.

예:
> CloudFront 엣지 서버가 /index.html을 캐싱하고 있다면,
> 이후 S3에서 새로운 /index.html을 올려도
> 사용자에게는 여전히 옛날 캐시 버전이 보이게 됩니다.

#### ✅ Cache Invalidation(캐시 무효화)란?
> 기존에 저장된 캐시를 제거해서, 다음 요청부터는 오리진에서 새로운 콘텐츠를 가져오게 만드는 작업
즉, “야 그 파일 바뀌었어, 다시 가져와!” 라고 CDN에게 알려주는 행위예요.

#### ✅ CloudFront에서 Invalidation 하는 이유
| 이유                | 설명                                 |
| ----------------- | ---------------------------------- |
| 🔄 파일 수정 즉시 반영    | 빌드 후 새 JS/CSS 배포했는데 예전 파일 계속 로딩될 때 |
| 🧪 테스트 환경 즉시 업데이트 | QA 단계에서 변경사항 빠르게 확인                |
| ⚠️ 중요 버그 수정 반영    | 잘못된 HTML/CSS가 캐시돼 있는 경우 긴급 반영      |

#### ✅ CloudFront에서 Invalidation 하는 방법
1. AWS Console → CloudFront → 배포 선택
2. "Invalidations" 탭 → [Create invalidation]
3. 경로 입력 (예: /index.html, /static/*)
또는 AWS CLI 사용:

```bash
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXXX \
  --paths "/index.html" "/static/*"
```
#### ✅ 실무에서 자주 쓰는 패턴
| 변경 대상          | Invalidate 경로 예시              |
| -------------- | ----------------------------- |
| HTML 파일 변경     | `/index.html`                 |
| 정적 자산(JS, CSS) | `/static/*` or 버전 넘버링으로 캐싱 피함 |
| 전체 캐시 삭제       | `/*` (주의! 비용 + 시간 증가)         |

#### ⚠️ 주의사항
| 항목                | 설명                                     |
| ----------------- | -------------------------------------- |
| 💰 **비용 발생**      | 월 1000건 무료. 이후 요청당 비용 부과               |
| ⏱ **실시간 아님**      | 보통 수초 \~ 수분 소요됨                        |
| 🎯 **최소 범위만 무효화** | `/*`처럼 전체 무효화는 피하고, 필요한 경로만 지정하는 것이 좋음 |

#### 💡 캐시 무효화를 피하는 또 다른 방법
→ 파일명에 해시 붙이기 (캐시 버스팅)
예:

- `main.js` → `main.abc123.js`
- 변경되면 → `main.def456.js`

> 이러면 CloudFront는 새 파일로 인식해서 별도 캐시 적용됨
→ Invalidation 없이도 항상 최신 파일 제공 가능

#### ✅ 요약 문장
> Cache Invalidation은 CDN이나 CloudFront가 캐시한 파일을 강제로 무효화해서, 다음 요청부터는 원본 서버(S3 등)에서 새로운 파일을 다시 가져오도록 하는 작업입니다.
변경 사항이 즉시 반영돼야 할 때 필수이며, 가능한 범위를 좁혀 효율적으로 사용하는 것이 좋습니다.

### Repository secret와 환경변수
#### ✅ 1. 환경변수(Environment Variable)란?
>코드 실행 중 접근 가능한 설정값/정보
예: API 키, 경로, 배포 모드 등

```bash
NODE_ENV=production
AWS_REGION=ap-northeast-2
```
프로그래밍 언어에서도 사용:
```ts
process.env.NODE_ENV // Node.js
```
CI/CD에서도 사용:
```yaml
env:
  AWS_REGION: ap-northeast-2
```
#### ✅ 2. Repository Secrets란?
> 민감한 정보를 안전하게 저장하는 GitHub 기능
예: AWS Key, Firebase token, DB 비밀번호, 슬랙 Webhook 등

- GitHub Actions 워크플로우에서는 환경변수처럼 사용 가능
- 코드에서는 볼 수 없음, UI에서만 등록/조회 가능
- 노출 위험 없이 안전하게 관리

#### ✅ 3. 환경변수 vs Secrets 비교
| 항목    | 환경변수 (`env`)            | Secrets                             |
| ----- | ----------------------- | ----------------------------------- |
| 용도    | 일반 설정값                  | 민감한 보안 정보 (API key, token 등)        |
| 노출 여부 | 로그에 노출될 수 있음            | 기본적으로 로그에서 마스킹됨                     |
| 설정 위치 | workflow 파일 내부          | GitHub UI or CLI                    |
| 예시    | `NODE_ENV`, `BUILD_DIR` | `AWS_ACCESS_KEY_ID`, `DATABASE_URL` |

#### ✅ 4. GitHub에서 Repository Secret 등록 방법
1. GitHub → 리포지토리 → Settings
2. 왼쪽 메뉴에서 → Secrets and variables > Actions
3. [New repository secret] 클릭
4. Key: AWS_ACCESS_KEY_ID
		Value: AKIAxxxxxxxxxxxxxx

#### ✅ 5. GitHub Actions에서 사용하는 방법
```yaml
env:
  NODE_ENV: production
  AWS_REGION: ap-northeast-2

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Access secret
        run: echo "Secret is ${{ secrets.AWS_ACCESS_KEY_ID }}"
```
- 일반 변수는 env:
- Secret은 secrets.변수명으로 접근
> ❗ 중요한 정보는 반드시 secrets에 저장하세요.

#### ✅ 보너스: Secret/Env 우선순위
| 우선순위 | 위치                    |
| ---- | --------------------- |
| 1    | step 내부 `env`         |
| 2    | job 내부 `env`          |
| 3    | workflow 파일 상단의 `env` |
| 4    | GitHub 환경 변수 설정       |
| 5    | OS의 기본 환경변수           |
#### 🔐 실무 예시
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_API_URL: https://api.example.com
    steps:
      - name: Set AWS credentials
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: aws s3 sync ./out s3://my-bucket-name
```
#### ✅ 요약 문장
> 환경변수는 설정값을, Repository Secret은 민감한 정보를 안전하게 관리하기 위한 GitHub의 기능입니다.
> CI/CD에서 API 키, 토큰, 비밀번호는 반드시 secrets에 넣고 사용해야 하며, GitHub Actions에서는 ${{ secrets.변수명 }} 형식으로 접근합니다.

# 5. 배포 프로세스 정리
## 🚀 GitHub Actions 기반 배포 프로세스 순서 정리
### ✅ 1. 프로젝트 준비
- 코드가 GitHub 리포지토리에 있어야 함
- `npm run build`로 정적 빌드 결과물(`out/`, `dist/`, `.next/`) 생성 가능해야 함
- `.gitignore`에 `node_modules/`, `dist/`, `.next/` 등 불필요한 빌드 아웃풋 포함

### ✅ 2. S3 버킷 + CloudFront 준비 (한 번만 설정)
- S3에 정적 웹사이트 호스팅 활성화
- CloudFront 배포 생성 → S3를 origin으로 연결
- OAC (Origin Access Control) 설정으로 S3 보안 강화
- 배포 후 CloudFront 도메인 확인 (예: `https://d123.cloudfront.net`)

### ✅ 3. GitHub Secrets 등록
GitHub 리포지토리 → Settings → Secrets and variables → *** Actions ***
| Key                     | Value                          |
| ----------------------- | ------------------------------ |
| `AWS_ACCESS_KEY_ID`     | IAM에서 발급한 키                    |
| `AWS_SECRET_ACCESS_KEY` | IAM 비밀 키                       |
| `AWS_REGION`            | 예: `ap-northeast-2`            |
| `S3_BUCKET_NAME`        | 예: `my-bucket-name`            |
| `DISTRIBUTION_ID`       | CloudFront 배포 ID (선택, 캐시 무효화용) |

### ✅ 4. .github/workflows/deploy.yml 작성
```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --acl public-read --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.S3_BUCKET_NAME }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
          SOURCE_DIR: './out' # or './dist' or '.next'

      - name: Invalidate CloudFront cache
        if: success()
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.DISTRIBUTION_ID }} \
            --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
```
### ✅ 5. main 브랜치에 push
- `git push origin main` 하면,
- GitHub Actions가 자동으로 실행
- `build → S3 업로드 → CloudFront 캐시 무효화`까지 자동으로 진행

### ✅ 6. 배포 완료
- CloudFront URL로 접근 → 새 빌드가 반영되어 있어야 함

## 🧾 요약 순서 한 줄 요약
1. GitHub에 프로젝트 올리기
2. S3/CloudFront 미리 세팅
3. GitHub Secrets에 AWS 키 등록
4. `deploy.yml` 작성
5. `main` 브랜치에 push
6. GitHub Actions가 자동 배포 수행

### ✅ Git 브랜치 전략
| 브랜치    | 역할                                   |
| ------ | ------------------------------------ |
| `dev`  | 개발 브랜치 – 기능 개발, 테스트, 사내 배포 등         |
| `main` | 상용 배포 브랜치 – CloudFront 통해 실제 유저에게 배포 |

### ✅ 추천 GitHub Actions 구성 (브랜치 분리 배포)
#### 1. dev 브랜치 push → 스테이징용 S3 버킷에 배포
```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to DEV S3

on:
  push:
    branches: [dev]

jobs:
  deploy:
    ...
    env:
      AWS_S3_BUCKET: ${{ secrets.DEV_S3_BUCKET_NAME }}
      ...
```

#### 2. main 브랜치 push → 프로덕션용 S3 + CloudFront에 배포
```yaml
복사
# .github/workflows/deploy-prod.yml
name: Deploy to PROD (main)

on:
  push:
    branches: [main]

jobs:
  deploy:
    ...
    env:
      AWS_S3_BUCKET: ${{ secrets.PROD_S3_BUCKET_NAME }}
      DISTRIBUTION_ID: ${{ secrets.PROD_DISTRIBUTION_ID }}
      ...
```

#### ✅ GitHub Secrets 설정 (2세트 필요)
| 환경   | 비밀키 이름 예시                                          |
| ---- | -------------------------------------------------- |
| DEV  | `DEV_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, ...     |
| PROD | `PROD_S3_BUCKET_NAME`, `PROD_DISTRIBUTION_ID`, ... |

#### ✅ 실무 플로우 요약
```plaintext
dev 브랜치 → push →
  GitHub Actions → 스테이징용 S3에 업로드 → (스테이징 URL로 확인)

main 브랜치 → push →
  GitHub Actions → 프로덕션 S3 업로드 + CloudFront 캐시 무효화 → (실제 배포)
```

#### 📌 실제 현업 예시
| 브랜치    | 배포 위치                 | 사용처     |
| ------ | --------------------- | ------- |
| `dev`  | `staging.example.com` | QA 테스트용 |
| `main` | `www.example.com`     | 실제 사용자용 |
→ CloudFront 도메인을 분리하거나 S3 버킷을 따로 두는 식으로 분기함

#### ✅ 추가 팁: PR 기반 워크플로우도 가능
- `dev` → `main`으로 PR 만들 때 테스트 실행
- `main` 머지되면 프로덕션 배포
```yaml
on:
  pull_request:
    branches: [main]
```
### 🔚 요약
- GitHub Actions에서는 브랜치마다 workflow 분리해서 S3나 CloudFront에 다른 환경으로 배포 가능
- dev는 사내 스테이징, main은 실서비스로 분리하는 방식이 가장 일반적
- 각 브랜치마다 .yml 구성과 Secret 세트를 따로 지정하는 게 실무 관행입니다.

# 6. S3 → CloudFront 성능 최적화 분석 보고
## 📌 (1) 테스트 환경
  - S3 버킷 웹사이트 엔드포인트: http://unseo-bucket.s3-website.ap-northeast-2.amazonaws.com/
  - CloudFrount 배포 도메인 이름: https://d2dqy6mkzzv7cu.cloudfront.net/
## 📝 (2)테스트 결과

![성능 최적화 분석보고](https://raw.githubusercontent.com/unseoJang/front_5th_chapter4-1/refs/heads/main/app/assets/images/img-blank-board.jpeg)

| **측정 지표**            | **S3 단독** | **CDN(CloudFront)** | **개선율**      |
| -------------------- | --------- | ------------------- | ------------ |
| **총 완료 시간**          | 8.60초     | 7.28초               | **15.3% ⬇️** |
| **DOMContentLoaded** | 1.96초     | 884ms               | **54.9% ⬇️** |
| **로드 완료 시점**         | 4.29초     | 1.85초               | **56.9% ⬇️** |
| **전송 크기**            | 11.0MB    | 10.8MB              | **1.8% ⬇️**  |
| **리소스 크기**           | 11.0MB    | 11.0MB              | 0%           |
## ✅ (3) CDN 사용 후 성능 개선
- 초기 렌더링(DOMContentLoaded) 속도가 약 2배 가까이 개선되어 사용자 체감 속도 상승
- 전체 로딩 시간도 약 15% 단축, 페이지 전환 및 사용자 경험 개선
- 리소스 크기는 동일하지만 전송 최적화로 인해 네트워크 효율성 향상
- CloudFront 캐싱 및 분산 구조를 통해 정적 리소스 전달 속도가 눈에 띄게 향상됨

## ✅ CloudFront 최적화 이점 요약
- 지리적 캐싱: 사용자와 가까운 Edge Location에서 응답 → 지연 시간 감소
- HTTP/2 지원: 병렬 다운로드 및 헤더 압축 지원으로 브라우저 성능 향상
- 압축 및 캐싱 정책 적용 가능: Gzip/Brotli + TTL 조정
- 보안 및 도메인 통합: HTTPS 인증서, 사용자 도메인 연결 가능 (e.g., cdn.mywebsite.com)

## ✅ 추천 후속 조치
- CloudFront에 대한 TTL 정책 최적화 (변경 빈도 낮은 리소스는 캐시 지속 시간 증가)
- Gzip/Brotli 압축 설정 확인 (작은 js/css 파일이라도 더 빨라질 수 있음)
- 정적 자산 버전 관리 (main.abcd1234.js 형태) 도입으로 캐시 무효화 효율 확보
