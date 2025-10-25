import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, ExecuteProcess
from launch.launch_description_sources import PythonLaunchDescriptionSource


def generate_launch_description():

    # --- 他のROS 2パッケージのlaunchファイルをインクルード ---

    # hairobo_teleop の launch ファイルパスを取得
    hairobo_teleop_launch_dir = os.path.join(
        get_package_share_directory('hairobo_teleop'),
        'launch'
    )

    # # package_b の launch ファイルパスを取得
    # package_b_launch_dir = os.path.join(
    #     get_package_share_directory('package_b'),
    #     'launch'
    # )

    # 1. hairobo_teleop の launch ファイルをインクルード
    launch_hairobo_teleop = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(hairobo_teleop_launch_dir, 'teleop.launch.py')
        )
    )

    # # 2. package_b の launch ファイルをインクルード
    # launch_package_b = IncludeLaunchDescription(
    #     PythonLaunchDescriptionSource(
    #         os.path.join(package_b_launch_dir, 'control.launch.py')
    #     )
    # )

    # 3. Reactサーバーの起動
    react_project_dir = './hairobo_react_app'
    react_server = ExecuteProcess(
        cmd=['npm', 'start'],
        cwd=react_project_dir,
        output='screen'
    )

    # これらすべてをリストにして返す
    return LaunchDescription([
        launch_hairobo_teleop,
        # launch_package_b,
        react_server
    ])
