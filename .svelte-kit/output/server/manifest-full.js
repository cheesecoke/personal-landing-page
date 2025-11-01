export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".gitkeep"]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.B9LHMY4d.js",app:"_app/immutable/entry/app.CdYVmyD0.js",imports:["_app/immutable/entry/start.B9LHMY4d.js","_app/immutable/chunks/C0Z9EkCx.js","_app/immutable/chunks/0zI27RYH.js","_app/immutable/chunks/d0ocvrNj.js","_app/immutable/chunks/C5ImsJsd.js","_app/immutable/entry/app.CdYVmyD0.js","_app/immutable/chunks/d0ocvrNj.js","_app/immutable/chunks/0zI27RYH.js","_app/immutable/chunks/C5ImsJsd.js","_app/immutable/chunks/CWj6FrbW.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
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
