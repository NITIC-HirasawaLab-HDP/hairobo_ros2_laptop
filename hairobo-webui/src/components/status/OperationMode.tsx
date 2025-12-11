import React, { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface OperationModeProps {
	ros?: ROSLIB.Ros | null;
	topicName?: string;
}

const OperationMode: React.FC<OperationModeProps> = ({ ros = null, topicName = '/operation_mode' }) => {
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

	const value = isParent === null ? '--' : isParent ? 'Parent' : 'Child';
	const valueClassName = isParent === null ? 'bg-gray-500/20' : isParent ? 'bg-green-500/20' : 'bg-blue-500/20';

	return (
		<div className="">
			<Status title="Mode" value={value} valueClassName={valueClassName} />
		</div>
	);
};

export default OperationMode;
