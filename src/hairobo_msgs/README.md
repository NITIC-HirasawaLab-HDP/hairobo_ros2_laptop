# hairobo_msgs

遠隔操作ロボットシステム用のカスタムメッセージ型とサービス型を定義するパッケージです。

## 概要

このパッケージは、福島第一原子力発電所2号機デブリ採取作業用遠隔操作ロボットシステムで使用されるカスタムメッセージ型とサービス型を提供します。

## メッセージ型

### RecoveryCommand
デブリ回収機構の制御コマンドを送信するためのメッセージ型です。

- `bool brush_motor_enable`: ブラシモーターのON/OFF制御
- `bool lid_servo_open`: 蓋サーボモーターの開閉制御
- `bool child_motor_enable`: 子機モーターの有効/無効制御
- `uint8 priority`: コマンドの優先度（将来拡張用）
- `builtin_interfaces/Duration timeout`: コマンドの有効期限（将来拡張用）

### RobotStatus
ロボットシステム全体のステータス情報を配信するためのメッセージ型です。

主な情報：
- システム全体の状態（正常/警告/エラー/緊急）
- 現在の操作モード（親機/子機/アイドル）
- バッテリー状態（電圧、残量、警告）
- モーター状態（有効/無効、電流値）
- 回収機構の状態
- 通信状態
- センサー状態
- エラー・警告メッセージ
- システム温度

### OperationMode
操作モードの変更を通知するためのメッセージ型です。

- `uint8 mode`: 現在の操作モード
- `builtin_interfaces/Time mode_change_time`: モード切り替え時刻
- `string reason`: モード切り替えの理由
- `uint8 previous_mode`: 前回のモード

## サービス型

### SetOperationMode
操作モードを変更するためのサービス型です。

リクエスト：
- `uint8 target_mode`: 設定したい操作モード
- `string reason`: モード切り替えの理由
- `bool force_change`: 強制切り替えフラグ

レスポンス：
- `bool success`: 切り替えの成功/失敗
- `string message`: 結果メッセージ
- `uint8 current_mode`: 切り替え後の現在モード
- `builtin_interfaces/Time change_time`: 切り替え実行時刻

## 使用方法

このパッケージをビルドした後、他のROS 2ノードからこれらのメッセージ型とサービス型を使用できます。

```bash
# パッケージのビルド
colcon build --packages-select hairobo_msgs

# 環境の設定
source install/setup.bash

# メッセージ型の確認
ros2 interface show hairobo_msgs/msg/RobotStatus
ros2 interface show hairobo_msgs/msg/RecoveryCommand
ros2 interface show hairobo_msgs/msg/OperationMode

# サービス型の確認
ros2 interface show hairobo_msgs/srv/SetOperationMode
```

## 依存関係

- `std_msgs`: 標準メッセージ型
- `geometry_msgs`: 幾何学関連メッセージ型
- `builtin_interfaces`: 組み込みインターフェース（時刻など）
