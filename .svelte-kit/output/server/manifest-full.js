export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.s9-bWnQr.js",app:"_app/immutable/entry/app.C8QuGGII.js",imports:["_app/immutable/entry/start.s9-bWnQr.js","_app/immutable/chunks/Uz7V07a2.js","_app/immutable/chunks/ZyFKe9iZ.js","_app/immutable/entry/app.C8QuGGII.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/ZyFKe9iZ.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/contacts",
				pattern: /^\/api\/contacts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/contacts/_server.js'))
			},
			{
				id: "/api/messages",
				pattern: /^\/api\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/messages/_server.js'))
			},
			{
				id: "/api/whatsapp/send-message",
				pattern: /^\/api\/whatsapp\/send-message\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/whatsapp/send-message/_server.js'))
			},
			{
				id: "/chat",
				pattern: /^\/chat\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/database",
				pattern: /^\/database\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/groups",
				pattern: /^\/groups\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
