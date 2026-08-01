# Caleb Park — Portfolio

Photographer / Videographer / Fly Fisher 개인 포트폴리오 사이트.
Next.js (static export) + Tailwind CSS로 제작, GitHub Pages로 배포.

## 개발

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인.

## 빌드

```bash
npm run build
```

`out/` 폴더에 정적 사이트가 생성됩니다.

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드하고
GitHub Pages에 배포합니다. 저장소 Settings → Pages → Source를
"GitHub Actions"로 설정해야 합니다.

## 콘텐츠 수정

- 소개 문구: `src/components/Hero.tsx`, `src/components/About.tsx`
- 갤러리 사진: `public/gallery/`에 추가하고 `src/data/gallery.ts`에 항목 추가
- 연락처 링크: `src/components/Contact.tsx`
