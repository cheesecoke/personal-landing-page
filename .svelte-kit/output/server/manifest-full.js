export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".gitkeep","assets/California.svg","assets/colorado.svg","assets/fire.png","assets/palmtree.svg","assets/surfboard.svg"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.B9Pq49he.js",app:"_app/immutable/entry/app.BaDhKHeB.js",imports:["_app/immutable/entry/start.B9Pq49he.js","_app/immutable/chunks/DBDGkLTz.js","_app/immutable/chunks/clAPnsv-.js","_app/immutable/chunks/Do8BGvKP.js","_app/immutable/entry/app.BaDhKHeB.js","_app/immutable/chunks/Do8BGvKP.js","_app/immutable/chunks/clAPnsv-.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DRUGPdWd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
