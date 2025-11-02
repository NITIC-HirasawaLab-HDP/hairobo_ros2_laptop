export interface TimerState {
    isRunning: boolean;
    remainingTime: number;
    totalTime: number;
    lastUpdated: number; // タイムスタンプ
}

let timerState: TimerState = {
    isRunning: false,
    remainingTime: 300,
    totalTime: 300,
    lastUpdated: Date.now(),
};

export const getTimerState = async (): Promise<TimerState> => {
    // サーバーから現在のタイマー状態を取得
    // TODO: 実際のAPIエンドポイントに置き換える
    const response = await fetch('/api/timer');
    return response.json();
};

export const updateTimerState = async (state: Partial<TimerState>): Promise<TimerState> => {
    // サーバーのタイマー状態を更新
    // TODO: 実際のAPIエンドポイントに置き換える
    const response = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
    });
    return response.json();
};
