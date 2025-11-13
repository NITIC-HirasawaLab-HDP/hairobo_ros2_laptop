import React from 'react';
import ROSLIB from 'roslib';
import Title from '../ui/title';
import { useCompressedImage } from './useCompressedImage';

const CAMERA_TOPIC = '/parent_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Child Front Camera';

interface ChildFrontCameraProps {
	ros: ROSLIB.Ros | null;
}

const ChildFrontCamera: React.FC<ChildFrontCameraProps> = ({ ros }) => {
	const imgData = useCompressedImage(ros, CAMERA_TOPIC);

	return (
		<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg relative">
			{imgData ? (
				<>
					<img
						src={imgData}
						alt={CAMERA_TITLE}
						className="w-full h-full object-cover block"
					/>
					<div className="absolute top-2 left-2">
						<Title title={CAMERA_TITLE} />
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center text-gray-500 text-center w-full h-full">
					<Title title={CAMERA_TITLE} />
					<div className="text-2xl mb-2 mt-4">📷</div>
					<small className="text-sm text-gray-500">
						{ros ? '画像を待っています...' : 'Waiting...'}
					</small>
				</div>
			)}
		</div>
	);
};

export default ChildFrontCamera;
