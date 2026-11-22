# SEO and site discovery

AniBoop uses the Next.js App Router Metadata API and file conventions. The homepage is the single public page. The catalog, component guide, and credits open inside the gallery.

## Production origin

Set `ANIBOOP_URL=https://aniboop.nmrisrl.dev` in the production build environment. This is AniBoop's official public URL and the canonical origin shared by the homepage metadata and discovery routes. Use the origin with an optional trailing slash. The build rejects a configured production value with a path, query, fragment, or credentials. Rebuild and redeploy when the origin changes because Next.js prerenders the homepage and discovery routes.

In the AniBoop project on Vercel, go to **Settings → Environment Variables**, add `ANIBOOP_URL` with the official URL as its value, select **Production** only, and deploy. Local development can leave it unset. The app also checks `VERCEL_ENV` when Vercel exposes it. On other hosts, leave `ANIBOOP_URL` unset in staging and preview builds.

| Environment                                                  | Homepage                                                      | Sitemap                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------- |
| Production build with `ANIBOOP_URL`                          | Canonical URL, `index, follow`, and `WebSite` structured data | Lists the homepage and is advertised in `robots.txt` |
| `next dev`, Vercel previews, or builds without `ANIBOOP_URL` | `noindex, follow`                                             | Returns 404 and is omitted from `robots.txt`         |

`robots.txt` allows crawling in both cases so search crawlers can read the homepage's robots meta tag. Use deployment access controls for private previews. See [Google's robots meta tag documentation](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) and [Vercel's system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Backup access on Vercel

AniBoop's official hostname, `aniboop.nmrisrl.dev`, is a subdomain of `nmrisrl.dev`. A problem with the parent domain's registration or DNS delegation can affect the subdomain even while the Vercel deployment is healthy.

**Live status checked November 22, 2026.** Both `aniboop.nmrisrl.dev` and `aniboop.vercel.app` returned `200` directly.

In AniBoop's **Domains** settings in Vercel, keep both hostnames connected to **Production** with direct access. If the backup returns a redirect to the official URL, change it back to a domain connected to Production. Keep `ANIBOOP_URL` pointed at the official URL so both hostnames serve the same canonical metadata. See [Vercel's domain configuration](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting) and [Google's canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Check both responses without following redirects.

```powershell
curl.exe -sSI https://aniboop.nmrisrl.dev/
curl.exe -sSI https://aniboop.vercel.app/
```

Expect `200` on both domains. Open the backup URL in a fresh browser session and boop a character to check that its assets load. If a browser still follows the old permanent redirect, test in a private window or clear its cached redirect.

If the official hostname stops resolving or fails TLS, the browser cannot reach Vercel to receive a redirect. Share `https://aniboop.vercel.app` during the outage. Both domains share the same Vercel project, so the backup covers problems with the custom domain while the Vercel deployment is healthy. During a temporary outage, keep `ANIBOOP_URL` set to the official domain. After restoring the parent domain or subdomain, verify HTTPS and a `200` response from the official URL before directing visitors back. If the backup becomes the permanent public address, update `ANIBOOP_URL` and redeploy so the canonical tags and sitemap follow it.

## What to edit

| Output                                                       | Source and maintenance                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title, description, application name, language, and keywords | Edit [brand copy](../src/lib/brand.ts). The [root layout](../src/app/layout.tsx) supplies the shared defaults and robots meta tag. The [homepage](../src/app/page.tsx) sets its keywords and canonical URL.                                                                                                   |
| Open Graph and X (Twitter) cards                             | The [homepage metadata](../src/app/page.tsx) sets card text. Replace the [static 1200 × 630 PNG](../src/app/opengraph-image.png) and update its [alt text](../src/app/opengraph-image.alt.txt) when the artwork changes.                                                                                      |
| `/robots.txt` and `/sitemap.xml`                             | Edit [robots.ts](../src/app/robots.ts) for crawl rules and [sitemap.ts](../src/app/sitemap.ts) when a new canonical public page ships. Use absolute URLs. Add `lastModified` only when the page has a trustworthy content update date.                                                                        |
| `/llms.txt`                                                  | Edit the [Route Handler](../src/app/llms.txt/route.ts) when the gallery's capabilities or public links change. It serves a Markdown summary as UTF-8 plain text and includes the gallery link on indexable builds.                                                                                            |
| `/manifest.webmanifest`                                      | Edit [manifest.ts](../src/app/manifest.ts) for the standalone launch settings and colors. It uses the shared name, description, and language, plus regular and maskable PNGs in [public/icons](../public/icons). The favicon, browser icon, and Apple touch icon use separate [App Router files](../src/app). |
| JSON-LD                                                      | The [homepage](../src/app/page.tsx) renders a Schema.org `WebSite` object with the same name, description, language, and canonical URL. It escapes `<` during serialization before embedding the JSON in HTML.                                                                                                |

Use search topics such as “chibi anime characters” and “anime mascots” naturally in the title and description where they fit. Google Search ignores the keywords meta tag. See [Google's supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags#unsupported-tags-and-attributes).

`llms.txt` follows a proposal for giving agents a brief site overview and relevant links. Crawler access is governed by `robots.txt` and deployment access controls. See the [llms.txt proposal](https://llmstxt.org/).

Next.js prerenders this Route Handler at build time. It reads shared brand copy and the production origin, with no request-time data or revalidation interval. A production build lists `/llms.txt` as static. A checked-in `public/llms.txt` would also be static, but its links and copy would need to be maintained by hand. Both forms still use CDN requests and transfer bytes each time a client fetches them. See [Vercel's CDN usage documentation](https://vercel.com/docs/manage-cdn-usage).

## Verify a build

Set the origin in the same shell before building. Use a reserved example origin for local checks.

```powershell
$env:ANIBOOP_URL = 'https://aniboop.example'
npm.cmd run build
npm.cmd run start
```

From a second terminal, inspect the homepage HTML and the discovery endpoints.

```powershell
curl.exe -fsS http://localhost:3000/
curl.exe -fsS http://localhost:3000/robots.txt
curl.exe -fsS http://localhost:3000/sitemap.xml
curl.exe -fsS http://localhost:3000/llms.txt
curl.exe -fsS http://localhost:3000/manifest.webmanifest
```

- Check the HTML for one title, description, canonical, and robots tag. Check the keywords, `og:*`, and `twitter:*` tags, and fetch the advertised image path from the same server to verify it serves a PNG.
- Compare the canonical URL, `og:url`, sitemap entry, `llms.txt` gallery link, and JSON-LD `url`. Check the two regular icons and the maskable icon listed by the manifest.
- Repeat without `ANIBOOP_URL` to confirm `noindex, follow`, a 404 from `/sitemap.xml`, and no sitemap directive in `robots.txt`.
- After deployment, repeat the checks against the public HTTPS origin. Use URL Inspection and submit `/sitemap.xml` in Search Console. Validate the `WebSite` object with the Schema Markup Validator. See [Google's sitemap instructions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) and the [Schema Markup Validator](https://validator.schema.org/).
