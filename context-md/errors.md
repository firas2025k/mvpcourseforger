# the glitch explanation 

Apparently so the course anything that works so I can edit the lesson content but when I save and recipes or any visit the course again that lesson that they edited actually disappears from the course course page is no longer there I was up at eight under the glass in one I referred the patient doesn't one is gone just the course starts on shows lesson to lesson one is no longer showing 

# Terminal log

 PUT /api/lesson-content 200 in 433ms
 GET /api/lesson-progress?courseId=eb1609c2-ed72-4e1c-bb45-6538660fbe2b 200 in 308ms
 GET /api/lesson-progress?courseId=eb1609c2-ed72-4e1c-bb45-6538660fbe2b 200 in 259ms
 GET /dashboard/courses/eb1609c2-ed72-4e1c-bb45-6538660fbe2b 200 in 1493ms
 GET /favicon.ico 200 in 53ms
 GET /api/lesson-progress?courseId=eb1609c2-ed72-4e1c-bb45-6538660fbe2b 200 in 411ms
 GET /api/lesson-progress?courseId=eb1609c2-ed72-4e1c-bb45-6538660fbe2b 200 in 225ms
 GET /api/lesson-progress?courseId=9912afc0-0b88-4b0a-8320-191f29609369 200 in 266ms
 GET /api/lesson-progress?courseId=9912afc0-0b88-4b0a-8320-191f29609369 200 in 291ms
 PUT /api/lesson-content 200 in 403ms
 PUT /api/lesson-content 200 in 409ms
 PUT /api/lesson-content 200 in 439ms
 PUT /api/lesson-content 200 in 445ms
 PUT /api/lesson-content 200 in 396ms
 GET /dashboard/courses/9912afc0-0b88-4b0a-8320-191f29609369 200 in 585ms
 GET /favicon.ico 200 in 25ms
 GET /api/lesson-progress?courseId=9912afc0-0b88-4b0a-8320-191f29609369 200 in 209ms
 GET /api/lesson-progress?courseId=9912afc0-0b88-4b0a-8320-191f29609369 200 in 220ms
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 41ms
 PUT /api/lesson-content 200 in 528ms
 PUT /api/lesson-content 200 in 463ms

# browser console output
RichTextEditor.tsx:39 Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.
getInitialEditor @ index.js:985
EditorInstanceManager @ index.js:960
eval @ index.js:1166
mountStateImpl @ react-dom.development.js:12062
mountState @ react-dom.development.js:12085
useState @ react-dom.development.js:13334
useState @ react.development.js:2509
useEditor @ index.js:1166
RichTextEditor @ RichTextEditor.tsx:39
renderWithHooks @ react-dom.development.js:11121
mountIndeterminateComponent @ react-dom.development.js:16869
beginWork$1 @ react-dom.development.js:18458
beginWork @ react-dom.development.js:26927
performUnitOfWork @ react-dom.development.js:25748
workLoopSync @ react-dom.development.js:25464
renderRootSync @ react-dom.development.js:25419
performSyncWorkOnRoot @ react-dom.development.js:24887
flushSyncWorkAcrossRoots_impl @ react-dom.development.js:7758
flushSyncWorkOnAllRoots @ react-dom.development.js:7718
processRootScheduleInMicrotask @ react-dom.development.js:7863
eval @ react-dom.development.js:8034
RichTextEditor.tsx:39 Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.

# hooks/useAutoSave.ts Error
Expected 1 arguments, but got 0.ts(2554)
for this line :   const timeoutRef = useRef<NodeJS.Timeout>();
# app/api/lesson-content/route.ts Error 
on this line :     const courseUserId = lesson.chapters.courses.user_id;
Property 'courses' does not exist on type '{ id: any; course_id: any; courses: { id: any; user_id: any; }[]; }[]'.ts