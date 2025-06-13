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
window.console.error @ 117-d40287c62439107e.js:1
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
window.console.error @ 117-d40287c62439107e.js:1
onError @ page-16163115c92a822e.js:1
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
[PDF Export] PDF generation error: Error: The input directory "/var/task/.next/server/app/api/bin" does not exist.
    at c.executablePath (/var/task/.next/server/app/api/export-course-pdf/route.js:179:67636)
    at c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:803)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
[PDF Export] Error stack: Error: The input directory "/var/task/.next/server/app/api/bin" does not exist.
    at c.executablePath (/var/task/.next/server/app/api/export-course-pdf/route.js:179:67636)
    at c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:803)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)

    