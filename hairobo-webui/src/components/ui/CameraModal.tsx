import React from 'react';
import ROSLIB from 'roslib';
import ParentFrontCamera from '../video/ParentFrontCamera';
import ParentRearCamera from '../video/ParentRearCamera';
import ChildFrontCamera from '../video/ChildFrontCamera';
import LidarViewer from '../video/LidarViewer';

interface CameraModalProps {
	cameraType: string | null;
	ros: ROSLIB.Ros | null;
	onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ cameraType, ros, onClose }) => {
	if (!cameraType) return null;

	return (
		<div
			className="fixed inset-0 z-40 flex items-center justify-center"
			onClick={onClose}
		>
			<div className="w-[90vw] h-[85vh] max-w-7xl max-h-[900px] rounded-2xl overflow-hidden bg-white/90 backdrop-blur-lg border-2 border-gray-400 shadow-2xl">
				{cameraType === 'parent-front' && <ParentFrontCamera ros={ros} />}
				{cameraType === 'parent-rear' && <ParentRearCamera ros={ros} />}
				{cameraType === 'child-front' && <ChildFrontCamera ros={ros} />}
				{cameraType === 'lidar' && <LidarViewer ros={ros} topicName="/lidar_points" />}
			</div>
		</div>
	);
};

export default CameraModal;
