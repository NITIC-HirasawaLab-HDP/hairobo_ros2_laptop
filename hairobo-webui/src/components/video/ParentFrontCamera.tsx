// ParentFrontCamera.tsx
import React from 'react';
import ROSLIB from 'roslib';
import { useCompressedImage } from './useCompressedImage'; // 作成したフックをインポート

const CAMERA_TOPIC = '/parent_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Parent Front Camera';

interface ParentFrontCameraProps {
	ros: ROSLIB.Ros | null;
}

const ParentFrontCamera: React.FC<ParentFrontCameraProps> = ({ ros }) => {
	// ✨ カスタムフックで画像データを取得
	const imgData = useCompressedImage(ros, CAMERA_TOPIC);

	return (
		<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg relative">
			{/* ✨ imgData があるかどうかだけでUIを分岐 */}
			{imgData ? (
				// 1. 画像がある場合
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
				// 2. 画像がない場合 (ROS接続待ち or 画像データ待ち)
				<div className="flex flex-col items-center justify-center text-gray-500 text-center w-full h-full">
					<div className="text-2xl mb-2">📷</div>
					<small className="text-sm text-gray-500">
						{/* ✨ ROSの接続状態に応じてメッセージを切り替え */}
						{ros ? '画像を待っています...' : `${CAMERA_TITLE}\nWaiting...`}
					</small>
				</div>
			)}
		</div>
	);
};

export default ParentFrontCamera;
