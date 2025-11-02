import { useEffect, useRef, useState, useCallback } from 'react';

interface TimerState {
    isRunning: boolean;
    remainingTime: number;
    totalTime: number;
    lastUpdated: number;
}

export const useTimerSync = (totalTime: number) => {
    const [remainingTime, setRemainingTime] = useState(totalTime);
    const [isRunning, setIsRunning] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    // WebSocket接続
    const connect = useCallback(() => {
        const ws = new WebSocket(`ws://${window.location.hostname}:8080`);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data: TimerState = JSON.parse(event.data);
            setIsRunning(data.isRunning);

            // 実行中の場合、経過時間を計算
            if (data.isRunning) {
                const elapsed = Math.floor((Date.now() - data.lastUpdated) / 1000);
                const calculatedRemaining = Math.max(0, data.remainingTime - elapsed);
                setRemainingTime(calculatedRemaining);
            } else {
                setRemainingTime(data.remainingTime);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            // 3秒後に再接続
            reconnectTimeoutRef.current = window.setTimeout(() => {
                connect();
            }, 3000);
        };

        wsRef.current = ws;
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [connect]);

    // タイマー操作をサーバーに送信
    const sendUpdate = useCallback((action: 'start' | 'stop' | 'reset', time?: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action,
                remainingTime: time ?? remainingTime,
                timestamp: Date.now(),
            }));
        }
    }, [remainingTime]);

    return {
        remainingTime,
        isRunning,
        setRemainingTime,
        setIsRunning,
        sendUpdate,
    };
};
