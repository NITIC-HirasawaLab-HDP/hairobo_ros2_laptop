import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Card from 'react-bootstrap/Card';

const CameraData = ({ ros }) => {
    const [imgData, setImgData] = useState('');

    useEffect(() => {
        if (!ros) {
            return;
        }

        var image = new ROSLIB.Topic({
            ros: ros,
            name: '/camera/image_raw/compressed',
            messageType: 'sensor_msgs/msg/CompressedImage'
        });

        image.subscribe(function (message) {
            console.log('Received image');
            const data = "data:image/png;base64," + message.data;
            //   const imgData = setAttribute('src', data);
            setImgData(data);
        });

    }, [ros]);

    return (
        <>
            <Card className="mb-4" style={{ width: '48rem' }}>
                <Card.Body>
                    <Card.Title>Camera Image</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">subscribe image_raw</Card.Subtitle>
                    <Card.Text>
                        <img src={imgData} alt="Camera Data" />
                    </Card.Text>
                </Card.Body>
            </Card>
        </>
    );
}

export default CameraData
