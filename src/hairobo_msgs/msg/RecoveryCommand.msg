# メッセージヘッダー
std_msgs/Header header

# ブラシモーターの制御コマンド
bool brush_motor_enable    # true: ON, false: OFF

# 蓋サーボモーターの制御コマンド  
bool lid_servo_open        # true: 開く, false: 閉じる

# 子機モーターの制御コマンド（緊急停止用）
bool child_motor_enable    # true: 有効, false: 無効（緊急停止）

# コマンドの優先度（将来拡張用）
uint8 priority             # 0: 通常, 1: 高優先度, 2: 緊急

# コマンドの有効期限（将来拡張用）
builtin_interfaces/Duration timeout
