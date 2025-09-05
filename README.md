# hairobo_ws

このリポジトリは、ロボット制御・運用のためのROS 2ワークスペースです。

## ディレクトリ構成

- `src/` : ROS 2パッケージのソースコード
- `build/` : ビルド成果物
- `install/` : インストール済みファイル
- `log/` : ビルドや実行時のログ

## 主なパッケージ

- `hairobo_controller` : ロボット制御ノード
- `hairobo_bringup` : 起動・セットアップ用パッケージ

## ビルド方法

```bash
cd /path/to/hairobo_ws
colcon build
```

## セットアップ

ビルド後、以下のコマンドで環境をセットアップします。

```bash
source install/setup.bash
```

## 実行例

```bash
ros2 launch <パッケージ名> <launchファイル名>.launch.py
```

## パッケージの新規作成
```bash
cd ~/hairobo_ws/src
ros2 pkg create --build-type ament_cmake <パッケージ名>
```

## ロボットの構成
- 親機
  - 2クローラ構成
- 子機
  - 2クローラ構成

## ROS2公式チュートリアル(翻訳済み)
[https://amuratakamitamu.github.io/ros2humble_tutorial_translate/](https://amuratakamitamu.github.io/ros2humble_tutorial_translate/)

## ライセンス
未定
