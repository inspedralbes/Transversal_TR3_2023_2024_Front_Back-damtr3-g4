import io from 'socket.io-client';

const socketManager = {
    socket: null,
    connect() {
        this.socket = io();
        this.socket.on('dataResponse', (data) => {
            console.log('Datos actualizados:', data);
        });
        this.socket.emit('getData');
    },
    selectCharacter(characterId, isActive) {
        // Emitir evento al servidor para actualizar el estado del personaje
        this.socket.emit('selectCharacter', { characterId, isActive });
    }
};

export default socketManager;
