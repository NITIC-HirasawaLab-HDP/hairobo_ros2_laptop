import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface RosConnectionProps {
	rosUrl: string;
	rosDomainId: number;
	setRos: (ros: ROSLIB.Ros | null) => void;
}

const RosConnection: React.FC<RosConnectionProps> = ({ rosUrl, rosDomainId, setRos }) => {
	const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'successful' | 'failed' | 'closed'>('connecting');

	useEffect(() => {
		console.log('Attempting to connect to ROS at:', rosUrl, 'with domain ID:', rosDomainId);
		setConnectionStatus('connecting');

		const ros = new ROSLIB.Ros({
			url: rosUrl
		});

		ros.on("connection", () => {
			setRos(ros);
			setConnectionStatus('successful');
			console.log('Successfully connected to ROSBridge WebSocket server at:', rosUrl);
		});

		ros.on('error', function (error: any) {
			console.error('Error connecting to ROSBridge WebSocket server:', error);
			setConnectionStatus('failed');
		});

		ros.on('close', function () {
			console.log('Connection to ROSBridge WebSocket server closed.');
			setConnectionStatus('closed');
			setRos(null);
		});

		return () => {
			console.log('Closing ROS connection');
			ros.close();
		};
	}, [rosUrl, rosDomainId, setRos]);

	const getStatusBackgroundColor = () => {
		switch (connectionStatus) {
			case 'connecting':
				return 'bg-yellow-500/20';
			case 'successful':
				return 'bg-green-500/20';
			case 'failed':
				return 'bg-red-500/20';
			case 'closed':
				return 'bg-red-500/20';
			default:
				return 'bg-gray-500/20';
		}
	};

	const getStatusText = () => {
		switch (connectionStatus) {
			case 'connecting':
				return 'Connecting...';
			case 'successful':
				return 'Connected';
			case 'failed':
				return 'Failed';
			case 'closed':
				return 'Closed';
			default:
				return 'Unknown';
		}
	};

	return (
		<div className="fixed top-4 left-4 z-50">
			<Status
				title="ROS2"
				value={getStatusText()}
				valueClassName={getStatusBackgroundColor()}
			/>
		</div>
	);
}

export default RosConnection;
