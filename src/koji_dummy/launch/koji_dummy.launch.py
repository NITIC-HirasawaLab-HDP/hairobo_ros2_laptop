from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(
            package='koji_dummy',
            executable='koji_dummy',
            name='koji_dummy',
            output='screen',
        )
    ])
