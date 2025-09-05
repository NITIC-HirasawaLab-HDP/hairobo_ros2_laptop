from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(
            package='hairobo_controller',
            executable='dualshock4_node',
            name='dualshock4'
        ),
        # 他のノードもここに追加
    ])
