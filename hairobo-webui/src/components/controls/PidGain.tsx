import React, { useState, useEffect, useRef } from 'react';
import ROSLIB from 'roslib';

interface PidGainProps {
	ros: ROSLIB.Ros | null;
}

const PidGain: React.FC<PidGainProps> = ({ ros }) => {
	// Left側のPIDゲインの状態
	const [leftPid, setLeftPid] = useState({ kp: 0.006, ki: 0.02, kd: 0.0 });
	// Right側のPIDゲインの状態
	const [rightPid, setRightPid] = useState({ kp: 0.006, ki: 0.02, kd: 0.0 });

	// トピックの参照を保持
	const leftTopicRef = useRef<ROSLIB.Topic | null>(null);
	const rightTopicRef = useRef<ROSLIB.Topic | null>(null);

	// ROS接続状態の監視とトピックの設定
	useEffect(() => {
		if (!ros) {
			return;
		}

		// トピックの設定
		const messageType = 'hairobo_interfaces/msg/PidGain';

		leftTopicRef.current = new ROSLIB.Topic({
			ros: ros,
			name: '/pid_gain_left',
			messageType: messageType
		});
		leftTopicRef.current.advertise();

		rightTopicRef.current = new ROSLIB.Topic({
			ros: ros,
			name: '/pid_gain_right',
			messageType: messageType
		});
		rightTopicRef.current.advertise();

		return () => {
			if (leftTopicRef.current) {
				leftTopicRef.current.unadvertise();
			}
			if (rightTopicRef.current) {
				rightTopicRef.current.unadvertise();
			}
		};
	}, [ros]);

	// 入力値が変更されたときのハンドラ
	const handleLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLeftPid((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
	};

	const handleRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setRightPid((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
	};

	// 送信ボタンが押されたときのハンドラ
	const handleSubmit = () => {
		if (!ros) {
			console.error('ROS connection not established');
			return;
		}

		const leftMsg = new ROSLIB.Message({
			kp: leftPid.kp,
			ki: leftPid.ki,
			kd: leftPid.kd
		});

		if (leftTopicRef.current) {
			leftTopicRef.current.publish(leftMsg);
			console.log('Published left PID:', leftMsg);
		}

		const rightMsg = new ROSLIB.Message({
			kp: rightPid.kp,
			ki: rightPid.ki,
			kd: rightPid.kd
		});

		if (rightTopicRef.current) {
			rightTopicRef.current.publish(rightMsg);
			console.log('Published right PID:', rightMsg);
		}

		console.log('Sending PID Gains:', { left: leftPid, right: rightPid });
	};

	// 入力フィールドの共通スタイル
	const inputClass = "w-full px-1 py-2 bg-slate-50 border border-slate-300 rounded-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 text-sm";
	const labelClass = "text-sm font-bold text-slate-500 mb-1 block text-center";

	return (
		<div className="bg-white/80 rounded-2xl border border-gray-300 shadow-lg p-4 w-full max-w-sm mx-auto">
			<h2 className="text-xl font-semibold text-slate-700 text-center mb-2">PID Gain</h2>

			{/* Left PID Form */}
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-slate-600 mb-2 text-center">Left</h3>
				<div className="flex gap-2">
					<div className="flex-1">
						<label className={labelClass}>Kp</label>
						<input
							type="number"
							step="0.001"
							name="kp"
							value={leftPid.kp}
							onChange={handleLeftChange}
							className={inputClass}
						/>
					</div>
					<div className="flex-1">
						<label className={labelClass}>Ki</label>
						<input
							type="number"
							step="0.001"
							name="ki"
							value={leftPid.ki}
							onChange={handleLeftChange}
							className={inputClass}
						/>
					</div>
					<div className="flex-1">
						<label className={labelClass}>Kd</label>
						<input
							type="number"
							step="0.001"
							name="kd"
							value={leftPid.kd}
							onChange={handleLeftChange}
							className={inputClass}
						/>
					</div>
				</div>
			</div>

			{/* Right PID Form */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-slate-600 mb-2 text-center">Right</h3>
				<div className="flex gap-2">
					<div className="flex-1">
						<label className={labelClass}>Kp</label>
						<input
							type="number"
							step="0.001"
							name="kp"
							value={rightPid.kp}
							onChange={handleRightChange}
							className={inputClass}
						/>
					</div>
					<div className="flex-1">
						<label className={labelClass}>Ki</label>
						<input
							type="number"
							step="0.001"
							name="ki"
							value={rightPid.ki}
							onChange={handleRightChange}
							className={inputClass}
						/>
					</div>
					<div className="flex-1">
						<label className={labelClass}>Kd</label>
						<input
							type="number"
							step="0.001"
							name="kd"
							value={rightPid.kd}
							onChange={handleRightChange}
							className={inputClass}
						/>
					</div>
				</div>
			</div>

			{/* Submit Button */}
			<div className="flex justify-center">
				<button
					onClick={handleSubmit}
					className="bg-[#632BDB] hover:bg-[#532AAD] text-white font-bold py-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
				>
					Update
				</button>
			</div>
		</div>
	);
};

export default PidGain;
