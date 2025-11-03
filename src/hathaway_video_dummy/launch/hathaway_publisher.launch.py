from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(
            package='hathaway_video_dummy',
            executable='hathaway_publisher',
            name='hathaway_video_publisher',
            output='screen',
        )
    ])
