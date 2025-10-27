import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import './Camera.css';

const CAMERA_TOPIC = '/parent_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Parent Front Camera';

const ParentFrontCamera = ({ ros }) => {
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

        imageTopic.subscribe(function (message) {
            console.log('Received image from', CAMERA_TOPIC, 'data length:', message.data ? message.data.length : 'no data');
            if (message.data) {
                const data = "data:image/jpeg;base64," + message.data;
                setImgData(data);
            } else {
                console.warn('Received empty image data');
            }
        });

        // エラーハンドリングの追加
        imageTopic.on('error', function (error) {
            console.error('Error with image topic:', error);
        });

        console.log('Image topic subscription created');

        return () => {
            console.log('Unsubscribing from image topic');
            imageTopic.unsubscribe();
        };
    }, [ros]);

    return (
        <div className="camera-container">
            {ros ? (
                <div className="camera-content">
                    {imgData ? (
                        <>
                            <img
                                src={imgData}
                                alt={CAMERA_TITLE}
                                className="camera-image"
                            />
                            <div className="camera-overlay">
                                {CAMERA_TOPIC}
                            </div>
                        </>
                    ) : (
                        <div className="camera-placeholder">
                            <div className="camera-icon">📷</div>
                            <small>画像を待っています...</small>
                        </div>
                    )}
                </div>
            ) : (
                <div className="camera-disconnected">
                    <div className="camera-icon">📷</div>
                    <small>{CAMERA_TITLE}<br />Waiting...</small>
                </div>
            )}
        </div>
    );
};

export default ParentFrontCamera;
