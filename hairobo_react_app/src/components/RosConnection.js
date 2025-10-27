import React, { useEffect } from 'react';
import ROSLIB from 'roslib';

const Rosconnection = ({ rosUrl, rosDomainId, setRos }) => {

    useEffect(() => {
        console.log('Attempting to connect to ROS at:', rosUrl, 'with domain ID:', rosDomainId);

        const ros = new ROSLIB.Ros({
            url: rosUrl,
            options: {
                ros_domain_id: rosDomainId // ROS_DOMAIN_IDを設定する
            }
        });

        ros.on("connection", () => {
            setRos(ros);
            document.getElementById("status").innerHTML = "successful";
            console.log('Successfully connected to ROSBridge WebSocket server at:', rosUrl);
        });

        ros.on('error', function (error) {
            console.error('Error connecting to ROSBridge WebSocket server:', error);
            document.getElementById("status").innerHTML = "failed";
        });

        ros.on('close', function () {
            console.log('Connection to ROSBridge WebSocket server closed.');
            document.getElementById("status").innerHTML = "closed";
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
