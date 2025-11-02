import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let timerState = {
    isRunning: false,
    remainingTime: 300,
    totalTime: 300,
    lastUpdated: Date.now(),
};

// すべてのクライアントに状態をブロードキャスト
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(data));
        }
    });
}

let timerInterval = null;

function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        if (timerState.isRunning && timerState.remainingTime > 0) {
            timerState.remainingTime -= 1;
            timerState.lastUpdated = Date.now();
            broadcast(timerState);

            if (timerState.remainingTime <= 0) {
                stopTimer();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    // 接続時に現在の状態を送信
    ws.send(JSON.stringify(timerState));

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        switch (data.action) {
            case 'start':
                console.log('Starting timer...');
                timerState.isRunning = true;
                timerState.lastUpdated = Date.now();
                startTimer();
                break;
            case 'stop':
                console.log('Stopping timer...');
                timerState.isRunning = false;
                timerState.remainingTime = data.remainingTime;
                timerState.lastUpdated = Date.now();
                stopTimer();
                break;
            case 'reset':
                console.log('Resetting timer...');
                timerState.isRunning = false;
                timerState.remainingTime = data.remainingTime;
                timerState.totalTime = data.remainingTime;
                timerState.lastUpdated = Date.now();
                stopTimer();
                break;
        }

        console.log('Broadcasting state:', timerState);
        // すべてのクライアントに更新を配信
        broadcast(timerState);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('Timer WebSocket server running on ws://localhost:8080');
