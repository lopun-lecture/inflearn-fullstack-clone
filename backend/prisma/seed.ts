import { PrismaClient } from '@prisma/client';
import slugify from '../lib/slugify';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  // 1. 기존 유저 존재 여부 체크
  const existingUser = await prisma.user.findFirst();
  if (!existingUser) {
    console.error(
      '데이터베이스에 유저가 존재하지 않습니다. 먼저 유저를 생성해주세요.',
    );
    process.exit(1);
  }
  const userId = existingUser.id;
  console.log('기존 유저를 사용합니다:', userId);

  // 2. 카테고리 시드 (기존 유지)
  await prisma.courseCategory.deleteMany({});
  const categorySeed = [
    { name: '개발 · 프로그래밍', slug: 'it-programming', description: '' },
    { name: '게임 개발', slug: 'game-dev-all', description: '' },
    { name: '데이터 사이언스', slug: 'data-science', description: '' },
    { name: '인공지능', slug: 'artificial-intelligence', description: '' },
    { name: '보안 · 네트워크', slug: 'it', description: '' },
    { name: '하드웨어', slug: 'hardware', description: '' },
    { name: '디자인 · 아트', slug: 'design', description: '' },
    { name: '기획 · 경영 · 마케팅', slug: 'business', description: '' },
    { name: '업무 생산성', slug: 'productivity', description: '' },
    { name: '커리어 · 자기계발', slug: 'career', description: '' },
    { name: '대학 교육', slug: 'academics', description: '' },
  ];
  await prisma.courseCategory.createMany({
    data: categorySeed.map((c) => ({ ...c, id: uuidv4() })),
  });
  const categories = await prisma.courseCategory.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  console.log('카테고리 시드 데이터가 성공적으로 생성되었습니다.');

  const generateRandomThumbnailUrl = () => {
    const randomNumber = Math.floor(Math.random() * 4);
    return [
      'https://cdn.inflearn.com/public/courses/332907/cover/2975d3d7-5dcc-4e2a-977c-98b11134cfb6/332907.jpg?w=420',
      'https://cdn.inflearn.com/public/files/courses/337025/cover/01jv1n5rh7hkqc4ff3cjcdwhzt?w=420',
      'https://cdn.inflearn.com/public/courses/334643/cover/fce6d336-c676-4c92-83b4-79512558ab8b/334643.jpg?w=420',
      'https://cdn.inflearn.com/public/courses/334439/cover/9e628f60-3721-4d03-b36d-a577593b96fd/334439.jpg?w=420',
    ][randomNumber];
  };

  const generateRandomLevel = () => {
    const randomNumber = Math.floor(Math.random() * 3);
    return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][randomNumber];
  };

  // 2. 강의 데이터 배열 (30개 전체)
  const now = new Date();
  const courseData = [
    {
      title: 'React + TypeScript 완전정복',
      shortDescription:
        'React와 TypeScript를 함께 사용하는 현대적인 웹 개발 방법을 학습합니다.',
      description:
        '<h2>React + TypeScript 완전정복</h2><p>현대 웹 개발의 필수 기술인 React와 TypeScript를 함께 사용하는 방법을 배워보세요.</p><ul><li>React 기초부터 고급 기능까지</li><li>TypeScript의 타입 시스템 활용</li><li>실전 프로젝트로 경험 쌓기</li></ul>',
      price: 55000,
      discountPrice: 44000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Next.js 풀스택 마스터클래스',
      shortDescription:
        'Next.js 13 App Router를 활용한 모던 풀스택 웹 개발을 마스터합니다.',
      description:
        '<h2>Next.js 풀스택 마스터클래스</h2><p>최신 Next.js 13의 App Router를 활용한 풀스택 개발을 배워보세요.</p><ul><li>Server Components와 Client Components</li><li>서버 사이드 렌더링과 정적 사이트 생성</li><li>API Routes와 데이터베이스 연동</li></ul>',
      price: 77000,
      discountPrice: 66000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Python 데이터 분석 완전정복',
      shortDescription:
        'Pandas, NumPy, Matplotlib을 활용한 실전 데이터 분석 기법을 학습합니다.',
      description:
        '<h2>Python 데이터 분석 완전정복</h2><p>Python을 사용한 데이터 분석의 모든 것을 배워보세요.</p><ul><li>Pandas를 활용한 데이터 조작</li><li>NumPy로 수치 연산 최적화</li><li>Matplotlib과 Seaborn으로 데이터 시각화</li></ul>',
      price: 49000,
      discountPrice: 39000,
      categorySlug: 'data-science',
    },
    {
      title: 'Flutter 모바일 앱 개발',
      shortDescription:
        'Flutter로 크로스 플랫폼 모바일 앱을 개발하는 방법을 배웁니다.',
      description:
        '<h2>Flutter 모바일 앱 개발</h2><p>하나의 코드로 iOS와 Android 앱을 동시에 개발하는 Flutter를 마스터하세요.</p><ul><li>Dart 언어 기초부터 고급까지</li><li>Flutter 위젯 시스템 완전 이해</li><li>실제 앱 스토어 출시까지</li></ul>',
      price: 66000,
      discountPrice: 52000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Docker & Kubernetes 실전 DevOps',
      shortDescription:
        'Docker와 Kubernetes를 활용한 현대적인 DevOps 환경을 구축합니다.',
      description:
        '<h2>Docker & Kubernetes 실전 DevOps</h2><p>컨테이너 기술의 핵심인 Docker와 Kubernetes를 실전에서 활용하는 방법을 배워보세요.</p><ul><li>Docker 컨테이너 완전 이해</li><li>Kubernetes 클러스터 관리</li><li>CI/CD 파이프라인 구축</li></ul>',
      price: 88000,
      discountPrice: 70000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Vue 3 Composition API 마스터',
      shortDescription:
        'Vue 3의 Composition API를 활용한 현대적인 프론트엔드 개발을 학습합니다.',
      description:
        '<h2>Vue 3 Composition API 마스터</h2><p>Vue.js의 최신 버전인 Vue 3와 Composition API를 완전히 마스터하세요.</p><ul><li>Composition API의 핵심 개념</li><li>Reactivity 시스템 심화 이해</li><li>실전 프로젝트 개발</li></ul>',
      price: 45000,
      discountPrice: 36000,
      categorySlug: 'it-programming',
    },
    {
      title: 'AWS 서버리스 아키텍처',
      shortDescription:
        'AWS Lambda, API Gateway, DynamoDB를 활용한 서버리스 아키텍처를 구축합니다.',
      description:
        '<h2>AWS 서버리스 아키텍처</h2><p>AWS의 서버리스 서비스들을 활용하여 확장 가능한 아키텍처를 구축해보세요.</p><ul><li>AWS Lambda 함수 개발</li><li>API Gateway와 DynamoDB 연동</li><li>CloudFormation으로 인프라 관리</li></ul>',
      price: 72000,
      discountPrice: 60000,
      categorySlug: 'it-programming',
    },
    {
      title: '머신러닝과 TensorFlow 실전',
      shortDescription:
        'TensorFlow를 활용한 실전 머신러닝 모델 개발과 배포를 학습합니다.',
      description:
        '<h2>머신러닝과 TensorFlow 실전</h2><p>TensorFlow를 사용하여 실제 머신러닝 모델을 개발하고 배포하는 방법을 배워보세요.</p><ul><li>TensorFlow 2.x 핵심 개념</li><li>신경망 모델 설계와 훈련</li><li>모델 배포와 최적화</li></ul>',
      price: 85000,
      discountPrice: 68000,
      categorySlug: 'artificial-intelligence',
    },
    {
      title: 'Spring Boot 마이크로서비스',
      shortDescription:
        'Spring Boot를 활용한 마이크로서비스 아키텍처 설계와 구현을 학습합니다.',
      description:
        '<h2>Spring Boot 마이크로서비스</h2><p>Spring Boot를 사용하여 확장 가능한 마이크로서비스를 구축하는 방법을 배워보세요.</p><ul><li>Spring Boot 핵심 개념</li><li>마이크로서비스 아키텍처 패턴</li><li>서비스 간 통신과 데이터 관리</li></ul>',
      price: 65000,
      discountPrice: 50000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Go 언어 백엔드 개발',
      shortDescription:
        'Go 언어의 특징을 활용한 고성능 백엔드 시스템 개발을 마스터합니다.',
      description:
        '<h2>Go 언어 백엔드 개발</h2><p>Go 언어만의 독특한 특징들을 활용하여 고성능 백엔드 시스템을 개발해보세요.</p><ul><li>Go 언어 문법과 특징</li><li>Goroutine과 Channel 활용</li><li>웹 서버와 데이터베이스 연동</li></ul>',
      price: 58000,
      discountPrice: 46000,
      categorySlug: 'it-programming',
    },
    {
      title: 'iOS SwiftUI 앱 개발',
      shortDescription:
        'SwiftUI를 활용한 현대적인 iOS 앱 개발 방법을 학습합니다.',
      description:
        '<h2>iOS SwiftUI 앱 개발</h2><p>Apple의 최신 UI 프레임워크인 SwiftUI를 사용하여 iOS 앱을 개발해보세요.</p><ul><li>SwiftUI 기본 컴포넌트</li><li>상태 관리와 데이터 바인딩</li><li>앱 스토어 출시 준비</li></ul>',
      price: 69000,
      discountPrice: 55000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Rust 시스템 프로그래밍',
      shortDescription:
        'Rust 언어의 메모리 안전성과 성능을 활용한 시스템 프로그래밍을 학습합니다.',
      description:
        '<h2>Rust 시스템 프로그래밍</h2><p>메모리 안전성과 고성능을 동시에 제공하는 Rust 언어로 시스템 프로그래밍을 배워보세요.</p><ul><li>Rust 소유권 시스템</li><li>메모리 안전성과 성능 최적화</li><li>시스템 레벨 프로그래밍</li></ul>',
      price: 62000,
      discountPrice: 49000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Figma UI/UX 디자인 마스터',
      shortDescription:
        'Figma를 활용한 전문적인 UI/UX 디자인 프로세스를 학습합니다.',
      description:
        '<h2>Figma UI/UX 디자인 마스터</h2><p>Figma의 모든 기능을 활용하여 전문적인 UI/UX 디자인을 완성해보세요.</p><ul><li>Figma 기본 도구 활용</li><li>컴포넌트 시스템 구축</li><li>프로토타이핑과 협업</li></ul>',
      price: 42000,
      discountPrice: 33000,
      categorySlug: 'design',
    },
    {
      title: '블록체인과 스마트 컨트랙트',
      shortDescription:
        'Ethereum과 Solidity를 활용한 스마트 컨트랙트 개발을 학습합니다.',
      description:
        '<h2>블록체인과 스마트 컨트랙트</h2><p>Ethereum 블록체인 위에서 동작하는 스마트 컨트랙트를 개발하는 방법을 배워보세요.</p><ul><li>블록체인 기본 개념</li><li>Solidity 언어 마스터</li><li>DApp 개발과 배포</li></ul>',
      price: 95000,
      discountPrice: 76000,
      categorySlug: 'it-programming',
    },
    {
      title: 'MongoDB 데이터베이스 설계',
      shortDescription:
        'MongoDB를 활용한 NoSQL 데이터베이스 설계와 최적화를 학습합니다.',
      description:
        '<h2>MongoDB 데이터베이스 설계</h2><p>NoSQL 데이터베이스의 대표주자인 MongoDB를 활용한 효율적인 데이터베이스 설계를 배워보세요.</p><ul><li>MongoDB 기본 개념과 특징</li><li>스키마 설계 패턴</li><li>성능 최적화와 인덱싱</li></ul>',
      price: 48000,
      discountPrice: 38000,
      categorySlug: 'data-science',
    },
    {
      title: 'JavaScript ES6+ 완전정복',
      shortDescription: 'ES6부터 최신 JavaScript 문법까지 완전히 마스터합니다.',
      description:
        '<h2>JavaScript ES6+ 완전정복</h2><p>ES6부터 최신 JavaScript까지 모든 문법과 기능을 완전히 마스터해보세요.</p><ul><li>ES6+ 핵심 문법</li><li>비동기 프로그래밍</li><li>모던 JavaScript 개발 패턴</li></ul>',
      price: 39000,
      discountPrice: 31000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Unity 게임 개발 완전정복',
      shortDescription:
        'Unity 엔진을 활용한 2D/3D 게임 개발의 모든 것을 학습합니다.',
      description:
        '<h2>Unity 게임 개발 완전정복</h2><p>Unity 엔진을 사용하여 2D와 3D 게임을 모두 개발할 수 있는 능력을 기르세요.</p><ul><li>Unity 엔진 기초</li><li>2D/3D 게임 개발</li><li>게임 최적화와 퍼블리싱</li></ul>',
      price: 78000,
      discountPrice: 62000,
      categorySlug: 'game-dev-all',
    },
    {
      title: 'PostgreSQL 고급 쿼리 최적화',
      shortDescription:
        'PostgreSQL의 고급 기능과 쿼리 최적화 기법을 마스터합니다.',
      description:
        '<h2>PostgreSQL 고급 쿼리 최적화</h2><p>PostgreSQL의 고급 기능을 활용하여 효율적인 데이터베이스 쿼리를 작성하는 방법을 배워보세요.</p><ul><li>복잡한 쿼리 작성</li><li>인덱스 전략과 성능 튜닝</li><li>저장 프로시저와 트리거</li></ul>',
      price: 54000,
      discountPrice: 43000,
      categorySlug: 'data-science',
    },
    {
      title: 'Jenkins CI/CD 자동화',
      shortDescription:
        'Jenkins를 활용한 지속적 통합과 배포 파이프라인을 구축합니다.',
      description:
        '<h2>Jenkins CI/CD 자동화</h2><p>Jenkins를 사용하여 개발부터 배포까지의 전 과정을 자동화하는 방법을 배워보세요.</p><ul><li>Jenkins 설치와 설정</li><li>CI/CD 파이프라인 구축</li><li>자동화된 테스트와 배포</li></ul>',
      price: 61000,
      discountPrice: 48000,
      categorySlug: 'it-programming',
    },
    {
      title: 'GraphQL API 개발 마스터',
      shortDescription:
        'GraphQL을 활용한 효율적인 API 설계와 개발을 학습합니다.',
      description:
        '<h2>GraphQL API 개발 마스터</h2><p>REST API의 한계를 극복하는 GraphQL API를 설계하고 개발하는 방법을 배워보세요.</p><ul><li>GraphQL 기본 개념</li><li>스키마 설계와 리졸버</li><li>실전 GraphQL 서버 구축</li></ul>',
      price: 52000,
      discountPrice: 41000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Electron 데스크탑 앱 개발',
      shortDescription:
        'Electron을 활용한 크로스 플랫폼 데스크탑 애플리케이션 개발을 학습합니다.',
      description:
        '<h2>Electron 데스크탑 앱 개발</h2><p>웹 기술로 데스크탑 앱을 개발할 수 있는 Electron 프레임워크를 마스터해보세요.</p><ul><li>Electron 기본 구조</li><li>메인 프로세스와 렌더러 프로세스</li><li>네이티브 기능 통합</li></ul>',
      price: 47000,
      discountPrice: 37000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Tailwind CSS 반응형 디자인',
      shortDescription:
        'Tailwind CSS를 활용한 효율적인 반응형 웹 디자인을 마스터합니다.',
      description:
        '<h2>Tailwind CSS 반응형 디자인</h2><p>유틸리티 퍼스트 CSS 프레임워크인 Tailwind CSS로 빠르고 효율적인 스타일링을 배워보세요.</p><ul><li>Tailwind CSS 핵심 개념</li><li>반응형 디자인 구현</li><li>커스텀 컴포넌트 제작</li></ul>',
      price: 35000,
      discountPrice: 28000,
      categorySlug: 'design',
    },
    {
      title: 'Redis 캐싱 전략과 최적화',
      shortDescription:
        'Redis를 활용한 효과적인 캐싱 전략과 성능 최적화를 학습합니다.',
      description:
        '<h2>Redis 캐싱 전략과 최적화</h2><p>고성능 인메모리 데이터베이스 Redis를 활용한 캐싱 전략을 마스터해보세요.</p><ul><li>Redis 기본 개념과 데이터 타입</li><li>효과적인 캐싱 패턴</li><li>성능 모니터링과 최적화</li></ul>',
      price: 43000,
      discountPrice: 34000,
      categorySlug: 'data-science',
    },
    {
      title: 'SvelteKit 모던 웹 개발',
      shortDescription:
        'SvelteKit을 활용한 고성능 웹 애플리케이션 개발을 학습합니다.',
      description:
        '<h2>SvelteKit 모던 웹 개발</h2><p>컴파일 타임 최적화로 빠른 성능을 제공하는 SvelteKit을 마스터해보세요.</p><ul><li>Svelte 기본 문법과 특징</li><li>SvelteKit 라우팅과 SSR</li><li>실전 프로젝트 개발</li></ul>',
      price: 51000,
      discountPrice: 40000,
      categorySlug: 'it-programming',
    },
    {
      title: '사이버 보안과 윤리적 해킹',
      shortDescription:
        '사이버 보안의 기초부터 윤리적 해킹 기법까지 종합적으로 학습합니다.',
      description:
        '<h2>사이버 보안과 윤리적 해킹</h2><p>현대 사회의 필수 기술인 사이버 보안과 윤리적 해킹을 체계적으로 배워보세요.</p><ul><li>사이버 보안 기초 개념</li><li>네트워크 보안과 취약점 분석</li><li>윤리적 해킹 실습</li></ul>',
      price: 89000,
      discountPrice: 71000,
      categorySlug: 'it',
    },
    {
      title: 'Firebase 실시간 데이터베이스',
      shortDescription:
        'Firebase를 활용한 실시간 웹 애플리케이션 개발을 마스터합니다.',
      description:
        '<h2>Firebase 실시간 데이터베이스</h2><p>Google Firebase를 활용하여 실시간으로 동기화되는 웹 애플리케이션을 개발해보세요.</p><ul><li>Firebase 프로젝트 설정</li><li>실시간 데이터베이스 활용</li><li>인증과 보안 규칙</li></ul>',
      price: 44000,
      discountPrice: 35000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Kotlin 안드로이드 개발',
      shortDescription:
        'Kotlin을 활용한 현대적인 안드로이드 앱 개발을 학습합니다.',
      description:
        '<h2>Kotlin 안드로이드 개발</h2><p>Google이 공식 추천하는 Kotlin 언어로 안드로이드 앱을 개발하는 방법을 배워보세요.</p><ul><li>Kotlin 언어 기초</li><li>안드로이드 앱 아키텍처</li><li>Jetpack Compose UI 개발</li></ul>',
      price: 67000,
      discountPrice: 53000,
      categorySlug: 'it-programming',
    },
    {
      title: 'Apache Kafka 스트리밍',
      shortDescription:
        'Apache Kafka를 활용한 대용량 실시간 데이터 스트리밍을 학습합니다.',
      description:
        '<h2>Apache Kafka 스트리밍</h2><p>대용량 실시간 데이터 처리의 핵심 기술인 Apache Kafka를 완전히 마스터해보세요.</p><ul><li>Kafka 아키텍처와 핵심 개념</li><li>프로듀서와 컨슈머 개발</li><li>Kafka Streams와 Connect</li></ul>',
      price: 82000,
      discountPrice: 65000,
      categorySlug: 'data-science',
    },
    {
      title: 'Shopify 이커머스 개발',
      shortDescription:
        'Shopify 플랫폼을 활용한 전문적인 이커머스 사이트 개발을 학습합니다.',
      description:
        '<h2>Shopify 이커머스 개발</h2><p>세계적인 이커머스 플랫폼 Shopify를 활용하여 전문적인 온라인 쇼핑몰을 개발해보세요.</p><ul><li>Shopify 테마 개발</li><li>Liquid 템플릿 언어</li><li>앱 개발과 API 연동</li></ul>',
      price: 56000,
      discountPrice: 44000,
      categorySlug: 'business',
    },
    {
      title: 'Terraform 인프라스트럭처 코드화',
      shortDescription:
        'Terraform을 활용한 인프라스트럭처 as Code 구현을 마스터합니다.',
      description:
        '<h2>Terraform 인프라스트럭처 코드화</h2><p>코드로 인프라를 관리하는 Infrastructure as Code의 대표 도구인 Terraform을 마스터해보세요.</p><ul><li>Terraform 기본 개념과 문법</li><li>클라우드 리소스 관리</li><li>모듈화와 상태 관리</li></ul>',
      price: 73000,
      discountPrice: 58000,
      categorySlug: 'it-programming',
    },
  ].map((course) => ({
    ...course,
    slug: slugify(course.title),
    level: generateRandomLevel(),
    status: 'PUBLISHED',
    instructorId: userId,
    thumbnailUrl: generateRandomThumbnailUrl(),
    createdAt: now,
    updatedAt: now,
  }));

  // 3. 강의 데이터 및 카테고리 연결
  await prisma.course.deleteMany({});
  for (const course of courseData) {
    const { categorySlug, ...courseFields } = course;
    const created = await prisma.course.create({ data: courseFields });
    await prisma.course.update({
      where: { id: created.id },
      data: { categories: { connect: [{ id: categoryMap[categorySlug] }] } },
    });
  }
  console.log('강의 30개가 성공적으로 생성되었습니다.');
}

main()
  .catch((error) => {
    console.error('시드 데이터 생성 중 오류가 발생했습니다', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
