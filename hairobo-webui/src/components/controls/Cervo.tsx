import React, { useState, useEffect, useRef } from 'react';
import ROSLIB from 'roslib';

interface CervoProps {
	ros: ROSLIB.Ros | null;
}

const Cervo: React.FC<CervoProps> = ({ ros }) => {
	// サーボ角度の初期値と範囲
	const ORIGIN_VALUE = 2048;
	const MIN_VALUE = 0;
	const MAX_VALUE = 4096;
	const PRESET_VALUE = 1024; // プリセット値（例）

	// サーボ角度状態
	const [servoAngle, setServoAngle] = useState(ORIGIN_VALUE);
	const [presetValue, setPresetValue] = useState(PRESET_VALUE);
	const [manualValue, setManualValue] = useState(ORIGIN_VALUE);

	// トピックの参照を保持
	const servoTopicRef = useRef<ROSLIB.Topic | null>(null);
	const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// ROS接続状態の監視とトピックの設定
	useEffect(() => {
		if (!ros) {
			return;
		}

		// トピックの設定関数
		const setupTopic = () => {
			// 既存のトピックがあれば解除
			if (servoTopicRef.current) {
				servoTopicRef.current.unadvertise();
			}

			const messageType = 'std_msgs/msg/UInt16';

			servoTopicRef.current = new ROSLIB.Topic({
				ros: ros,
				name: '/cervo',
				messageType: messageType
			});
			servoTopicRef.current.advertise();
		};

		// 初回のトピック設定
		setupTopic();

		// 定期的にトピックの状態を確認し、必要に応じて再接続
		reconnectIntervalRef.current = setInterval(() => {
			if (ros && ros.isConnected && !servoTopicRef.current) {
				console.log('Reconnecting servo topic...');
				setupTopic();
			}
		}, 1000);

		return () => {
			if (reconnectIntervalRef.current) {
				clearInterval(reconnectIntervalRef.current);
			}
			if (servoTopicRef.current) {
				servoTopicRef.current.unadvertise();
				servoTopicRef.current = null;
			}
		};
	}, [ros]);

	// サーボ角度をパブリッシュ
	const publishServoAngle = (value: number) => {
		if (!ros || !ros.isConnected) {
			console.warn('ROS connection not established');
			return;
		}

		if (!servoTopicRef.current) {
			console.warn('Servo topic not ready');
			return;
		}

		// 範囲チェック
		const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));

		const servoMsg = new ROSLIB.Message({
			data: clampedValue
		});

		servoTopicRef.current.publish(servoMsg);
		console.log('Published servo angle:', clampedValue);
		setServoAngle(clampedValue);
	};

	// Originボタンのハンドラ
	const handleSetOrigin = () => {
		publishServoAngle(ORIGIN_VALUE);
	};

	// Presetボタンのハンドラ
	const handleSetPreset = () => {
		const value = Math.max(MIN_VALUE, Math.min(MAX_VALUE, presetValue));
		publishServoAngle(value);
	};

	// 手動調整の増減ボタンのハンドラ
	const handleIncrement = () => {
		publishServoAngle(manualValue + 10);
		setManualValue(Math.min(MAX_VALUE, manualValue + 10));
	};

	const handleDecrement = () => {
		publishServoAngle(manualValue - 10);
		setManualValue(Math.max(MIN_VALUE, manualValue - 10));
	};

	// 手動入力のハンドラ
	const handleManualChange = (value: number) => {
		const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
		setManualValue(clampedValue);
	};

	// 共通スタイル
	const inputClass = "w-full px-2 py-0.5 bg-slate-50 border border-slate-300 rounded-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 text-xs";
	const buttonClass = "bg-[#632BDB] hover:bg-[#532AAD] text-white font-bold py-0.5 px-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs";
	const sectionClass = "bg-slate-50 rounded-full border border-slate-200 p-1.5 mb-1.5";

	return (
		<div className="bg-white/80 rounded-2xl border border-gray-300 shadow-lg p-3 w-full max-w-sm mx-auto">
			<h2 className="text-base font-semibold text-slate-700 text-center mb-1.5">Servo Control</h2>

			{/* 現在の値表示 */}
			<div className="text-center mb-2">
				<div className="text-xs text-slate-500">Current Value</div>
				<div className="text-lg font-bold text-slate-700">{servoAngle}</div>
			</div>

			{/* Origin セクション */}
			<div className={sectionClass}>
				<div className="flex items-center justify-between gap-2">
					<div className="text-slate-600 text-xs font-medium flex-shrink-0 w-12">Origin</div>
					<input
						type="number"
						value={ORIGIN_VALUE}
						disabled
						className={`${inputClass} flex-1`}
					/>
					<button onClick={handleSetOrigin} className={`${buttonClass} flex-shrink-0`}>
						Set
					</button>
				</div>
			</div>

			{/* Preset セクション */}
			<div className={sectionClass}>
				<div className="flex items-center justify-between gap-2">
					<div className="text-slate-600 text-xs font-medium flex-shrink-0 w-12">Preset</div>
					<input
						type="number"
						min={MIN_VALUE}
						max={MAX_VALUE}
						value={presetValue}
						onChange={(e) => setPresetValue(parseInt(e.target.value) || 0)}
						className={`${inputClass} flex-1`}
					/>
					<button onClick={handleSetPreset} className={`${buttonClass} flex-shrink-0`}>
						Set
					</button>
				</div>
			</div>

			{/* 手動調整セクション */}
			<div className={sectionClass}>
				<div className="flex items-center justify-between gap-2">
					<button
						onClick={handleDecrement}
						className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full shadow transition-all duration-200 active:scale-95 text-xs"
					>
						-
					</button>
					<input
						type="number"
						min={MIN_VALUE}
						max={MAX_VALUE}
						value={manualValue}
						onChange={(e) => handleManualChange(parseInt(e.target.value) || 0)}
						onBlur={() => publishServoAngle(manualValue)}
						className={`${inputClass} flex-1`}
					/>
					<button
						onClick={handleIncrement}
						className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full shadow transition-all duration-200 active:scale-95 text-xs"
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
};

export default Cervo;
