#!/usr/bin/env python3
"""
Hairobo Teleop Launch File
操作用PC側のteleop関連ノードを起動する
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    # Launch arguments
    max_linear_velocity_arg = DeclareLaunchArgument(
        'max_linear_velocity',
        default_value='1.0',
        description='Maximum linear velocity for robot movement'
    )

    max_angular_velocity_arg = DeclareLaunchArgument(
        'max_angular_velocity',
        default_value='1.0',
        description='Maximum angular velocity for robot rotation'
    )

    deadman_button_arg = DeclareLaunchArgument(
        'deadman_button',
        default_value='4',
        description='Deadman switch button index (default: L1 button)'
    )

    joy_device_arg = DeclareLaunchArgument(
        'joy_device',
        default_value='/dev/input/js0',
        description='Joystick device path'
    )

    # Joy node for DUALSHOCK 4 input
    joy_node = Node(
        package='joy',
        executable='joy_node',
        name='joy_node',
        parameters=[{
            'device': LaunchConfiguration('joy_device'),
            'deadzone': 0.1,
            'autorepeat_rate': 20.0,
        }],
        remappings=[
            ('joy', '/joy'),
        ]
    )

    # Teleop logic node
    teleop_logic_node = Node(
        package='hairobo_teleop',
        executable='teleop_logic_node',
        name='teleop_logic_node',
        parameters=[{
            'max_linear_velocity': LaunchConfiguration('max_linear_velocity'),
            'max_angular_velocity': LaunchConfiguration('max_angular_velocity'),
            'deadman_button': LaunchConfiguration('deadman_button'),
        }],
        output='screen',
    )

    return LaunchDescription([
        max_linear_velocity_arg,
        max_angular_velocity_arg,
        deadman_button_arg,
        joy_device_arg,
        joy_node,
        teleop_logic_node,
    ])
