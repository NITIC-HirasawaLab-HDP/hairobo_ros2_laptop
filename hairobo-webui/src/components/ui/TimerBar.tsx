import React, { useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { useTimerSync } from '../../hooks/useTimerSync';

interface TimerBarProps {
	totalTime?: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ totalTime = 300 }) => {
	const { remainingTime, isRunning, setRemainingTime, setIsRunning, sendUpdate } = useTimerSync(totalTime);
	const intervalRef = useRef<number | null>(null);

	// ローカルタイマー（UI用）
	useEffect(() => {
		if (isRunning && remainingTime > 0) {
			intervalRef.current = setInterval(() => {
				setRemainingTime((prev) => {
					if (prev <= 0) {
						setIsRunning(false);
						sendUpdate('stop', 0);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isRunning, remainingTime, setIsRunning, setRemainingTime, sendUpdate]);

	const handleStart = () => {
		const newState = !isRunning;
		setIsRunning(newState);
		sendUpdate(newState ? 'start' : 'stop');
	};

	const handleReset = () => {
		setIsRunning(false);
		setRemainingTime(totalTime);
		sendUpdate('reset', totalTime);
	};

	const percentage = (remainingTime / totalTime) * 100;
	const minutes = Math.floor(remainingTime / 60);
	const seconds = remainingTime % 60;

	// 色を残り時間に応じて変化させる
	const getBarColor = () => {
		if (percentage > 50) return 'bg-violet-500'; //残り5分まで紫
		if (percentage > 20) return 'bg-yellow-500'; //残り2分まで黄
		if (percentage > 10) return 'bg-orange-500'; //残り1分までオレンジ
		return 'bg-red-500'; //残り1分切ったら赤
	};

	// 画面全体の背景色を同期させる
	useEffect(() => {
		// グラデーションだとtransitionが効かないため、単色に変更してなめらかに変化させる
		const getBackgroundColor = () => {
			// 通常時
			if (percentage > 50) return '#f0f4f8';
			// 残り2分まで (黄色系)
			if (percentage > 20) return '#fefce8';
			// 残り1分まで (オレンジ系)
			if (percentage > 10) return '#fff7ed';
			// 残り1分切ったら(黒系)
			if (percentage <= 0) return '#1a1a1a';
			// 残り1分切ったら (赤系)
			return '#fef2f2';
		};

		// 以前のクラス設定があれば削除
		const bgColors = ['bg-slate-50', 'bg-yellow-50', 'bg-orange-50', 'bg-red-50'];
		document.body.classList.remove(...bgColors);

		// 背景色とトランジションを適用
		document.body.style.transition = 'background-color 1s ease';
		document.body.style.backgroundColor = getBackgroundColor();
		document.body.style.minHeight = '100vh';

		return () => {
			document.body.style.transition = '';
			document.body.style.backgroundColor = '';
			document.body.style.minHeight = '';
		};
	}, [percentage]);

	return (
		<div className="w-full">
			<div className="bg-slate-50 rounded-2xl border border-gray-300 shadow-lg">
				<div className="px-6 py-4">
					{/* タイマー情報とプログレスバー */}
					<div className="flex items-center gap-4">
						{/* 残り時間表示 */}
						<div className="text-2xl font-bold text-slate-700 tabular-nums whitespace-nowrap">
							{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
						</div>

						{/* プログレスバー */}
						<div className="relative flex-1 h-3 border bg-gray-200 border-gray-300 rounded-full overflow-hidden shadow-inner">
							<div
								className={`h-full ${getBarColor()} transition-all duration-1000 ease-linear rounded-full relative overflow-hidden`}
								style={{ width: `${percentage}%` }}
							>
							</div>
						</div>

						{/* コントロールボタン */}
						<div className="flex items-center gap-3">
							<button
								onClick={handleStart}
								className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-200 border bg-[#632BDB] hover:bg-[#532AAD] text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
							>
								{isRunning ? (
									<>
										<Pause size={20} />
										<span>Stop</span>
									</>
								) : (
									<>
										<Play size={20} />
										<span>Start</span>
									</>
								)}
							</button>

							<button
								onClick={handleReset}
								className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
							>
								<RotateCcw size={20} />
								<span>Reset</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TimerBar;
