# video_dummy

ダミー動画を3つのカメラトピックに配信するROS2パッケージ

## 概要

このパッケージは、1つの動画ファイル（video.mp4）をループ再生し、以下の3つのトピックに圧縮画像として配信します：

- `/parent_front_camera/image_raw/compressed`
- `/parent_rear_camera/image_raw/compressed`
- `/child_front_camera/image_raw/compressed`

## 使用方法

1. `config`ディレクトリに`video.mp4`ファイルを配置してください

2. パッケージをビルド:
```bash
colcon build --packages-select video_dummy
source install/setup.bash
```

3. ノードを起動:
```bash
ros2 launch video_dummy video_dummy.launch.xml
```

## パラメータ

- `video_path`: 動画ファイルのパス（デフォルト: config/video.mp4）
- `publish_rate`: フレームレート（デフォルト: 30.0 Hz）

## 依存関係

- rclcpp
- sensor_msgs
- cv_bridge
- OpenCV
