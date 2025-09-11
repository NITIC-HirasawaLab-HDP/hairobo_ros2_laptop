# Hairobo Teleop - Controller Configuration Guide

## 概要

DUALSHOCK 4コントローラーを使用したHairoboの遠隔操作システムです。コントローラーのボタンマッピングを柔軟に変更できるよう、パラメータ化されています。

## コントローラー設定の変更方法

### 1. YAMLファイルでの設定変更（推奨）

`config/controller_config.yaml` ファイルを編集してボタンマッピングを変更できます：

```yaml
teleop_logic_node:
  ros__parameters:
    # 移動速度設定
    max_linear_velocity: 1.0   # 最大直進速度 [m/s]
    max_angular_velocity: 1.0  # 最大回転速度 [rad/s]
    
    # ボタン設定
    deadman_button: 4        # L1ボタン（デッドマンスイッチ）
    parent_mode_button: 3    # □ボタン（親機操作モード切り替え）
    child_mode_button: 2     # △ボタン（子機操作モード切り替え）
    brush_motor_button: 1    # ×ボタン（ブラシモーター制御）
    lid_servo_button: 0      # ○ボタン（蓋サーボ制御）
    
    # アナログスティック軸設定
    linear_axis: 1           # 左スティック上下（前後移動）
    angular_axis: 3          # 右スティック左右（回転）
```

### 2. Launch引数での設定変更

個別のパラメータをコマンドライン引数で上書きできます：

```bash
ros2 launch hairobo_teleop teleop.launch.py deadman_button:=5 parent_mode_button:=6
```

### 3. 起動方法

#### デフォルト設定で起動:
```bash
ros2 launch hairobo_teleop teleop.launch.py
```

#### カスタム設定ファイルで起動:
```bash
ros2 launch hairobo_teleop teleop.launch.py config_file:=/path/to/your/config.yaml
```

## DUALSHOCK 4ボタンマッピング参考表

### ボタン番号
| ボタン番号 | ボタン名 | デフォルト機能 |
|-----------|---------|---------------|
| 0 | ○ (Circle) | 蓋サーボ制御 |
| 1 | × (Cross) | ブラシモーター制御 |
| 2 | △ (Triangle) | 子機操作モード |
| 3 | □ (Square) | 親機操作モード |
| 4 | L1 | デッドマンスイッチ |
| 5 | R1 | - |
| 6 | L2 | - |
| 7 | R2 | - |
| 8 | Share | - |
| 9 | Options | - |
| 10 | L3 (左スティック押込) | - |
| 11 | R3 (右スティック押込) | - |
| 12 | PSボタン | - |
| 13 | タッチパッド | - |

### アナログ軸番号
| 軸番号 | 軸名 | 範囲 | デフォルト機能 |
|-------|------|------|---------------|
| 0 | 左スティック左右 | -1.0 ～ +1.0 | - |
| 1 | 左スティック上下 | -1.0 ～ +1.0 | 前後移動 |
| 2 | L2トリガー | 0.0 ～ +1.0 | - |
| 3 | 右スティック左右 | -1.0 ～ +1.0 | 回転 |
| 4 | 右スティック上下 | -1.0 ～ +1.0 | - |
| 5 | R2トリガー | 0.0 ～ +1.0 | - |

## 機能説明

### 基本操作
- **デッドマンスイッチ**: L1ボタンを押している間のみロボット操作が有効
- **前後移動**: 左スティック上下で前進/後退
- **回転**: 右スティック左右で左右回転

### モード切り替え
- **□ボタン**: 親機操作モードに切り替え
- **△ボタン**: 子機操作モードに切り替え

### 回収機構制御
- **×ボタン**: ブラシモーターのON/OFF切り替え
- **○ボタン**: 蓋サーボの開閉切り替え

## トラブルシューティング

### コントローラーが認識されない場合
1. デバイスパスを確認: `ls -la /dev/input/js*`
2. 権限を確認: `sudo chmod 666 /dev/input/js0`
3. Launch引数でデバイスパスを指定:
   ```bash
   ros2 launch hairobo_teleop teleop.launch.py joy_device:=/dev/input/js1
   ```

### ボタンの反応が悪い場合
1. デッドゾーンの調整（joyノードのパラメータ）
2. リピート率の調整

## カスタマイズ例

### 別のコントローラーを使用する場合
1. `config/controller_config.yaml`をコピーして新しい設定ファイルを作成
2. 使用するコントローラーのボタンマッピングに合わせて番号を変更
3. カスタム設定ファイルで起動:
   ```bash
   ros2 launch hairobo_teleop teleop.launch.py config_file:=/path/to/custom_config.yaml
   ```
