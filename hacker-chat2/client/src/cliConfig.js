export default class CliConfi {
    constructor({ username, hostUri, room }){
        this.username = username;
        this.room = room;

        const { hostname, port, protocol } = new URL(hostUri);

        this.host = hostname;
        this.port = port;
        this.protocol = protocol.replace(/\W/, '');
        // /\W/ => tudo que for caracter especial e pontuação será removido
    }

    static parseArguments(commands){
        const cmd = new Map();
        for(const key in commands){
            const index = parseInt(key);
            const command = commands[index];

            const commandPrefix = '--';
            if(!command.includes(commandPrefix)){
                continue;
            }

            cmd.set(
                command.replace(commandPrefix, ''),
                commands[index + 1]
            )
        }

        return new CliConfi(Object.fromEntries(cmd));
    }
}