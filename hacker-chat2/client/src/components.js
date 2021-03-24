import blessed from 'blessed';

export default class ComponentsBuilder {
    #screen;
    #layout;
    #input;
    #chat;
    #status;
    #activityLog;

    constructor(){

    }

    // # => component privado
    #baseComponent(){
        return {
            border: 'line',
            mouse: true,
            keys: true,
            top: 0,
            scrollboar: {
                ch: ' ',
                inverse: true
            },

            // Habilita colocar cores e tags no texto
            tags: true
        }
    }

    setScreen({title}){
        this.#screen = blessed.screen({
            
            // redimensionamento de tela automático
            smartCSR: true,
            
            title
        });
        
        // C-c = ctrl + c
        this.#screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

        return this;
    }

    setLayoutComponent(){
        this.#layout = blessed.layout({
            parent: this.#screen,
            width: '100%',
            height: '100%'
        });

        return this
    }

    // Pegar o texto do terminal (textarea)
    setInputComponent(onEnterPressed){
        const input = blessed.textarea({
            parent: this.#screen,
            bottom: 0,
            height: '10%',
            inputOnFocus: true,
            padding: {
                top: 1,
                left: 2
            },
            style: {
                fg: '#f6f6f6',
                bg: '#353535'
            }
        });

        input.key('enter', onEnterPressed);
        
        this.#input = input;

        return this;
    }

    setChatComponent(){
        this.#chat = blessed.list({
            ...this.#baseComponent(),
            parent: this.#layout,
            align: 'left',
            width: '50%',
            height: '90%',
            items: ['{bold}Messenger{/}']
        });

        return this;
    }

    // Registra quem tá logado
    setStatusComponent(){
        this.#status = blessed.list({
            ...this.#baseComponent(),
            parent: this.#layout,
            width: '25%',
            height: '90%',
            items: ['{bold}Users on Romm{/}']
        });

        return this;
    }

    // Registra quem saiu e quem entrou
    setActivityLogComponent(){
        this.#activityLog = blessed.list({
            ...this.#baseComponent(),
            parent: this.#layout,
            width: '25%',
            height: '90%',
            style: {
                fg: 'yellow'
            },
            items: ['{bold}Activity Log{/}']
        });

        return this;
    }

    build(){
        const components = {
            screen: this.#screen,
            input: this.#input,
            chat: this.#chat,
            activityLog: this.#activityLog,
            status: this.#status
        };

        return components;
    }
}