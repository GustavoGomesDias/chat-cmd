/* 
node index.js --username nick --room sala --hostUri localhost

*/

import Events from 'events';
import CliConfi from './src/cliConfig.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/terminalController.js";

// process.argv => forma de pegar entrada por linha de comando
const [nodePath, filePath, ...commands] = process.argv;

const config = CliConfi.parseArguments(commands);
console.log(config)

const componentEmitter = new Events();

const socketClient = new SocketClient(config);
await socketClient.initialize();

// const controller = new TerminalController();
// await controller.initalizeTable(componentEmitter);
