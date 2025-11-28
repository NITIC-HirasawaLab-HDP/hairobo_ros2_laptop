# 🤖 HaiRobo Workspace

[![ROS2](https://img.shields.io/badge/ROS2-Humble-blue.svg)](https://docs.ros.org/en/humble/)

ロボット制御・運用のためのROS 2ワークスペースです。2クローラ構成の親機・子機システムを制御します。
このワークスペースでは、操作用PC用パッケージのみを開発します。

## 📋 目次

- [🤖 HaiRobo Workspace](#-hairobo-workspace)
  - [📋 目次](#-目次)
  - [📖 仕様書](#-仕様書)
  - [�️ 開発進捗](#️-開発進捗)
  - [�📁 ディレクトリ構成](#-ディレクトリ構成)
  - [📦 パッケージ一覧](#-パッケージ一覧)
  - [🚀 クイックスタート](#-クイックスタート)
    - [1. ワークスペースのビルド](#1-ワークスペースのビルド)
    - [2. 環境のセットアップ](#2-環境のセットアップ)
    - [3. ロボットの起動](#3-ロボットの起動)
  - [⚙️ 開発者向け](#️-開発者向け)
    - [新しいパッケージの作成](#新しいパッケージの作成)
    - [依存関係の更新](#依存関係の更新)
    - [テストの実行](#テストの実行)
  - [🤖 ロボット構成](#-ロボット構成)
    - [🎯 親機（Parent Robot）](#-親機parent-robot)
    - [🎯 子機（Child Robot）](#-子機child-robot)
  - [📚 リソース](#-リソース)
  - [📄 ライセンス](#-ライセンス)

## 📖 仕様書

詳細な要件定義は [📝 仕様書（spec.md）](./spec.md) をご覧ください。

## �️ 開発進捗

実装すべき機能やテスト項目については [📋 TODOリスト（todo.md）](./todo.md) をご覧ください。

## �📁 ディレクトリ構成

```
hairobo_ws/
├── src/           # ROS 2パッケージのソースコード
├── build/         # ビルド成果物（自動生成）
├── install/       # インストール済みファイル（自動生成）
├── log/           # ビルド・実行ログ（自動生成）
├── README.md      # このファイル
└── spec.md        # 仕様書
```

## 📦 パッケージ一覧

| パッケージ名 | 説明 |
|-------------|------|
| `hairobo_msgs` | プロジェクト固有のカスタムメッセージ型とサービス定義 |
| `hairobo_teleop` | DUALSHOCK 4を使った遠隔操作機能 |
| `hairobo_launch` | 操作用PC側の起動・セットアップ用パッケージ |

## 🚀 クイックスタート

### 1. ワークスペースのビルド

```bash
cd ~/hairobo_ws
colcon build
```

### 2. 環境のセットアップ

```bash
source install/setup.bash
```

### 3. ロボットの起動

```bash
# 基本的な起動例
ros2 launch hairobo_bringup robot.launch.py

# 特定のパッケージの起動
ros2 launch <パッケージ名> <launchファイル名>.launch.py
```

## ⚙️ 開発者向け

### 新しいパッケージの作成

```bash
cd ~/hairobo_ws/src
ros2 pkg create --build-type ament_cmake <パッケージ名>
```

### 依存関係の更新

```bash
rosdep update --rosdistro=$ROS_DISTRO

rosdep install --from-paths ./ -i -y --rosdistro ${ROS_DISTRO}
```

### テストの実行

```bash
colcon test
colcon test-result --verbose
```

## 🤖 ロボット構成

### 🎯 親機（Parent Robot）
- **駆動系**: 2クローラ構成
- **役割**: システムの統括制御

### 🎯 子機（Child Robot）
- **駆動系**: 2クローラ構成
- **役割**: 親機からの指令に基づく動作

## 📚 リソース

- 📖 [ROS2公式チュートリアル（日本語版）](https://amuratakamitamu.github.io/ros2humble_tutorial_translate/)
- 📘 [ROS2 Humble公式ドキュメント](https://docs.ros.org/en/humble/)
- 🛠️ [Colconビルドツール](https://colcon.readthedocs.io/)

## 📄 ライセンス

ライセンスは検討中です。詳細は今後決定予定です。

---

<div align="center">
  <sub>Built with ❤️ for robotics development</sub>
</div>
