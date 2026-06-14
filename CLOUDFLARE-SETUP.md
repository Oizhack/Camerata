# Serving the registration app at `<domain>/landing` via Cloudflare

The camerata website's domain is on **Cloudflare**. We want the registration
landing page (hosted separately on Netlify) to appear at:

    https://<the-camerata-domain>/landing

…while the website **root `/` and every other path stays on the existing site,
untouched.** DNS alone can't do this (DNS maps a whole hostname to one server,
it has no concept of paths), but Cloudflare can, with a small Worker that
reverse-proxies only the `/landing` paths to Netlify.

## What you need first
- The Netlify URL of the registration app, e.g. `https://something.netlify.app`
  (replace `YOUR-SITE.netlify.app` below with it).
- Access to the Cloudflare dashboard for the camerata domain.

## Steps (Cloudflare dashboard)

1. Go to the Cloudflare account → select the camerata domain.
2. Left sidebar → **Workers & Pages** → **Create application** → **Create Worker**.
3. Name it e.g. `landing-proxy`, click **Deploy**, then **Edit code**.
4. Replace the code with this (change `YOUR-SITE.netlify.app` to the real
   Netlify hostname — no `https://`, no trailing slash):

   ```js
   const NETLIFY_HOST = "YOUR-SITE.netlify.app";

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
6. Go back to the Worker → **Settings** → **Triggers** (or **Domains & Routes**)
   → **Add route**. Set the route to:

       <the-camerata-domain>/landing*

   and select the camerata domain as the zone. Save.

That's it. `https://<the-camerata-domain>/landing` now serves the Netlify app
with the URL staying on the camerata domain; everything else on the site is
unaffected.

## How to verify
- Visit `https://<the-camerata-domain>/landing` → the registration page loads,
  all images and the concert counter work, URL bar stays on the camerata domain.
- Visit `https://<the-camerata-domain>/` → the existing website, unchanged.

## Note for the Netlify side (already done in this repo)
The app is configured to live under `/landing`: asset/script references use
`/landing/...` paths and `netlify.toml` rewrites `/landing/*` back to the real
files. So the Netlify app also works at `https://YOUR-SITE.netlify.app/landing`
— good for testing before the Cloudflare route is added.
