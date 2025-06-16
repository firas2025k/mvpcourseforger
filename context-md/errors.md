# Vercel build  Errors Log
[12:33:59.278] Running build in Washington, D.C., USA (East) – iad1
[12:33:59.278] Build machine configuration: 2 cores, 8 GB
[12:33:59.293] Cloning github.com/firas2025k/mvpcourseforger (Branch: main, Commit: 2dabc2b)
[12:33:59.800] Cloning completed: 507.000ms
[12:34:03.281] Restored build cache from previous deployment (G3QzYn44BB3aW2mwMvunQmQzhKa8)
[12:34:04.107] Running "vercel build"
[12:34:04.630] Vercel CLI 42.2.0
[12:34:04.950] Installing dependencies...
[12:34:07.041] 
[12:34:07.042] added 8 packages in 2s
[12:34:07.043] 
[12:34:07.043] 282 packages are looking for funding
[12:34:07.043]   run `npm fund` for details
[12:34:07.074] Detected Next.js version: 14.2.29
[12:34:07.080] Running "npm run build"
[12:34:07.272] 
[12:34:07.273] > build
[12:34:07.273] > next build
[12:34:07.273] 
[12:34:07.963]   ▲ Next.js 14.2.29
[12:34:07.965] 
[12:34:08.033]    Creating an optimized production build ...
[12:34:20.525]  ⚠ Compiled with warnings
[12:34:20.525] 
[12:34:20.525] ./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
[12:34:20.525] Critical dependency: the request of a dependency is an expression
[12:34:20.525] 
[12:34:20.525] Import trace for requested module:
[12:34:20.525] ./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
[12:34:20.526] ./node_modules/@supabase/realtime-js/dist/main/index.js
[12:34:20.526] ./node_modules/@supabase/supabase-js/dist/module/index.js
[12:34:20.526] ./node_modules/@supabase/ssr/dist/module/createServerClient.js
[12:34:20.526] ./node_modules/@supabase/ssr/dist/module/index.js
[12:34:20.526] ./app/actions/search.ts
[12:34:20.526] 
[12:34:31.014]  ✓ Compiled successfully
[12:34:31.015]    Skipping validation of types
[12:34:31.016]    Skipping linting
[12:34:31.273]    Collecting page data ...
[12:34:31.756] [PDF Export] NODE_ENV: production
[12:34:31.884] [PDF Export] Using puppeteer-core and @sparticuz/chromium (Production)
[12:34:33.661]    Generating static pages (0/29) ...
[12:34:35.032]    Generating static pages (7/29) 
[12:34:35.144]    Generating static pages (14/29) 
[12:34:35.814]    Generating static pages (21/29) 
[12:34:35.927]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/dashboard/courses/new". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[12:34:35.928]     at o (/vercel/path0/.next/server/chunks/4942.js:1:11071)
[12:34:35.928]     at c (/vercel/path0/.next/server/chunks/4942.js:1:22054)
[12:34:35.928]     at m (/vercel/path0/.next/server/chunks/7898.js:1:788)
[12:34:35.928]     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
[12:34:35.929]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
[12:34:35.929]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:35.929]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:35.929]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:58561)
[12:34:35.929]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:35.929]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:35.929] 
[12:34:35.929] Error occurred prerendering page "/dashboard/courses/new". Read more: https://nextjs.org/docs/messages/prerender-error
[12:34:35.930] 
[12:34:35.962]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/dashboard/courses/preview". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[12:34:35.962]     at o (/vercel/path0/.next/server/chunks/4942.js:1:11071)
[12:34:35.963]     at c (/vercel/path0/.next/server/chunks/4942.js:1:22054)
[12:34:35.963]     at m (/vercel/path0/.next/server/chunks/7898.js:1:788)
[12:34:35.963]     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
[12:34:35.963]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
[12:34:35.964]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:35.964]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:35.964]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:58561)
[12:34:35.964]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:35.965]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:35.965] 
[12:34:35.965] Error occurred prerendering page "/dashboard/courses/preview". Read more: https://nextjs.org/docs/messages/prerender-error
[12:34:35.965] 
[12:34:36.000]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/dashboard". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[12:34:36.001]     at o (/vercel/path0/.next/server/chunks/4942.js:1:11071)
[12:34:36.002]     at c (/vercel/path0/.next/server/chunks/4942.js:1:22054)
[12:34:36.002]     at m (/vercel/path0/.next/server/chunks/7898.js:1:788)
[12:34:36.006]     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
[12:34:36.006]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
[12:34:36.006]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:36.007]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:36.007]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:58561)
[12:34:36.007]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:36.008]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:36.008] 
[12:34:36.008] Error occurred prerendering page "/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error
[12:34:36.009] 
[12:34:36.027]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/dashboard/settings". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[12:34:36.027]     at o (/vercel/path0/.next/server/chunks/4942.js:1:11071)
[12:34:36.027]     at c (/vercel/path0/.next/server/chunks/4942.js:1:22054)
[12:34:36.027]     at m (/vercel/path0/.next/server/chunks/7898.js:1:788)
[12:34:36.027]     at nj (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
[12:34:36.027]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
[12:34:36.027]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:36.027]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:36.027]     at nM (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:58561)
[12:34:36.028]     at nN (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
[12:34:36.028]     at nB (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
[12:34:36.028] 
[12:34:36.028] Error occurred prerendering page "/dashboard/settings". Read more: https://nextjs.org/docs/messages/prerender-error
[12:34:36.028] 
[12:34:36.095] Failed to load plans for PricingPage: n [Error]: Dynamic server usage: Route /pricing couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
[12:34:36.096]     at l (/vercel/path0/.next/server/chunks/8948.js:1:37220)
[12:34:36.096]     at f (/vercel/path0/.next/server/chunks/9702.js:5:9175)
[12:34:36.096]     at o (/vercel/path0/.next/server/app/pricing/page.js:1:17184)
[12:34:36.096]     at l (/vercel/path0/.next/server/app/pricing/page.js:1:17819)
[12:34:36.096]     at eh (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:134660)
[12:34:36.096]     at e (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:137545)
[12:34:36.096]     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:138019)
[12:34:36.096]     at Array.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135629)
[12:34:36.096]     at stringify (<anonymous>)
[12:34:36.096]     at eP (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142093) {
[12:34:36.096]   description: "Route /pricing couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
[12:34:36.096]   digest: 'DYNAMIC_SERVER_USAGE'
[12:34:36.096] }
[12:34:36.097] Failed to load plans for PricingPage: n [Error]: Dynamic server usage: Route /pricing couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
[12:34:36.097]     at l (/vercel/path0/.next/server/chunks/8948.js:1:37220)
[12:34:36.097]     at f (/vercel/path0/.next/server/chunks/9702.js:5:9175)
[12:34:36.097]     at o (/vercel/path0/.next/server/app/pricing/page.js:1:17184)
[12:34:36.097]     at l (/vercel/path0/.next/server/app/pricing/page.js:1:17819)
[12:34:36.097]     at eh (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:134660)
[12:34:36.097]     at e (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:137545)
[12:34:36.097]     at ek (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:138019)
[12:34:36.097]     at Array.toJSON (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135629)
[12:34:36.097]     at stringify (<anonymous>)
[12:34:36.097]     at eP (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142093) {
[12:34:36.098]   description: "Route /pricing couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
[12:34:36.098]   digest: 'DYNAMIC_SERVER_USAGE'
[12:34:36.098] }
[12:34:36.125]  ✓ Generating static pages (29/29)
[12:34:36.134] 
[12:34:36.138] > Export encountered errors on following paths:
[12:34:36.138] 	/dashboard/courses/new/page: /dashboard/courses/new
[12:34:36.138] 	/dashboard/courses/preview/page: /dashboard/courses/preview
[12:34:36.138] 	/dashboard/page: /dashboard
[12:34:36.138] 	/dashboard/settings/page: /dashboard/settings
[12:34:36.181] Error: Command "npm run build" exited with 1
[12:34:36.681] 
[12:34:39.748] Exiting build container