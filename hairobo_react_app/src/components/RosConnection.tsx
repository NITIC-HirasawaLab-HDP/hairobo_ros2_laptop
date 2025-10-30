import React, { useEffect } from 'react';
import ROSLIB from 'roslib';

interface RosConnectionProps {
    rosUrl: string;
    rosDomainId: number;
    setRos: (ros: ROSLIB.Ros | null) => void;
}

const Rosconnection: React.FC<RosConnectionProps> = ({ rosUrl, rosDomainId, setRos }) => {

    useEffect(() => {
        console.log('Attempting to connect to ROS at:', rosUrl, 'with domain ID:', rosDomainId);

        const ros = new ROSLIB.Ros({
            url: rosUrl
        });

        ros.on("connection", () => {
            setRos(ros);
            const statusElement = document.getElementById("status");
            if (statusElement) {
                statusElement.innerHTML = "successful";
            }
            console.log('Successfully connected to ROSBridge WebSocket server at:', rosUrl);
        });

        ros.on('error', function (error: any) {
            console.error('Error connecting to ROSBridge WebSocket server:', error);
            const statusElement = document.getElementById("status");
            if (statusElement) {
                statusElement.innerHTML = "failed";
            }
        });

        ros.on('close', function () {
            console.log('Connection to ROSBridge WebSocket server closed.');
            const statusElement = document.getElementById("status");
            if (statusElement) {
                statusElement.innerHTML = "closed";
            }
            setRos(null);
        });

        return () => {
            console.log('Closing ROS connection');
            ros.close();
        };
    }, [rosUrl, rosDomainId, setRos]);

    return (
        <>
        </>
    );
}
export default Rosconnection;
