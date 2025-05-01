# SaasBoilerplate

A modern, production-ready SaaS boilerplate built with Next.js App Router, TypeScript, Tailwind CSS, DaisyUI, NextAuth, MongoDB, and Stripe. Designed for rapid SaaS MVP launches with best practices for performance, security, and developer experience.

## Features
- Next.js App Router (RSC-first, SSR, SEO)
- TypeScript throughout
- Tailwind CSS & DaisyUI (20+ themes, dark mode)
- NextAuth authentication (email, Google, GitHub)
- Stripe payments (subscriptions, webhooks, upgrade/downgrade)
- MongoDB/Mongoose models
- Responsive, beautiful UI (mobile-first)
- Modular, functional code structure
- Production-ready: SEO, analytics, error handling, and more

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Kiog-Aser/SaaSTemplate.git
   cd SaaSTemplate
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env.local` and fill in required values (MongoDB, Stripe, etc).
   - Edit `config.ts` for branding, pricing, and feature toggles.
4. **Run locally:**
   ```bash
   npm run dev
   ```
5. **Deploy:**
   - Deploy to Vercel, Railway, or your preferred platform.

## Folder Structure
- `app/` — Next.js App Router pages
- `components/` — Reusable UI components (PascalCase)
- `models/` — Mongoose models
- `libs/` — Utility libraries (API, auth, stripe, etc)
- `public/` — Static assets
- `styles/` — Global styles
- `types/` — TypeScript types
- `utils/` — Helper functions

## Customization
- Update `config.ts` for your app name, description, pricing, and theme.
- Replace logo and images in `app/` and `public/`.
- Edit legal pages in `app/tos/page.tsx` and `app/privacy-policy/page.tsx`.
- Add or remove features as needed.

## License
MIT — Free for personal and commercial use. Attribution appreciated but not required.

---

**Built with ❤️ using ShipFast boilerplate best practices.**
