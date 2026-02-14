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

| ボタン番号 | ボタン名     | デフォルト機能     |
| ---------- | ------------ | ------------------ |
| 0          | ○ (Circle)   | 蓋サーボ制御       |
| 1          | × (Cross)    | ブラシモーター制御 |
| 2          | △ (Triangle) | 子機操作モード     |
| 3          | □ (Square)   | 親機操作モード     |
| 4          | L1           | デッドマンスイッチ |
| 5          | R1           | -                  |

| 軸番号 | 軸名             | デフォルト機能 |
| ------ | ---------------- | -------------- |
| 0      | 左スティック左右 | -              |
| 1      | 左スティック上下 | 前後移動       |
| 2      | L2トリガー       | -              |
| 3      | 右スティック左右 | 回転           |
| 4      | 右スティック上下 | -              |

## 起動方法

```bash
ros2 launch hairobo_teleop teleop.launch.py
```

設定変更後は再ビルドが必要です：
```bash
colcon build --packages-select hairobo_teleop
```

## 制御ロジックの数理的記述

本システムにおけるロボットの遠隔操作ロジック、特に移動制御およびウインチ制御のアルゴリズムについて記述する。

### 1. 移動制御 (Movement Control)

操作者はゲームパッドのアナログスティックを用いて、ロボットの目標並進速度および目標角速度を指令する。
制御入力ベクトル $\mathbf{u} \in \mathbb{R}^2$ を以下のように定義する。

$$
\mathbf{u} = \begin{bmatrix}
u_{linear} \\
u_{angular}
\end{bmatrix}
$$

ここで、$u_{linear} \in [-1, 1]$ は左スティックの上下軸入力（正規化済み）、$u_{angular} \in [-1, 1]$ は右スティックの左右軸入力（正規化済み）である。

ロボットへの指令速度ベクトル $\mathbf{v}_{cmd} = [v_x, \omega_z]^T$ は、選択された操作モード $m \in \{ \text{Parent}, \text{Child} \}$ に依存するゲイン行列 $K_m$ を用いて以下の線形変換により決定される。

$$
\mathbf{v}_{cmd} = K_m \mathbf{u} = \begin{bmatrix}
V_{max, m} & 0 \\
0 & \Omega_{max, m}
\end{bmatrix}
\begin{bmatrix}
u_{linear} \\
u_{angular}
\end{bmatrix}
$$

ここで、$V_{max, m}$ および $\Omega_{max, m}$ は、各モードにおける最大並進速度 [m/s] および最大旋回速度 [rad/s] である。本実装における各モードのパラメータ設定は以下の通りである。

| パラメータ     | 親機モード ($m=\text{Parent}$) | 子機モード ($m=\text{Child}$) |
| :------------- | :----------------------------: | :---------------------------: |
| $V_{max}$      |             $1.0$              |             $0.8$             |
| $\Omega_{max}$ |             $2.0$              |             $0.8$             |

この指令速度 $\mathbf{v}_{cmd}$ は `geometry_msgs/msg/Twist` メッセージとして、操作モードに応じて `/parent/cmd_vel` または `/child/cmd_vel` トピックへパブリッシュされる。

### 2. ウインチ制御 (Winch Control)

ウインチの動作状態 $S$ は有限オートマトンとしてモデル化され、以下の3状態を持つ。

$$
S \in \{ \text{STOP}, \text{WINDING}, \text{UNWINDING} \}
$$

制御入力（ボタンまたは軸入力）の立ち上がりエッジ検出により、状態遷移が発生する。

#### 2.1 子機ウインチ (Child Winch)

子機ウインチの速度指令値 $v_{cw}$ は、状態 $S_{cw}$ に基づき以下の区分定数関数によって決定される。

$$
v_{cw}(S_{cw}) = \begin{cases}
V_{cw, wind} & (S_{cw} = \text{WINDING}) \\
-V_{cw, unwind} & (S_{cw} = \text{UNWINDING}) \\
0 & (S_{cw} = \text{STOP})
\end{cases}
$$

ここで、定数パラメータは以下の通り設定されている。
*   $V_{cw, wind} = 0.8$
*   $V_{cw, unwind} = 0.3$

#### 2.2 LANケーブルウインチ (LAN Winch)

LANウインチの速度指令値 $v_{lan}$ も同様に定義されるが、回転方向の定義（符号）が子機ウインチとは異なる実装となっている点に注意が必要である。

$$
v_{lan}(S_{lan}) = \begin{cases}
-V_{lan, wind} & (S_{lan} = \text{WINDING}) \\
V_{lan, unwind} & (S_{lan} = \text{UNWINDING}) \\
0 & (S_{lan} = \text{STOP})
\end{cases}
$$

ここで、定数パラメータは以下の通り設定されている。
*   $V_{lan, wind} = 30.0$
*   $V_{lan, unwind} = 30.0$

### 3. 操作モード切替

システムの状態として、現在の操作対象 $M$ を保持する。

$$
M = \begin{cases}
1 & (\text{Parent Mode}) \\
0 & (\text{Child Mode})
\end{cases}
$$

操作モードボタン（$u_{pm}, u_{cm}$）の入力に対し、以下の論理で非同期に状態更新が行われる。

$$
M_{t+1} = \begin{cases}
1 & (u_{pm} = 1 \land u_{pm, last} = 0) \\
0 & (u_{cm} = 1 \land u_{cm, last} = 0) \\
M_t & (\text{otherwise})
\end{cases}
$$

このブール値は `/operation_mode` トピックを通じてシステム全体に共有される。
