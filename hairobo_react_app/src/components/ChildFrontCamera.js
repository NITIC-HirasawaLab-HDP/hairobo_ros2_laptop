import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

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
                            <small>Waiting for image...</small>
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

export default ChildFrontCamera;
