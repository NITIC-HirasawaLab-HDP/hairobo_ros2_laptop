import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, ExecuteProcess
from launch.launch_description_sources import PythonLaunchDescriptionSource


def generate_launch_description():

    # 1-1. hairobo_teleop の launch ファイルをインクルード
    hairobo_teleop_launch_dir = os.path.join(
        get_package_share_directory('hairobo_teleop'),
        'launch'
    )
    # 1-2. package_b の launch ファイルをインクルード
    launch_hairobo_teleop = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(hairobo_teleop_launch_dir, 'teleop.launch.py')
        )
    )

    # # package_b の launch ファイルパスを取得
    # package_b_launch_dir = os.path.join(
    #     get_package_share_directory('package_b'),
    #     'launch'
    # )

    # # package_b の launch ファイルをインクルード
    # launch_package_b = IncludeLaunchDescription(
    #     PythonLaunchDescriptionSource(
    #         os.path.join(package_b_launch_dir, 'control.launch.py')
    #     )
    # )

    # 2. rosbridge_server の起動
    launch_rosbridge_server = ExecuteProcess(
        cmd=['ros2', 'launch', 'rosbridge_server',
             'rosbridge_websocket_launch.xml', 'address:=0.0.0.0'],
        output='screen'
    )

    # 3. Web UI プロジェクトのディレクトリ
    react_project_dir = './hairobo-webui'

    # 4. Viteサーバー (npm run dev:vite を実行)
    #    'concurrently' を介さず、ROS 2が直接 'npm run dev:vite' を起動する
    vite_server = ExecuteProcess(
        cmd=['npm', 'run', 'dev:vite'],
        cwd=react_project_dir,
        output='screen',
        emulate_tty=True,
        name='vite_server'
    )

    # 5. タイマーサーバー (npm run dev:server を実行)
    #    'concurrently' を介さず、ROS 2が直接 'npm run dev:server' を起動する
    timer_server = ExecuteProcess(
        cmd=['npm', 'run', 'dev:server'],
        cwd=react_project_dir,
        output='screen',
        emulate_tty=True,  # 👈 こちらも念のため tty をエミュレート
        name='timer_server' # 👈 ログのプレフィックスが [timer_server-X] になります
    )

    # これらすべてをリストにして返す
    return LaunchDescription([
        launch_hairobo_teleop,
        launch_rosbridge_server,
        vite_server,   # 'npm run dev' だったものを
        timer_server   # この2つに分離しました
    ])
