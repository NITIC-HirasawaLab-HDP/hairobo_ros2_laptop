# hathaway_video_dummy

ダミー動画をループ再生して、3つのカメラトピックに画像を配信するROS 2パッケージです。

## 配信トピック

- `/parent_rear_camera/image_raw/compressed`
- `/parent_front_camera/image_raw/compressed`
- `/child_front_camera/image_raw/compressed`

## ビルドと実行

```bash
# ワークスペースルートから
colcon build --packages-select hathaway_video_dummy
source install/setup.bash

# launchファイルで起動
ros2 launch hathaway_video_dummy hathaway_publisher.launch.py
```

## 依存関係

- rclcpp
- sensor_msgs
- OpenCV
- ament_index_cpp

## 動画ファイル

動画ファイルは `media/hathaway.mp4` に配置してください。
