import React, { useEffect, useRef, useState } from 'react';
import Toggle from '../ui/toggle';
import ROSLIB from 'roslib';

interface PowerButtonProps {
	ros: ROSLIB.Ros | null;
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	label?: string;
}

const PowerButton: React.FC<PowerButtonProps> = ({
	ros,
	checked,
	onChange,
	disabled = false,
	className = '',
	label = 'Power',
}) => {
	const isControlled = checked !== undefined;
	const [internalChecked, setInternalChecked] = useState<boolean>(
		checked !== undefined ? Boolean(checked) : true
	);

	const topicRef = useRef<ROSLIB.Topic | null>(null);

	const current = isControlled ? Boolean(checked) : internalChecked;

	// ROS接続とトピックの管理
	useEffect(() => {
		if (!ros) {
			return;
		}

		// トピックの設定
		const powerTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/power',
			messageType: 'std_msgs/Bool'
		});

		powerTopic.advertise();
		topicRef.current = powerTopic;

		// 初期値を送信
		const msg = new ROSLIB.Message({
			data: current
		});
		powerTopic.publish(msg);

		return () => {
			powerTopic.unadvertise();
			topicRef.current = null;
		};
	}, [ros]);

	// 値変更時の送信処理
	useEffect(() => {
		if (topicRef.current) {
			const msg = new ROSLIB.Message({
				data: current
			});
			topicRef.current.publish(msg);
		}
	}, [current]);

	// Propsからの状態同期
	useEffect(() => {
		if (isControlled) setInternalChecked(Boolean(checked));
	}, [checked, isControlled]);

	const handleChange = (next: boolean) => {
		if (!isControlled) setInternalChecked(next);
		onChange?.(next);
	};

	return (
		<div className={`flex items-center justify-center gap-3 w-full ${className}`}>
			{/* Toggle */}
			<Toggle
				title={label}
				checked={current}
				onChange={handleChange}
				disabled={disabled}
				className="w-full"
			/>
		</div>
	);
};

export default PowerButton;
