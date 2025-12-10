import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface BrushCommandProps {
	ros?: ROSLIB.Ros | null;
	topicName?: string;
}

const BrushCommand: React.FC<BrushCommandProps> = ({ ros = null, topicName = '/brush/command' }) => {
	const [isParent, setIsParent] = useState<boolean | null>(() => {
		const saved = localStorage.getItem('brush_command_state');
		return saved !== null ? saved === 'true' : null;
	});

	useEffect(() => {
		if (!ros) {
			return;
		}

		const topic = new ROSLIB.Topic({
			ros,
			name: topicName,
			messageType: 'std_msgs/Bool',
		});

		const callback = (msg: any) => {
			try {
				// std_msgs/Bool carries a `data` boolean field
				const val = Boolean(msg.data);
				setIsParent(val);
				localStorage.setItem('brush_command_state', val.toString());
			} catch (e) {
				// ignore malformed messages
			}
		};

		topic.subscribe(callback);

		return () => {
			try {
				topic.unsubscribe(callback);
			} catch (e) {
				// ignore
			}
		};
	}, [ros, topicName]);

	const value = isParent === null ? '--' : isParent ? 'ON' : 'OFF';
	const valueClassName = isParent === null ? 'bg-gray-500/20' : isParent ? 'bg-red-500/20' : 'bg-green-500/20';

	return (
		<div className="">
			<Status title="Brush" value={value} valueClassName={valueClassName} />
		</div>
	);
};

export default BrushCommand;
