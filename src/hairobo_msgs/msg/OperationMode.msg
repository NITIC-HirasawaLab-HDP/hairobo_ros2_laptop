# 操作モードを表すメッセージ
std_msgs/Header header

# 操作モード定数
uint8 MODE_PARENT = 0      # 親機操作モード
uint8 MODE_CHILD = 1       # 子機操作モード  
uint8 MODE_IDLE = 2        # アイドルモード（操作無効）
uint8 MODE_EMERGENCY = 3   # 緊急停止モード

# 現在の操作モード
uint8 mode

# モード切り替え時刻
builtin_interfaces/Time mode_change_time

# モード切り替えの理由
string reason

# 前回のモード（デバッグ・ログ用）
uint8 previous_mode
