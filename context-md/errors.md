npm run build

> build
> next build

▲ Next.js 14.2.29

- Environments: .env.local

Creating an optimized production build ...
⚠ For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended. Run 'npm i sharp', and Next.js will use it automatically for Image Optimization.
Read more: https://nextjs.org/docs/messages/sharp-missing-in-production
⚠ Compiled with warnings

./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
./node_modules/@supabase/realtime-js/dist/main/index.js
./node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
./node_modules/@supabase/ssr/dist/module/index.js
./app/actions/search.ts

<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (100kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
⚠ Compiled with warnings

./lib/supabase/middleware.ts
Attempted import error: 'hasEnvVars' is not exported from '../utils' (imported as 'hasEnvVars').

Import trace for requested module:
./lib/supabase/middleware.ts

⚠ For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended. Run 'npm i sharp', and Next.js will use it automatically for Image Optimization.
Read more: https://nextjs.org/docs/messages/sharp-missing-in-production
✓ Compiled successfully
Skipping validation of types
Skipping linting
Collecting page data .[PDF Export] NODE_ENV: production
Collecting page data ..[PDF Export] Using puppeteer-core and @sparticuz/chromium (Production)
✓ Collecting page data  
 Generating static pages (8/48) [ ==]Error in credit transactions API: n [Error]: Dynamic server usage: Route /api/user/credit-transactions couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
at l (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/chunks/8948.js:1:37220)
at u (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/chunks/7234.js:6:96718)
at p (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/app/api/user/credit-transactions/route.js:1:1649)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103 {
description: "Route /api/user/credit-transactions couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
digest: 'DYNAMIC_SERVER_USAGE'
}
Generating static pages (30/48) [== ] ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/auth/verify-otp". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
at o (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/chunks/9840.js:1:11071)
at c (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/chunks/9840.js:1:22054)
at x (/Users/firasbentaleb/Documents/mvp/courseforger/.next/server/app/auth/verify-otp/page.js:1:3898)
at nj (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
at nM (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
at nN (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
at nI (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47011)
at nM (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47718)
at nM (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
at nN (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)

Error occurred prerendering page "/auth/verify-otp". Read more: https://nextjs.org/docs/messages/prerender-error

✓ Generating static pages (48/48)

> Export encountered errors on following paths:

        /auth/verify-otp/page: /auth/verify-otp
