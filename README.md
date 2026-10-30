# Zhixia Chinese — 知夏中文

A complete, responsive, bilingual marketing and checkout site for an independent online Chinese teacher. Built as plain HTML, CSS and JavaScript — no build step or framework.

> **Preview build:** the inquiry form is stored locally and the payment screen shows a sample confirmation. No data is sent and no money is charged. See **Going live** below.

---

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | English homepage: teacher profile, credentials, specialties, learner stories, pricing, inquiry form and FAQ. |
| `index-zh.html` | Fully translated Chinese homepage. |
| `pay.html` | English checkout: packages, order summary, payment methods, confirmation, printable receipt and FAQ. |
| `pay-zh.html` | Fully translated Chinese checkout. |
| `privacy.html` / `privacy-zh.html` | Bilingual privacy-policy templates. |
| `terms.html` / `terms-zh.html` | Bilingual lesson-terms templates. |
| `assets/styles.css` | Shared design system, legal pages, responsive layouts and print styles. |
| `assets/app.js` | Language detection, mobile navigation, inquiry handling, package handoff, checkout summary and demo payment. |
| `assets/teacher-portrait.svg` | Illustrated teacher portrait used in the hero. Replace with a real photo when available. |
| `assets/desk-still-life.svg` | Illustrated “teacher’s desk” image used in the About section. |
| `assets/favicon.svg` | Site icon. |
| `site.webmanifest` | Web-app manifest (name, colours, icon). |

## Languages

The site is **English-first with a complete Chinese version**. Every page has visible `中文` / `EN` switches in the header and footer:

- English: `index.html`, `pay.html`, `privacy.html`, `terms.html`
- Chinese: `index-zh.html`, `pay-zh.html`, `privacy-zh.html`, `terms-zh.html`

Both versions share one stylesheet and one script. `app.js` detects `<html lang="zh-Hans">` and localizes dynamic text such as order summaries, payment labels, dates, validation errors, success panels and form placeholders. When editing any page, update its language counterpart too.

## Preview locally

Double-click `index.html` for English or `index-zh.html` for Chinese — the site works from the filesystem. For a more realistic preview, use any static server:

```bash
cd default-workspace
python -m http.server 8000
```

Then open <http://localhost:8000>.

## What is already working

- Full English and Chinese versions of the four content pages, joined by header and footer language switches.
- Dynamic UI strings are localized too: package names, order summary, dates, payment labels, errors, success panels and form placeholders.
- Mobile-first layout, sticky header, accessible mobile menu and a print-friendly receipt.
- Pricing cards preselect the matching package in the inquiry form.
- Inquiry form with lightweight required fields, goal chips, trial-chat option and validation.
- After inquiry, a confirmation panel offers a direct handoff to checkout in the same language.
- Checkout updates the order summary live when the package changes.
- Card, PayPal, WeChat Pay and Alipay choices each display the appropriate next-step copy.
- Demo payment produces an order number and receipt; “Print receipt” uses the browser’s print dialog.
- Reduced-motion support, keyboard focus styles, skip link, labelled form controls and bilingual legal pages.

## The demo behaviour

`assets/app.js` starts with:

```js
const CONFIG = {
  demoMode: true,
  inquiryEndpoint: "",
  checkoutEndpoint: ""
};
```

With `demoMode: true`:

- A dark preview bar explains that inquiries and payments are simulated.
- Inquiry answers are saved to `localStorage` under `zhixia_inquiry` and passed to checkout via `sessionStorage`.
- Checkout does **not** collect card details and does not contact a payment processor. It waits briefly, then shows a sample confirmation.
- No email is sent.

The sample order is stored locally as `zhixia_last_order` for inspection.

## Going live

1. **Replace all sample content in both languages.** The teacher name “Lin Zhixia / 林知夏”, credentials, six years’ experience, 1,200+ lessons, 30+ countries, review scores and testimonials are placeholder copy. Replace them with verified facts and real, permissioned testimonials in `index.html` / `index-zh.html`, `pay.html` / `pay-zh.html` and both footers. Update `teacher-portrait.svg` or add a real photo with accurate `alt` text.
2. **Update brand details in both languages.** Replace `hello@zhixiachinese.com`, availability (“3 teaching spots left · November” / “11 月还剩 3 个上课名额”), pricing, scheduling policy and refund wording.
3. **Connect the inquiry form.** Use Formspree, Basin, Netlify Forms, a Google Apps Script endpoint or your own API. Set `CONFIG.inquiryEndpoint` to a URL that accepts a JSON `POST`. The payload is documented in `initInquiryForm()` in `app.js`. Add server-side validation and spam protection (honeypot or captcha). The English and Chinese forms intentionally submit the same canonical English option values to keep backend data consistent.
4. **Connect payments with a backend.** Never place Stripe, PayPal or Alipay secret keys in this front end.
   - Create a server route (e.g. `/api/create-checkout-session`).
   - Validate package and price on the server — never trust the browser’s amount.
   - Create a Stripe Checkout Session or PayPal order and return `{ "url": "https://..." }`.
   - Set `CONFIG.checkoutEndpoint` to that route.
   - Add a webhook that marks the order paid, emails the receipt/scheduling link, and records the learner.
   - For WeChat Pay / Alipay cross-border, use a provider that supports international learners and redirect or display its QR flow.
5. **Set `demoMode: false`.** This hides every `[data-demo-only]` preview notice and removes the simulated checkout path. Only do this once the inquiry and payment endpoints are configured and tested. Because live checkout redirects to your provider, add a post-payment return page (or a `?status=success` state) that confirms the order after your webhook has verified it — do not treat the browser redirect alone as proof of payment.
6. **Complete and review the legal templates.** `privacy.html`, `privacy-zh.html`, `terms.html` and `terms-zh.html` are drafted starting points, not legal advice. Replace the bracketed business/address/governing-law placeholders, make sure every statement matches your real tools and policies, and have qualified counsel review both language versions.
7. **Finish SEO and sharing.** Add a canonical URL and an absolute Open Graph image URL to all eight pages. Replace the SVG `og:image` with a 1200 × 630 JPG/PNG for best social previews, and update the `hreflang` links if you use a different file structure.
8. **Test on real devices and in both languages.** Check Safari/iOS, Android Chrome, keyboard-only navigation, all `EN` / `中文` switches, form handoff and both checkout flows. Test every payment method in the provider’s sandbox.

## Content editing map

| What | Where |
| --- | --- |
| Teacher name, bio, credentials | `index.html` / `index-zh.html` — hero and About section |
| Availability badge | `index.html` / `index-zh.html` — `.card-availability` |
| Specialties | `index.html` / `index-zh.html` — `.specialty-grid` |
| Testimonials | `index.html` / `index-zh.html` — `.testimonial-grid` |
| Prices and package features | pricing grids in both homepages; `PACKAGES` in `app.js`. The checkout radios carry package keys only. |
| Contact email | footers and FAQ/checkout notes on all pages |
| Colors and type | `:root` tokens at the top of `assets/styles.css` |
| Copy for the demo bar | `[data-demo-only]` near the top of each page |
| Form endpoint | `CONFIG.inquiryEndpoint` in `assets/app.js` |
| Payment endpoint | `CONFIG.checkoutEndpoint` in `assets/app.js` |
| Dynamic UI translations | `STRINGS` and `PACKAGES` in `assets/app.js` |
| Legal templates | `privacy.html`, `privacy-zh.html`, `terms.html`, `terms-zh.html` |

If prices change, update **both language versions** and the `PACKAGES` object in `app.js`. The checkout radios only carry the package key; prices, localized names and savings come from `PACKAGES`.

## Design notes

- Palette: warm ivory `#f7f3ea`, deep pine `#173a34`, tea green `#2e6b60`, terracotta `#cf7355`, soft gold `#c39751`.
- Type: Fraunces for display, DM Sans for UI, Noto Serif SC for Chinese accents. System serif/sans fallbacks are included.
- Breakpoints: 1080 px, 900 px, 760 px and 390 px.
- The layout is intentionally editorial rather than “SaaS template”: large serif headlines, generous paper space, and illustration instead of stock photography.
- All page-level links are relative, so the site can be hosted in a subdirectory or opened from disk.

## Deployment

Any static host will work: Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, or traditional shared hosting. Upload all eight HTML files, `site.webmanifest`, and the `assets/` folder. The only external runtime request is Google Fonts; the site falls back gracefully if it is blocked.

For production, add HTTPS, a real form/payment backend, and finalized legal policies. Payment and inquiry endpoints usually require a server or serverless function — static hosting alone cannot securely create payment sessions or store submissions.

---

Made for a calmer, more personal way to learn Chinese. 慢慢来。
