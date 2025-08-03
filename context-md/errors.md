Error fetching credit data: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/credits/route.ts:22:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/credits?page=1&limit=50&search=&type=all&dateFrom=&dateTo= 500 in 1699ms
Error fetching credit data: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/credits/route.ts:22:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/credits?page=1&limit=50&search=&type=all&dateFrom=&dateTo= 500 in 448ms
Error fetching users: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/users/route.ts:23:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/users?page=1&limit=20&search=&plan=all&status=all 500 in 86ms
Error fetching users: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/users/route.ts:23:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/users?page=1&limit=20&search=&plan=all&status=all 500 in 38ms
Error fetching dashboard stats: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/dashboard-stats/route.ts:13:54)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/dashboard-stats 500 in 70ms
Error fetching dashboard stats: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/dashboard-stats/route.ts:13:54)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/dashboard-stats 500 in 29ms
GET /admin/subscriptions 200 in 342ms
Error fetching subscriptions: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/subscriptions/route.ts:20:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/subscriptions?page=1&limit=20&status=all&plan=all 500 in 78ms
Error fetching subscriptions: TypeError: supabase.from is not a function
at GET (webpack-internal:///(rsc)/./app/api/admin/subscriptions/route.ts:20:30)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57234
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:140:36
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NoopTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
at ProxyTracer.startActiveSpan (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:103
at NoopContextManager.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
at ContextAPI.with (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
at NextTracerImpl.trace (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/lib/trace/tracer.js:122:28)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:48896
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:40958)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47472
at AsyncLocalStorage.run (node:async_hooks:346:14)
at Object.wrap (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:38293)
at /Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:47434
at AsyncLocalStorage.run (node:async_hooks:346:14)
at eT.execute (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46881)
at eT.handle (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58771)
at doRender (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1366:60)
at cacheEntry.responseCache.get.routeKind (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1588:34)
at ResponseCache.get (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/response-cache/index.js:49:26)
at DevServer.renderToResponseWithComponentsImpl (/Users/firasbentaleb/Documents/mvp/courseforger/node_modules/next/dist/server/base-server.js:1496:53)
GET /api/admin/subscriptions?page=1&limit=20&status=all&plan=all 500 in 29ms
