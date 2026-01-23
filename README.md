# HackerAnalytics — Landing Page

HackerAnalytics is a small security-focused SaaS project and CTI initiative that offers hosted scanning tools and related threat intelligence content. This repository contains the marketing landing site: hero, feature sections, scanner pages (Nmap, OpenVAS, OWASP ZAP), FAQs, and contact forms.

Quick summary
- Purpose: marketing and product landing page for HackerAnalytics.
- Tech: Next.js (pages router), Tailwind CSS, content-driven sections from `content/`.
- Where to edit: site content lives in `content/pages/` (Markdown) and `content/data/` (site/header/footer JSON). React components are in `src/components/`.

Local development
1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Make content changes: edit Markdown/JSON, then commit and push.

Notes
- Netlify: this repo is connected to Netlify for automatic deploys. Renaming the GitHub repository may trigger a redeploy depending on your Netlify configuration.
- Forms: contact and request forms use Netlify form handling; the contact form also includes an AJAX UX improvement.

If you'd like, I can rename the GitHub repository to `hackeranalytics-landingpage` (I can do this now using the `gh` CLI and update your local `origin` remote).
