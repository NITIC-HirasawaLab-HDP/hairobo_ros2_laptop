# メッセージヘッダー
std_msgs/Header header

# システム全体の状態
uint8 SYSTEM_STATUS_OK = 0
uint8 SYSTEM_STATUS_WARNING = 1
uint8 SYSTEM_STATUS_ERROR = 2
uint8 SYSTEM_STATUS_EMERGENCY = 3
uint8 system_status

# 現在の操作モード
uint8 OPERATION_MODE_PARENT = 0
uint8 OPERATION_MODE_CHILD = 1
uint8 OPERATION_MODE_IDLE = 2
uint8 operation_mode

# 電源・バッテリー状態
float32 battery_voltage        # バッテリー電圧 [V]
float32 battery_percentage     # バッテリー残量 [%] (0.0-100.0)
bool battery_low_warning       # バッテリー低下警告

# モーター状態
bool parent_motors_enabled     # 親機モーター有効状態
bool child_motors_enabled      # 子機モーター有効状態
float32 parent_motor_current   # 親機モーター電流値 [A]
float32 child_motor_current    # 子機モーター電流値 [A]

# 回収機構状態
bool brush_motor_running       # ブラシモーター稼働状態
bool lid_servo_open           # 蓋サーボ開閉状態

# 通信状態
bool pc_connection_active      # 操作用PCとの通信状態
builtin_interfaces/Time last_command_time  # 最後のコマンド受信時刻

# センサー状態
bool camera_front_active       # 前方カメラ稼働状態
bool camera_rear_active        # 後方カメラ稼働状態
bool lidar_active             # LiDAR稼働状態

# エラー・警告メッセージ
string[] error_messages        # エラーメッセージリスト
string[] warning_messages      # 警告メッセージリスト

# システム温度（将来拡張用）
float32 cpu_temperature        # CPU温度 [℃]
float32 motor_driver_temperature  # モータードライバー温度 [℃]
