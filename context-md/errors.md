# Deployed Version Erros 
## Console errors:
page-16163115c92a822e.js:1 
            
            
           POST https://mvp-ivory-three.vercel.app/api/export-course-pdf 500 (Internal Server Error)
v @ page-16163115c92a822e.js:1
z @ page-16163115c92a822e.js:1
a_ @ fd9d1056-898dbe322567f69b.js:1
aR @ fd9d1056-898dbe322567f69b.js:1
(anonymous) @ fd9d1056-898dbe322567f69b.js:1
sF @ fd9d1056-898dbe322567f69b.js:1
sM @ fd9d1056-898dbe322567f69b.js:1
(anonymous) @ fd9d1056-898dbe322567f69b.js:1
o4 @ fd9d1056-898dbe322567f69b.js:1
iV @ fd9d1056-898dbe322567f69b.js:1
sU @ fd9d1056-898dbe322567f69b.js:1
uR @ fd9d1056-898dbe322567f69b.js:1
uM @ fd9d1056-898dbe322567f69b.js:1
117-d40287c62439107e.js:1 PDF export error: Error: Server error occurred while generating PDF
    at v (page-16163115c92a822e.js:1:1575)
    at async z (page-16163115c92a822e.js:1:2910)
push.92304.window.console.error @ 117-d40287c62439107e.js:1
v @ page-16163115c92a822e.js:1
await in v
z @ page-16163115c92a822e.js:1
a_ @ fd9d1056-898dbe322567f69b.js:1
aR @ fd9d1056-898dbe322567f69b.js:1
(anonymous) @ fd9d1056-898dbe322567f69b.js:1
sF @ fd9d1056-898dbe322567f69b.js:1
sM @ fd9d1056-898dbe322567f69b.js:1
(anonymous) @ fd9d1056-898dbe322567f69b.js:1
o4 @ fd9d1056-898dbe322567f69b.js:1
iV @ fd9d1056-898dbe322567f69b.js:1
sU @ fd9d1056-898dbe322567f69b.js:1
uR @ fd9d1056-898dbe322567f69b.js:1
uM @ fd9d1056-898dbe322567f69b.js:1
117-d40287c62439107e.js:1 PDF export failed: Server error occurred while generating PDF
## vercel log errors:
[PDF Export] NODE_ENV: production
[PDF Export] Using puppeteer-core and @sparticuz/chromium (Production)
[PDF Export] Starting PDF generation for course 40af24cd-9ae9-4a62-b8bb-e18b9e824077 by user 97a00cf3-34ee-4249-9076-fd8312229244
[PDF Export] Fetching course data for course 40af24cd-9ae9-4a62-b8bb-e18b9e824077
[PDF Export] Course data fetched successfully: {
  title: 'Advanced Marketing Tactics',
  chaptersCount: 5,
  lessonsCount: 15
}
[PDF Export] Course data sorted, launching Puppeteer...
[PDF Export] Production executablePath: async executablePath(e){if(!0===(0,n.existsSync)("/tmp/chromium"))return Promise.resolve("/tmp/chromium");if(e&&(0,u.isValidUrl)(e))return this.executablePath(await (0,u.downloadAndExtract)(e));if(e??=(0,a.join)(__dirname,"..","bin"),!(0,n.existsSync)(e))throw Error(`The input directory "${e}" does not exist.`);let t=[o.default.inflate(`${e}/chromium.br`),o.default.inflate(`${e}/fonts.tar.br`),o.default.inflate(`${e}/swiftshader.tar.br`)];return(0,u.isRunningInAwsLambda)(h)&&t.push(o.default.inflate(`${e}/al2.tar.br`)),(0,u.isRunningInAwsLambdaNode20)(h)&&t.push(o.default.inflate(`${e}/al2023.tar.br`)),(await Promise.all(t)).shift()}
[PDF Export] Production args: --allow-pre-commit-input,--disable-background-networking,--disable-background-timer-throttling,--disable-backgrounding-occluded-windows,--disable-breakpad,--disable-client-side-phishing-detection,--disable-component-extensions-with-background-pages,--disable-component-update,--disable-default-apps,--disable-dev-shm-usage,--disable-extensions,--disable-hang-monitor,--disable-ipc-flooding-protection,--disable-popup-blocking,--disable-prompt-on-repost,--disable-renderer-backgrounding,--disable-sync,--enable-automation,--enable-blink-features=IdleDetection,--export-tagged-pdf,--force-color-profile=srgb,--metrics-recording-only,--no-first-run,--password-store=basic,--use-mock-keychain,--disable-domain-reliability,--disable-print-preview,--disable-speech-api,--disk-cache-size=33554432,--mute-audio,--no-default-browser-check,--no-pings,--single-process,--font-render-hinting=none,--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints,AudioServiceOutOfProcess,IsolateOrigins,site-per-process,--enable-features=NetworkServiceInProcess2,SharedArrayBuffer,--hide-scrollbars,--ignore-gpu-blocklist,--in-process-gpu,--window-size=1920,1080,--use-gl=angle,--use-angle=swiftshader,--enable-unsafe-swiftshader,--allow-running-insecure-content,--disable-setuid-sandbox,--disable-site-isolation-trials,--disable-web-security,--no-sandbox,--no-zygote,--headless='shell'
[PDF Export] Production headless: shell
[PDF Export] PDF generation error: Error: Browser was not found at the configured executablePath (async executablePath(e){if(!0===(0,n.existsSync)("/tmp/chromium"))return Promise.resolve("/tmp/chromium");if(e&&(0,u.isValidUrl)(e))return this.executablePath(await (0,u.downloadAndExtract)(e));if(e??=(0,a.join)(__dirname,"..","bin"),!(0,n.existsSync)(e))throw Error(`The input directory "${e}" does not exist.`);let t=[o.default.inflate(`${e}/chromium.br`),o.default.inflate(`${e}/fonts.tar.br`),o.default.inflate(`${e}/swiftshader.tar.br`)];return(0,u.isRunningInAwsLambda)(h)&&t.push(o.default.inflate(`${e}/al2.tar.br`)),(0,u.isRunningInAwsLambdaNode20)(h)&&t.push(o.default.inflate(`${e}/al2023.tar.br`)),(await Promise.all(t)).shift()})
    at ChromeLauncher.launch (/var/task/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
    at async c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:998)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
    at async r9.renderToResponseImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5680)
[PDF Export] Error stack: Error: Browser was not found at the configured executablePath (async executablePath(e){if(!0===(0,n.existsSync)("/tmp/chromium"))return Promise.resolve("/tmp/chromium");if(e&&(0,u.isValidUrl)(e))return this.executablePath(await (0,u.downloadAndExtract)(e));if(e??=(0,a.join)(__dirname,"..","bin"),!(0,n.existsSync)(e))throw Error(`The input directory "${e}" does not exist.`);let t=[o.default.inflate(`${e}/chromium.br`),o.default.inflate(`${e}/fonts.tar.br`),o.default.inflate(`${e}/swiftshader.tar.br`)];return(0,u.isRunningInAwsLambda)(h)&&t.push(o.default.inflate(`${e}/al2.tar.br`)),(0,u.isRunningInAwsLambdaNode20)(h)&&t.push(o.default.inflate(`${e}/al2023.tar.br`)),(await Promise.all(t)).shift()})
    at ChromeLauncher.launch (/var/task/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
    at async c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:998)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
    at async r9.renderToResponseImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5680)
