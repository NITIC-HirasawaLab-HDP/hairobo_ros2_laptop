import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

const CAMERA_TOPIC = '/parent_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Parent Front Camera';

interface ParentFrontCameraProps {
	ros: ROSLIB.Ros | null;
}

const ParentFrontCamera: React.FC<ParentFrontCameraProps> = ({ ros }) => {
	const [imgData, setImgData] = useState('');

	useEffect(() => {
		if (!ros) {
			console.log('ROS connection not available');
			return;
		}

		console.log('Setting up image topic subscription for', CAMERA_TOPIC);

		const imageTopic = new ROSLIB.Topic({
			ros: ros,
			name: CAMERA_TOPIC,
			messageType: 'sensor_msgs/msg/CompressedImage'
		});

		imageTopic.subscribe(function (message: any) {
			console.log('Received image from', CAMERA_TOPIC, 'data length:', message.data ? message.data.length : 'no data');
			if (message.data) {
				const data = "data:image/jpeg;base64," + message.data;
				setImgData(data);
			} else {
				console.warn('Received empty image data');
			}
		});

		// エラーハンドリングの追加
		imageTopic.on('error', function (error: any) {
			console.error('Error with image topic:', error);
		});

		console.log('Image topic subscription created');

		return () => {
			console.log('Unsubscribing from image topic');
			imageTopic.unsubscribe();
		};
	}, [ros]);

	return (
		<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg relative">
			{ros ? (
				<div className="w-full h-full relative flex items-center justify-center">
					{imgData ? (
						<>
							<img
								src={imgData}
								alt={CAMERA_TITLE}
								className="w-full h-full object-cover block"
							/>
							<div className="absolute top-0 left-0 right-0 bg-black/50 text-white px-3 py-2 text-xs font-medium z-10">
								{CAMERA_TOPIC}
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center text-gray-500 text-center w-full h-full">
							<div className="text-2xl mb-2">📷</div>
							<small className="text-sm text-gray-500">画像を待っています...</small>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center text-gray-500 text-center w-full h-full">
					<div className="text-2xl mb-2">📷</div>
					<small className="text-sm text-gray-500">{CAMERA_TITLE}<br />Waiting...</small>
				</div>
			)}
		</div>
	);
};

export default ParentFrontCamera;
