import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import './Camera.css';

const CAMERA_TOPIC = '/child_front_camera/image_raw/compressed';
const CAMERA_TITLE = 'Child Front Camera';

const ChildFrontCamera = ({ ros }) => {
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
                            <small>Waiting for image...</small>
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

export default ChildFrontCamera;
