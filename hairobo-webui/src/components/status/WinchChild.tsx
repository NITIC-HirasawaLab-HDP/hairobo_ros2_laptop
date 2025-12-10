import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface WinchChildProps {
	ros?: ROSLIB.Ros | null;
	topicName?: string;
}

const WinchChild: React.FC<WinchChildProps> = ({ ros = null, topicName = '/winch/child/vel' }) => {
	const [vel, setVel] = useState<number | null>(() => {
		const saved = localStorage.getItem('winch_child_vel');
		return saved !== null ? parseFloat(saved) : null;
	});

	useEffect(() => {
		if (!ros) {
			return;
		}

		const topic = new ROSLIB.Topic({
			ros,
			name: topicName,
			messageType: 'std_msgs/Float64',
		});

		const callback = (msg: any) => {
			try {
				const raw = (msg && typeof msg.data !== 'undefined') ? msg.data : msg;
				const num = typeof raw === 'number' ? raw : Number(raw);
				if (!Number.isFinite(num)) return;
				setVel(num);
				localStorage.setItem('winch_child_vel', num.toString());
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

	const value = vel === null ? '--' : Math.abs(vel) < 1e-6 ? 'Stopped' : vel.toFixed(2);
	const valueClassName = vel === null ? 'bg-gray-500/20' : Math.abs(vel) < 1e-6 ? 'bg-green-500/20' : 'bg-red-500/20';

	return (
		<div className="">
			<Status title="Winch Child" value={value} valueClassName={valueClassName} />
		</div>
	);
};

export default WinchChild;
