import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

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
        <div className="border rounded p-3 h-100">
            {ros ? (
                <div className="d-flex justify-content-center align-items-center" style={{ position: 'relative' }}>
                    {imgData ? (
                        <>
                            <img src={imgData} alt={CAMERA_TITLE} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                padding: '8px 12px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {CAMERA_TOPIC}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-muted">
                            <div className="mb-2">📷</div>
                            <small>画像を待っています...</small>
                        </div>
                    )}
                </div>
            ) : (
                <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '200px' }}>
                    <div className="text-center text-muted">
                        <div className="mb-2">📷</div>
                        <small>{CAMERA_TITLE}<br />Waiting...</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentFrontCamera;
