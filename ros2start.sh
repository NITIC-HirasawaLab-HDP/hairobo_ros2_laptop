cd ~/Dev/Hairobo/hairobo_ws
source install/setup.sh

ros2 launch rosbridge_server rosbridge_websocket_launch.xml
cd ros2_robot_react_app
npm start
