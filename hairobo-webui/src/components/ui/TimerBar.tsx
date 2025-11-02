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
		if (percentage > 50) return 'bg-emerald-500';
		if (percentage > 20) return 'bg-orange-500';
		return 'bg-red-500';
	};

	return (
		<div className="w-full max-w-5xl mx-auto">
			<div className="bg-gray-900/70 backdrop-blur-2xl border border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden">
				<div className="px-6 py-4">
					{/* タイマー情報とプログレスバー */}
					<div className="flex items-center gap-4">
						{/* 残り時間表示 */}
						<div className="text-2xl font-bold text-white tabular-nums whitespace-nowrap">
							{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
						</div>

						{/* プログレスバー */}
						<div className="relative flex-1 h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
							<div
								className={`h-full ${getBarColor()} transition-all duration-1000 ease-linear rounded-full relative overflow-hidden`}
								style={{ width: `${percentage}%` }}
							>
								{/* アニメーション効果 */}
								<div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
							</div>
						</div>

						{/* コントロールボタン */}
						<div className="flex items-center gap-3">
							<button
								onClick={handleStart}
								className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${isRunning
									? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
									: 'bg-blue-500 hover:bg-blue-600 text-white'
									} shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
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

			<style>{`
				@keyframes shimmer {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(100%);
					}
				}
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
			`}</style>
		</div>
	);
};

export default TimerBar;
