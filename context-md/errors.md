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
[PDF Export] Starting PDF generation for course 82e85e99-a84b-4e13-a397-c1af2ec37fe0 by user 97a00cf3-34ee-4249-9076-fd8312229244
[PDF Export] Fetching course data for course 82e85e99-a84b-4e13-a397-c1af2ec37fe0
[PDF Export] Course data fetched successfully: {
  title: 'Introduction to Digital Marketing',
  chaptersCount: 3,
  lessonsCount: 9
}
[PDF Export] Course data sorted, launching Puppeteer...
[PDF Export] PDF generation error: Error: Browser was not found at the configured executablePath (async executablePath(e){if(!0===(0,n.existsSync)("/tmp/chromium"))return Promise.resolve("/tmp/chromium");if(e&&(0,l.isValidUrl)(e))return this.executablePath(await (0,l.downloadAndExtract)(e));if(e??=(0,a.join)(__dirname,"..","bin"),!(0,n.existsSync)(e))throw Error(`The input directory "${e}" does not exist.`);let t=[o.default.inflate(`${e}/chromium.br`),o.default.inflate(`${e}/fonts.tar.br`),o.default.inflate(`${e}/swiftshader.tar.br`)];return(0,l.isRunningInAwsLambda)(h)&&t.push(o.default.inflate(`${e}/al2.tar.br`)),(0,l.isRunningInAwsLambdaNode20)(h)&&t.push(o.default.inflate(`${e}/al2023.tar.br`)),(await Promise.all(t)).shift()})
    at ChromeLauncher.launch (/var/task/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
    at async c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:741)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
    at async r9.renderToResponseImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5680)
[PDF Export] Error stack: Error: Browser was not found at the configured executablePath (async executablePath(e){if(!0===(0,n.existsSync)("/tmp/chromium"))return Promise.resolve("/tmp/chromium");if(e&&(0,l.isValidUrl)(e))return this.executablePath(await (0,l.downloadAndExtract)(e));if(e??=(0,a.join)(__dirname,"..","bin"),!(0,n.existsSync)(e))throw Error(`The input directory "${e}" does not exist.`);let t=[o.default.inflate(`${e}/chromium.br`),o.default.inflate(`${e}/fonts.tar.br`),o.default.inflate(`${e}/swiftshader.tar.br`)];return(0,l.isRunningInAwsLambda)(h)&&t.push(o.default.inflate(`${e}/al2.tar.br`)),(0,l.isRunningInAwsLambdaNode20)(h)&&t.push(o.default.inflate(`${e}/al2023.tar.br`)),(await Promise.all(t)).shift()})
    at ChromeLauncher.launch (/var/task/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:89:19)
    at async c (/var/task/.next/server/app/api/export-course-pdf/route.js:23:741)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)
    at async en (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25561)
    at async ea.responseCache.get.routeKind (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:1028)
    at async r9.renderToResponseWithComponentsImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:508)
    at async r9.renderPageComponent (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5102)
    at async r9.renderToResponseImpl (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:17:5680)

    
# Local envirenoment:
the pdf genertes just fines however 

on the app/api/export-course-pdf/route.ts i got 8 errors
[{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'puppeteer' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 146,
	"startColumn": 23,
	"endLineNumber": 146,
	"endColumn": 32
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'chromium' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 142,
	"startColumn": 19,
	"endLineNumber": 142,
	"endColumn": 27
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'chromium' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 141,
	"startColumn": 31,
	"endLineNumber": 141,
	"endColumn": 39
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'chromium' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 140,
	"startColumn": 26,
	"endLineNumber": 140,
	"endColumn": 34
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'chromium' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 139,
	"startColumn": 15,
	"endLineNumber": 139,
	"endColumn": 23
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7005",
	"severity": 8,
	"message": "Variable 'puppeteer' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 138,
	"startColumn": 23,
	"endLineNumber": 138,
	"endColumn": 32
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7034",
	"severity": 8,
	"message": "Variable 'chromium' implicitly has type 'any' in some locations where its type cannot be determined.",
	"source": "ts",
	"startLineNumber": 6,
	"startColumn": 5,
	"endLineNumber": 6,
	"endColumn": 13
},{
	"resource": "/Users/firasbentaleb/Documents/mvp/courseforger/app/api/export-course-pdf/route.ts",
	"owner": "typescript",
	"code": "7034",
	"severity": 8,
	"message": "Variable 'puppeteer' implicitly has type 'any' in some locations where its type cannot be determined.",
	"source": "ts",
	"startLineNumber": 5,
	"startColumn": 5,
	"endLineNumber": 5,
	"endColumn": 14
}]