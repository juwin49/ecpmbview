/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-22 16:13:41
 * @LastEditTime: 2022-01-06 09:39:05
 */
/*
**  Nuxt
*/
const http = require('http')
const { Nuxt, Builder } = require('nuxt')
let config = require('./nuxt.config.js')
config.rootDir = __dirname // for electron-builder
// Init Nuxt.js
const nuxt = new Nuxt(config)
const builder = new Builder(nuxt)
const server = http.createServer(nuxt.render)
// Build only in dev mode
if (config.dev) {
	builder.build().catch(err => {
		console.error(err) // eslint-disable-line no-console
		process.exit(1)
	})
}
// Listen the server
server.listen()
const _NUXT_URL_ = `http://localhost:${server.address().port}`
console.log(`Nuxt working on ${_NUXT_URL_}`)

/*
** Electron
*/
// 读取配置文件
// const fs = require('fs');
// const ini = require('ini');
const iconv = require('iconv-lite');
// const net = require('net');

// 读取配置文件
/* var configPath = 'config.ini';
var Info = ini.parse(fs.readFileSync(configPath, 'UTF-8'));
for (var section in Info) {
  // console.log(section);
}
let nodeToDllPath = 'Info[section].nodeToDllPath'; */

/* exe路径 */
let nodeToDllPath = '../ECPATMMB/nodejs_to_c.exe';
/* 日志目录 */
let logPath = 'log/log'

const log4js = require('log4js');
function createLogger(name) {
  // log4js 日志
  if (logPath) {    
    const rootPath = logPath;
    log4js.configure({
      appenders: {
        logFile: { //文件形式打印日志
          type: "dateFile",
          filename: rootPath, //写入日志文件的路径
          alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
          //compress: true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
          pattern: name, //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
          encoding: 'utf-8', //default "utf-8"，文件的编码
          maxLogSize: 1024 * 1024, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件xxx.log.1的序列自增长的文件
          backups: 3,
        },
        logConsole: { //控制台打印日志
          type: 'console'
        }
      },
      categories: {
        default: { //默认使用打印日志的方式
          appenders: ['logFile'], // 指定为上面定义的appender，如果不指定，无法写入
          level: 'all' //打印日志的级别
        },
        logFile: {
          appenders: ['logFile'],
          level: 'all'
        },
        logConsole: {
          appenders: ['logConsole'],
          level: log4js.levels.ALL
        }
      }
    });
    return log4js.getLogger();
  }
}
var logger = createLogger(".yyyy-MM-dd.log");


let mainWindow = null // Current window
const electron = require('electron')
const path = require('path')
const app = electron.app
const ipc = electron.ipcMain;
const newWin = () => {
	mainWindow = new electron.BrowserWindow({
		width:  1024,
    	height: 600,
		useContentSize: true,
		title: '',
		show: false,
		icon: 'logo.ico',
		// frame: false,
		autoHideMenuBar: true, //隐藏菜单
		fullscreen: false,
		// alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,
      		webSecurity: false
		} 
	})
	mainWindow.maximize()
	mainWindow.on('closed', () => mainWindow = null)
	if (config.dev) {
		// Install vue dev tool and open chrome dev tools
		// const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
		// installExtension(VUEJS_DEVTOOLS.id).then(name => {
		// 	console.log(`Added Extension:  ${name}`)
		// 	mainWindow.webContents.openDevTools()
		// }).catch(err => console.log('An error occurred: ', err))
		// Wait for nuxt to build
		const pollServer = () => {
			http.get(_NUXT_URL_, (res) => {
				if (res.statusCode === 200) { mainWindow.loadURL(_NUXT_URL_) } else { setTimeout(pollServer, 300) }
			}).on('error', pollServer)
		}
		pollServer()
	} else { return mainWindow.loadURL(_NUXT_URL_) }
}
app.on('ready', newWin)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => mainWindow === null && newWin())


// 限制只能打开一个软件窗口
/* const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    }
  })
} */

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
	  app.quit();
	}
  });
  

/**
 * ipc 通信
 */
// 关掉软件
ipc.on('window-close', function () {

	/* 关闭服务程序会造成更新失败，服务程序不能关闭 */
	// 关闭服务程序
	/* const path = require('path');
	const KillApp = path.resolve(killServerPath);
	const exec = require("child_process").exec;
	clearInterval(watchInterval)
	exec(KillApp, (error, stdout, stderr) => {
		if (error) {
		console.log(error)
		}
	}); */

	setTimeout(function() {
		logger.debug('quit');
		console.log('quit')
		// 退出程序
		app.quit();
	}, 200);

})
// 最小化
ipc.on('window-minimize', function () {
	mainWindow.minimize();
})
// 最大化
ipc.on('window-maximize', function (event) {
	if (mainWindow.isMaximized()) {
		mainWindow.restore();
		event.sender.send('window-maximize-Renderer', false);
	} else {
		mainWindow.maximize();
		event.sender.send('window-maximize-Renderer', true);
	}
})
// 移动窗口
/* ipc.on('set-window-move', function (event, ans) {
	mainWindow.setBounds(ans);
}); */
/* // 设置窗口模式
ipc.on('set-window-mode', function (event, ans) {
	// 登录模式
	if (ans == 'loginMode') {
		mainWindow.hide();
		mainWindow.restore();
		// mainWindow.setResizable(false);
		mainWindow.setBounds({
		width: 422,
		height: 560,
		})
		// 将窗口移动到屏幕中央。
		mainWindow.center();
		mainWindow.show();
	}
	// 窗口模式 
	else if (ans == 'winMode') {
		mainWindow.setBounds({
		width: 1280,
		height: 768,
		});
		// 将窗口移动到屏幕中央。
		mainWindow.center();
		// mainWindow.setResizable(true);
		mainWindow.maximize();
	}
}) */

  
/**
 * 调用动态库
 */
ipc.on('nodeToDll-exec-Main', (event, ans) => {
	// console.log(">> ", ans)
	try {
		// 使用子进程的方式连接
		const spawn = require('child_process').spawn;
		const childProcess = spawn(nodeToDllPath, [ans], {
			encoding: 'utf-8',
		});
		var tempStr="";
		var tempTime=0;
		childProcess.stdout.on('data', function (str) {
			str = iconv.decode(str, 'gbk');
			// 所有空格
			str = str.replace(/\s/g,"");
			// 获取字符串最后14个字符
			var lcahr = str.substr(-14, 14);
			// console.log(lcahr)
			tempStr = tempStr + str;
			tempTime = tempTime + 1;
			// console.log("接收数据次数" + tempTime + "次");
			// console.log(tempStr);
			// 收到$$$$$$$$ecpend为结束符，才结束接收数据
			if (lcahr != "$$$$$$$$ecpend") {
				// console.log("数据未接收全");
				console.log("continue>>>")
			} else {
				tempStr = tempStr.substring(0, tempStr.length-14);
				// console.log("<< ", tempStr)
				event.sender.send('nodeToDll-exec-Renderer',  tempStr);
			}
		});
		childProcess.on('exit', function (code) {
			console.log('exit' + code)
		});
	} catch (error) {
		event.sender.send('nodeToDll-exec-Renderer', 'error' + error);
	}
});


/**
 * 语音播放
 */
ipc.on('systemSpeech-exec-Main', (event, str) => {
	const { exec } = require('child_process');
	var execProcess = exec(`powershell.exe Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.Speak([Console]::In.ReadLine()); exit`);
	execProcess.stdin.end(iconv.encode(str, 'gbk'));
	execProcess.on('exit', function (code) {
		console.log('execProcess exit ' + code)
		event.sender.send('systemSpeech-exec-Renderer', code);
	});
	
});


/**
 * logger 日志文件操作
 */
ipc.on('logger-info-Main', function (event, ans) {
	if (logPath && ans) {
		logger.info(ans)
	}
});

