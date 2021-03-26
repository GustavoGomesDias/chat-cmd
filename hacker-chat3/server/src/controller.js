import { constants } from "./constants.js";

export default class Controller {
    #users = new Map();
    #rooms = new Map();

    constructor({ socketServer }){
        this.socketServer = socketServer;
    }

    onNewConnection(socket){
        const { id } = socket;
        console.log('Connection stablished with', id);
        const userData = { id, socket };
        this.#updateGlobalUserData(id, userData);

        socket.on('data', this.#onSocketData(id));
        socket.on('error', this.#onSocketClosed(id));
        socket.on('end', this.#onSocketClosed(id))
    }

    async joinRoom(socketId, data){
        const userData = data;
        console.log(`${userData.userName} joined! ${[socketId]}`);
        const { roomId } = userData;

        const user = this.#updateGlobalUserData(socketId, userData);

        const users = this.#joinUserOnRomm(roomId, user);

        const currentUsers = Array.from(users.values())
            .map(({ id, userName }) => ({ userName, id }));

        // Atualiza o user que conectou sobre quais users tão conectados na sala
        this.socketServer
            .sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);

        // Avisa a conexão de um novo user
        this.broadCast({
            socketId,
            roomId,
            message: { id: socketId, userName: userData.userName },
            event: constants.event.NEW_USER_CONNECTED
        });
 
    }

    broadCast({ socketId, roomId, event, message, includeCurrentSocket = false }){
        const usersOnRoom = this.#rooms.get(roomId);

        for(const [key, user] of usersOnRoom){
            if(!includeCurrentSocket && key === socketId){
                continue;
            }

            this.socketServer.sendMessage(user.socket, event, message)
        }
    }

    message(socketId, data){
        const { userName, roomId } = this.#users.get(socketId);

        this.broadCast({
            roomId,
            socketId,
            event: constants.event.MESSAGE,
            message: { userName, message: data },
            includeCurrentSocket: true
        });
    }

    #joinUserOnRomm(roomId, user){
        const userOnRoom = this.#rooms.get(roomId) ?? new Map();
        userOnRoom.set(user.id, user);
        this.#rooms.set(roomId, userOnRoom);

        return userOnRoom;
    }

    #logoutUser(id, roomId){
        this.#users.delete(id);
        const usersOnRoom = this.#rooms.get(roomId);
        usersOnRoom.delete(id);

        this.#users.set(roomId, usersOnRoom);
    }

    #onSocketClosed(id){
        return _ => {
            const { userName, roomId } = this.#users.get(id);
            console.log(userName, 'disconnected', id);

            this.#logoutUser(id, roomId);

            this.broadCast({
                roomId,
                message: { id, userName },
                socketId: id,
                event: constants.event.DISCONNECT_USER
            });


        };
    }

    #onSocketData(id){
        return data => {
            try{
                const { event, message } = JSON.parse(data);
                this[event](id, message);
            }catch(error){
                console.error(`Wrong event formart!`, data.toString());
            }         
        };
    }

    #updateGlobalUserData(socketId, userData){
        const users = this.#users;
        const user = users.get(socketId) ?? {};

        const updateUserData = {
            ...user,
            ...userData
        };

        users.set(socketId, updateUserData);
        return users.get(socketId);
    }
}