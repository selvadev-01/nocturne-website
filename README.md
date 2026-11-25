# NOCTURNE: Night trains across Europe

**Live site:** https://nocturne-website.vercel.app

Marketing and booking website for NOCTURNE night trains. Fall asleep in one city, wake up in another. Book a seat, couchette or private sleeper.

Next.js 14 (App Router) · TypeScript · Tailwind · GSAP · Lenis · Phosphor Icons.

```bash
npm install
npm run dev        # http://localhost:3500
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the live domain (used for Open Graph URLs).

## Where things live

| What | Where |
|---|---|
| Page sections | `components/` (Hero, Journey, Departures, Cabins, Night, Worth, Book, Footer) |
| Split-flap board and clock | `components/Flap.tsx`, `components/Clock.tsx` |
| Site copy and data | `content/data.ts` |
| Lenis + GSAP setup | `lib/providers.tsx` |
| Images and the journey film | `public/img/`, `public/video/` |

## Deployment

Deployed on Vercel (project `nocturne-website`).
