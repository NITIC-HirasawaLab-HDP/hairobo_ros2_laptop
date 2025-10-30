import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

const CAMERA_TOPIC = '/parent_rear_camera/image_raw/compressed';
const CAMERA_TITLE = 'Parent Rear Camera';

const ParentRearCamera = ({ ros }) => {
    const [imgData, setImgData] = useState('');

    useEffect(() => {
        if (!ros) {
            return;
        }

        const imageTopic = new ROSLIB.Topic({
            ros: ros,
            name: CAMERA_TOPIC,
            messageType: 'sensor_msgs/msg/CompressedImage'
        });

        imageTopic.subscribe(function (message) {
            console.log('Received image from', CAMERA_TOPIC);
            const data = "data:image/jpeg;base64," + message.data;
            setImgData(data);
        });

        return () => {
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
                            <small className="text-sm text-gray-500">Waiting for image...</small>
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

export default ParentRearCamera;
