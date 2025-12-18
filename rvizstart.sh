#!/bin/bash

# ROS2環境のセットアップ
source /opt/ros/jazzy/setup.bash

# ワークスペースのセットアップ
source ~/Dev/Hairobo/hairobo_ws/install/setup.bash

# hairobo_rvizパッケージのlaunchファイルを起動
ros2 launch hairobo_rviz ydlidar_view.launch.xml
