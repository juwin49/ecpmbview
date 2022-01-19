module.exports = {
	mode: 'spa',
	srcDir: 'client/', //指定自定义项目目录
	homePage: "/", //初始页面
	loginPage: "/login",
	head: {title: 'hainan-handle'}, // Headers of the page
	loading: false, // Disable default loading bar
	env:{
		websocket_machine_Url:'ws://127.0.0.1:9000/'
	},
	server: {
		port: 8082, // default: 3000
		host: '127.0.0.1', // default: localhost,
	},

	build: {
		extend (config, { isDev, isClient }) {
			if (isDev && isClient) {
				// Run ESLint on save
				// config.module.rules.push({
				// 	enforce: 'pre',
				// 	test: /\.(js|vue)$/,
				// 	loader: 'eslint-loader',
				// 	exclude: /(node_modules)/
				// })
			}
			// Extend only webpack config for client-bundle
			if (isClient) { config.target = 'electron-renderer' }
		}
	},
	plugins: [
		// 全局插件配置
		{
		  src: "~/plugins/common",
		  ssr: false
		},
		{
		  src: "~/plugins/websocket",
		  ssr: true
		}	
	  ],
	dev: process.env.NODE_ENV === 'DEV',
	css: [
		'@/assets/css/global.css'
	]
}
