# 프론트엔드 개발 과제 - 게시판 프로젝트

##  프로젝트 개요

위 프로젝트는 주어진 API 명세를 바탕으로, 사용자 인증(JWT)과 게시판의 CRUD(생성, 읽기, 수정, 삭제) 기능을 모두 갖추어 웹을 구현하였습니다.

Next.js의 App Router, TypeScript, 그리고 최신 상태 관리 아키텍처를 기반으로, 단순히 기능을 구현하는 것을 넘어 **보안, 사용자 경험(UX), 성능 최적화, 그리고 코드의 유지보수성**까지 고려하여 설계하고 개발하였습니다.

## 주요 기능

-   **사용자 인증 (Authentication)**
    -   이메일, 이름, 비밀번호를 포함한 회원가입 기능
    -   실시간 유효성 검사
    -   JWT(Access Token + Refresh Token) 기반 로그인 / 로그아웃 기능
    -   브라우저 저장소 토큰 암호화 로직 구현 (`crypto-js`)
    -   Axios 인터셉터를 활용한 자동 인증 헤더 추가 및 토큰 만료 시 자동 재발급 로직 구현
    -   토큰 재발급 요청 시의 '경쟁 조건(Race Condition)' 문제를 해결한 안정적인 재발급 로직 구현
    -   새로고침 및 브라우저 재시작 시에도 로그인 상태를 유지하는 세션 복원(`rehydrate`) 기능 구현
    -   토큰 만료 1분 전, 사용자에게 세션 연장 여부를 묻는 모달 구현

-   **게시판 (CRUD)**
    -   **C (Create):** 제목, 내용, 카테고리, 이미지를 포함한 새 글 작성 기능
    -   **R (Read):**
        -   TanStack Query를 이용한 캐싱 및 자동 동기화가 적용된 글 목록 보기
        -   페이지네이션(Pagination) 기능
        -   이미지 최적화가 적용된 글 상세 보기
    -   **U (Update):** 기존 글의 내용을 수정하는 기능
    -   **D (Delete):** 재확인 모달을 통해 게시물을 안전하게 삭제하는 기능
    -   로그인 시, `localStorage` 를 활용하여 사용자가 마지막으로 읽은 글을 기억하고, 홈페이지에서 '이어보기' 및 'N분 전 읽음'과 같은 개인화된 정보 제공

-   **UI / UX**
    -   Tailwind CSS를 이용한 반응형 디자인
    -   `next/font`를 이용한 웹 폰트 최적화


## 기술 스택

| 구분             | 기술                                         |
| ---------------- | -------------------------------------------- |
| **Core** | Next.js (App Router), React, TypeScript      |
| **State Management** | **MobX** (Client State), **TanStack Query** (Server State) |
| **Styling** | Tailwind CSS                                 |
| **API & Etc.** | Axios, `crypto-js`, `jwt-decode` |

## 아키텍처 및 주요 결정사항

이 프로젝트를 진행하며 다음과 같은 기술적 의사결정을 내렸습니다.

1.  **상태 관리 아키텍처:** 사용자의 UI 상호작용으로 발생하는 '클라이언트 상태'(로그인 여부, 모달 상태 등)는 **MobX**로, API를 통해 받아오는 '서버 상태'(게시물 목록 등)는 **TanStack Query**로 관리하여 역할을 명확히 분리했습니다. 이를 통해 불필요한 `useEffect`와 `useState` 사용을 최소화하고, 캐싱 및 데이터 동기화의 이점을 극대화했습니다.

2.  **견고한 인증 시스템:** 단순히 토큰을 저장하는 것을 넘어, `accessToken`은 `sessionStorage`에, `refreshToken`은 `localStorage`에 저장하여 보안과 편의성의 균형을 맞췄습니다. 특히, **Axios 인터셉터**와 `Promise`를 활용하여 여러 API 요청이 동시에 토큰 만료를 겪더라도 단 한 번의 재발급만 일어나도록 하는 **경쟁 조건 문제**를 해결하는 데 집중했습니다.

3.  **컴포넌트 기반 설계:** `AuthGuard` 인증과 UI 피드백을 책임지는 컴포넌트를 분리하여, 각 페이지 컴포넌트는 콘텐츠 렌더링이라는 자신의 역할에만 집중할 수 있도록 설계했습니다. 이를 통해 코드의 재사용성과 유지보수성을 높였습니다.


## 실행 방법

1.  
    ```bash
    git clone https://github.com/ncdino/developerTest.git
    ```
2.  
    ```bash
    cd developerTest
    ```
3.  
    ```bash
    npm install
    ```
4.  
    ```bash
    npm run dev
    ```
