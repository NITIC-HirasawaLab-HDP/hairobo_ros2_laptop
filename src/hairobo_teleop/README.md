# Hairobo Teleop - Controller Settings

## コントローラー設定の変更方法

コントローラーのボタンマッピングを変更したい場合は、`src/teleop_logic_node.cpp`の上部にある定数を編集してください：

```cpp
// ===========================================
// コントローラー設定（変更はここで行う）
// ===========================================
// ボタン番号（DUALSHOCK 4）
static constexpr int DEADMAN_BUTTON = 4;        // L1ボタン（デッドマンスイッチ）
static constexpr int PARENT_MODE_BUTTON = 3;    // □ボタン（親機操作モード）
static constexpr int CHILD_MODE_BUTTON = 2;     // △ボタン（子機操作モード）
static constexpr int BRUSH_MOTOR_BUTTON = 1;    // ×ボタン（ブラシモーター制御）
static constexpr int LID_SERVO_BUTTON = 0;      // ○ボタン（蓋サーボ制御）

// アナログスティック軸番号
static constexpr int LINEAR_AXIS = 1;           // 左スティック上下（前後移動）
static constexpr int ANGULAR_AXIS = 3;          // 右スティック左右（回転）

// 速度設定
static constexpr double MAX_LINEAR_VELOCITY = 1.0;   // 最大直進速度 [m/s]
static constexpr double MAX_ANGULAR_VELOCITY = 1.0;  // 最大回転速度 [rad/s]
// ===========================================
```

## DUALSHOCK 4ボタンマッピング参考表

| ボタン番号 | ボタン名 | デフォルト機能 |
|-----------|---------|---------------|
| 0 | ○ (Circle) | 蓋サーボ制御 |
| 1 | × (Cross) | ブラシモーター制御 |
| 2 | △ (Triangle) | 子機操作モード |
| 3 | □ (Square) | 親機操作モード |
| 4 | L1 | デッドマンスイッチ |
| 5 | R1 | - |

| 軸番号 | 軸名 | デフォルト機能 |
|-------|------|---------------|
| 0 | 左スティック左右 | - |
| 1 | 左スティック上下 | 前後移動 |
| 2 | L2トリガー | - |
| 3 | 右スティック左右 | 回転 |
| 4 | 右スティック上下 | - |

## 起動方法

```bash
ros2 launch hairobo_teleop teleop.launch.py
```

設定変更後は再ビルドが必要です：
```bash
colcon build --packages-select hairobo_teleop
```
