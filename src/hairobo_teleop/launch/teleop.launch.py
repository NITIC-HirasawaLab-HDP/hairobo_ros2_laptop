#!/usr/bin/env python3
"""
Hairobo Teleop Launch File
操作用PC側のteleop関連ノードを起動する (シンプル版)
"""

from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():

    # Joy node for DUALSHOCK 4 input
    joy_node = Node(
        package='joy',
        executable='joy_node',
        name='joy_node',
        parameters=[{
            'device': '/dev/input/js0',
            'deadzone': 0.1,
            'autorepeat_rate': 20.0,
        }],
    )

    # Teleop logic node
    teleop_logic_node = Node(
        package='hairobo_teleop',
        executable='teleop_logic_node',
        name='teleop_logic_node',
        output='screen',
    )

    return LaunchDescription([
        joy_node,
        teleop_logic_node,
    ])
