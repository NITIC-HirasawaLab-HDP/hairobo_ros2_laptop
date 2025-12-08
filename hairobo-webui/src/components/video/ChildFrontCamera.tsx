import React from 'react';
import ROSLIB from 'roslib';
import Title from '../ui/title';
import { useCompressedImage } from './useCompressedImage';

const CAMERA_TOPIC = '/child_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Child Front Camera';

interface ChildFrontCameraProps {
	ros: ROSLIB.Ros | null;
}

const ChildFrontCamera: React.FC<ChildFrontCameraProps> = ({ ros }) => {
	const imgData = useCompressedImage(ros, CAMERA_TOPIC);

	return (
		<div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
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
				<p className="text-lg font-semibold text-gray-600">{CAMERA_TITLE}</p>
			)}
		</div>
	);
};

export default ChildFrontCamera;
