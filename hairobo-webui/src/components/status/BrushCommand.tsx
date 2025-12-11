import React, { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface BrushCommandProps {
	ros?: ROSLIB.Ros | null;
	topicName?: string;
}

const BrushCommand: React.FC<BrushCommandProps> = ({ ros = null, topicName = '/brush/command' }) => {
	const storageKey = `status_panel_${topicName}`;
	const [isParent, setIsParent] = useState<boolean | null>(() => {
		const saved = sessionStorage.getItem(storageKey);
		return saved ? JSON.parse(saved) : null;
	});
	const hasConnected = useRef(false);

	useEffect(() => {
		if (isParent !== null) {
			sessionStorage.setItem(storageKey, JSON.stringify(isParent));
		} else {
			sessionStorage.removeItem(storageKey);
		}
	}, [isParent, storageKey]);

	useEffect(() => {
		if (!ros) {
			if (hasConnected.current) {
				setIsParent(null);
			}
			return;
		}

		hasConnected.current = true;

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
