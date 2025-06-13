[PDF Export] Starting PDF generation for course eb1609c2-ed72-4e1c-bb45-6538660fbe2b by user 555fb621-481b-491d-8ce8-dcfea1035763
[PDF Export] Fetching course data for course eb1609c2-ed72-4e1c-bb45-6538660fbe2b
[PDF Export] Course data fetched successfully: {
  title: "A Beginner's Guide to Falconry",
  chaptersCount: 5,
  lessonsCount: 25
}
[PDF Export] Course data sorted, launching Puppeteer...
[PDF Export] PDF generation error: Error: Browser was not found at the configured executablePath (async executablePath(input) {
        /**
         * If the `chromium` binary already exists in /tmp/chromium, return it.
         */
        if ((0, node_fs_1.existsSync)("/tmp/chromium") === true) {
            return Promise.resolve("/tmp/chromium");
        }
        /**
         * If input is a valid URL, download and extract the file. It will extract to /tmp/chromium-pack
         * and executablePath will be recursively called on that location, which will then extract
         * the brotli files to the correct locations
         */
        if (input && (0, helper_1.isValidUrl)(input)) {
            return this.executablePath(await (0, helper_1.downloadAndExtract)(input));
        }
        /**
         * If input is defined, use that as the location of the brotli files,
         * otherwise, the default location is ../bin.
         * A custom location is needed for workflows that using custom packaging.
         */
        input ??= (0, node_path_1.join)(__dirname, "..", "bin");
        /**
         * If the input directory doesn't exist, throw an error.
         */
        if (!(0, node_fs_1.existsSync)(input)) {
            throw new Error(`The input directory "${input}" does not exist.`);
        }
        // Extract the required files
        const promises = [
            lambdafs_1.default.inflate(`${input}/chromium.br`),
            lambdafs_1.default.inflate(`${input}/fonts.tar.br`),
            lambdafs_1.default.inflate(`${input}/swiftshader.tar.br`),
        ];
        if ((0, helper_1.isRunningInAwsLambda)(nodeMajorVersion)) {
            // If running in AWS Lambda, extract more required files
            promises.push(lambdafs_1.default.inflate(`${input}/al2.tar.br`));
        }
        if ((0, helper_1.isRunningInAwsLambdaNode20)(nodeMajorVersion)) {
            promises.push(lambdafs_1.default.inflate(`${input}/al2023.tar.br`));
        }
        // Await all extractions
        const result = await Promise.all(promises);
        // Returns the first result of the promise, which is the location of the `chromium` binary
        return result.shift();
    })
    at ChromeLauncher.launch (file:///Users/firasbentaleb/Documents/mvp/courseforger/node_modules/puppeteer-core/lib/esm/puppeteer/node/BrowserLauncher.js:53:19)
    at async POST (webpack-internal:///(rsc)/./app/api/export-course-pdf/route.ts:107:19)
    at async /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228
    at async eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)
    at async eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)
    at async doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:42)
    at async cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:28)
    at async DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:28)
    at async DevServer.renderPageComponent (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1962:32)
    at async DevServer.pipeImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/next-server.js:272:17)
    at async DevServer.handleRequestImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:818:17)
    at async /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/dev/next-dev-server.js:339:20
    at async Span.traceAsyncFn (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/trace/trace.js:154:20)
    at async DevServer.handleRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
    at async invokeRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:178:21)
    at async handleRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:355:24)
    at async requestHandlerImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:379:13)
    at async Server.requestListener (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/start-server.js:141:13)
[PDF Export] Error stack: Error: Browser was not found at the configured executablePath (async executablePath(input) {
        /**
         * If the `chromium` binary already exists in /tmp/chromium, return it.
         */
        if ((0, node_fs_1.existsSync)("/tmp/chromium") === true) {
            return Promise.resolve("/tmp/chromium");
        }
        /**
         * If input is a valid URL, download and extract the file. It will extract to /tmp/chromium-pack
         * and executablePath will be recursively called on that location, which will then extract
         * the brotli files to the correct locations
         */
        if (input && (0, helper_1.isValidUrl)(input)) {
            return this.executablePath(await (0, helper_1.downloadAndExtract)(input));
        }
        /**
         * If input is defined, use that as the location of the brotli files,
         * otherwise, the default location is ../bin.
         * A custom location is needed for workflows that using custom packaging.
         */
        input ??= (0, node_path_1.join)(__dirname, "..", "bin");
        /**
         * If the input directory doesn't exist, throw an error.
         */
        if (!(0, node_fs_1.existsSync)(input)) {
            throw new Error(`The input directory "${input}" does not exist.`);
        }
        // Extract the required files
        const promises = [
            lambdafs_1.default.inflate(`${input}/chromium.br`),
            lambdafs_1.default.inflate(`${input}/fonts.tar.br`),
            lambdafs_1.default.inflate(`${input}/swiftshader.tar.br`),
        ];
        if ((0, helper_1.isRunningInAwsLambda)(nodeMajorVersion)) {
            // If running in AWS Lambda, extract more required files
            promises.push(lambdafs_1.default.inflate(`${input}/al2.tar.br`));
        }
        if ((0, helper_1.isRunningInAwsLambdaNode20)(nodeMajorVersion)) {
            promises.push(lambdafs_1.default.inflate(`${input}/al2023.tar.br`));
        }
        // Await all extractions
        const result = await Promise.all(promises);
        // Returns the first result of the promise, which is the location of the `chromium` binary
        return result.shift();
    })
    at ChromeLauncher.launch (file:///Users/firasbentaleb/Documents/mvp/courseforger/node_modules/puppeteer-core/lib/esm/puppeteer/node/BrowserLauncher.js:53:19)
    at async POST (webpack-internal:///(rsc)/./app/api/export-course-pdf/route.ts:107:19)
    at async /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228
    at async eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)
    at async eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)
    at async doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:42)
    at async cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:28)
    at async DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:28)
    at async DevServer.renderPageComponent (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1962:32)
    at async DevServer.pipeImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:922:25)
    at async NextNodeServer.handleCatchallRenderRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/next-server.js:272:17)
    at async DevServer.handleRequestImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:818:17)
    at async /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/dev/next-dev-server.js:339:20
    at async Span.traceAsyncFn (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/trace/trace.js:154:20)
    at async DevServer.handleRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
    at async invokeRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:178:21)
    at async handleRequest (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:355:24)
    at async requestHandlerImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/router-server.js:379:13)
    at async Server.requestListener (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/start-server.js:141:13)
 POST /api/export-course-pdf 500 in 3668ms
