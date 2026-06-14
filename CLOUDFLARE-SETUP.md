# Serving the registration app at `jcamerata.smarticket.co.il/landing`

We want a registration landing page (hosted on Netlify) to appear at:

    https://jcamerata.smarticket.co.il/landing

…while **the root `/` and every other path on `jcamerata.smarticket.co.il`
stays exactly as it is today, untouched.**

DNS alone can't do this — DNS maps the whole hostname to one server and has no
concept of paths. The split has to happen at whatever sits in front of the
domain. Since `jcamerata.smarticket.co.il` is served through **Cloudflare**,
this is done with a small Cloudflare Worker that reverse-proxies only the
`/landing` paths to the Netlify app.

> **Who does this:** `jcamerata.smarticket.co.il` is a subdomain of
> `smarticket.co.il` (the ticketing platform). The change below is made in the
> Cloudflare account that controls that domain — most likely **SmartTicket's**
> technical team, not the camerata. If SmartTicket does not run this subdomain
> through Cloudflare, see "If not on Cloudflare" at the bottom.

## The Netlify app
- Public URL: **https://boisterous-pasca-94fd3c.netlify.app**
- It already works under `/landing`:
  https://boisterous-pasca-94fd3c.netlify.app/landing

**Pre-check (do this first):** open
https://boisterous-pasca-94fd3c.netlify.app/landing in a browser. The
registration page should load fully — images, fonts, and a working concert
counter. This confirms the proxy target (the "origin") is healthy, so the only
thing left to set up is the `/landing` route below.

## Steps (Cloudflare dashboard)

1. Open the Cloudflare account that manages `smarticket.co.il` → select that zone.
2. Left sidebar → **Workers & Pages** → **Create application** → **Create Worker**.
3. Name it e.g. `jcamerata-landing-proxy`, click **Deploy**, then **Edit code**.
4. Replace the code with this (already filled in with the Netlify host):

   ```js
   const NETLIFY_HOST = "boisterous-pasca-94fd3c.netlify.app";

   export default {
     async fetch(request) {
       const url = new URL(request.url);
       // Proxy /landing and everything under it to the Netlify app,
       // keeping the same path so /landing/assets/... and /landing/script.js work.
       const target = "https://" + NETLIFY_HOST + url.pathname + url.search;
       return fetch(target, request);
     },
   };
   ```

5. **Save and deploy**.
6. Go back to the Worker → **Settings** → **Domains & Routes** (or **Triggers**)
   → **Add route**. Set:

       Route:  jcamerata.smarticket.co.il/landing*
       Zone:   smarticket.co.il

   Save.

That's it. `https://jcamerata.smarticket.co.il/landing` now serves the Netlify
app, the URL stays on the `jcamerata.smarticket.co.il` domain, and everything
else on the site is unaffected.

## How to verify
- Visit `https://jcamerata.smarticket.co.il/landing` → the registration page
  loads, all images and the concert counter work, and the URL bar stays on
  `jcamerata.smarticket.co.il`.
- Visit `https://jcamerata.smarticket.co.il/` → the existing site, unchanged.

## If not on Cloudflare
If this subdomain is **not** served through Cloudflare Workers, the same result
can be achieved with a reverse-proxy rule on whatever web server/CDN fronts
`jcamerata.smarticket.co.il`:

- Proxy (not redirect) requests for `^/landing` and `^/landing/.*` to
  `https://boisterous-pasca-94fd3c.netlify.app` preserving the path.
- e.g. nginx: `location /landing { proxy_pass https://boisterous-pasca-94fd3c.netlify.app; }`

The only hard requirement is that `/landing*` is **proxied** (URL stays on the
camerata domain), not 301-redirected to the netlify.app URL.

## Note for the Netlify side (already done in this repo)
The app lives under `/landing`: asset/script references use `/landing/...` paths
and `netlify.toml` rewrites `/landing/*` back to the real files. That's why the
Netlify app also responds at
`https://boisterous-pasca-94fd3c.netlify.app/landing`.
