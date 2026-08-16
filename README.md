# Nualia — website demo

A static demonstration site for internal review. No build step, no dependencies,
no tracking. Open `index.html` in a browser and it works, online or offline.

## Pages

| File | What it is |
|---|---|
| `index.html` | the narrative: hero, the ring idea, the five years, the day, limits, governance, who comes, membership, longevity, questions |
| `the-scan.html` | what a scan can tell you — and what it cannot. The honesty document |
| `membership.html` | what is included, why the second year matters, companies |
| `approach.html` | our thinking, where the mark comes from, what we will never claim |
| `contact.html` | request a call, book a conversation, WhatsApp |
| `privacy.html` | privacy and data, in plain language |

## Publishing on GitHub Pages

1. Create a repository and push these files to its root.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

`.nojekyll` is present so GitHub serves the files as-is.

When a custom domain is ready: add a `CNAME` file containing `nualia.health`,
point the DNS at GitHub, and enable *Enforce HTTPS*.

## Before this could ever be public

- Every page carries `noindex` and a demonstration banner. Both must be removed
  deliberately, not by accident. They are still in place: the intention is to
  publish behind Cloudflare Access first, with these as a second lock.
- Pricing has been removed from index.html and membership.html.
- The investor email address has been removed from contact.html.
- Health-service advertising in Dubai requires DHA approval. The copy has been
  written to the brand's claim rules, but it has not been cleared.
- The people in the photographs are generated. They are cleared for internal and
  investor use, not for public marketing.
- The price shown is indicative and marked provisional on the page.
- The form does nothing. Wiring it to a real inbox is the only code change needed.

## How it is built

Plain HTML, one stylesheet, one small script.

- **Colour** — the Oasis Light palette as CSS variables. Nothing invented.
- **Type** — Cormorant Garamond for display, Mulish for everything small,
  self-hosted and embedded in the stylesheet so no Google Fonts call is made
  and the site works from a folder.
- **Icons** — inlined from the thirty-icon set, recoloured to inherit their
  context rather than hard-coded.
- **The mark** — used whole with clear space in the header, and oversized-and-bled
  in the wide sections, per the cutting rule. Never cut in open space.
- **Motion** — reveal on scroll, the rings rising from the horizon one year at a
  time (innermost first, each ring closing at its apex before the next begins),
  a hairline that fills across the four steps of the day, gentle parallax on the
  image bands, and a haptic tick on primary actions where the device supports it.
  All of it disabled under `prefers-reduced-motion`.
- **Images** — WebP at two widths with `srcset`; the whole site is about 5 MB.

`assets/` holds `css`, `js`, `fonts`, `img`, `logo` and `icons`.
