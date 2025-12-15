#include <geometry_msgs/msg/twist.hpp>
#include <hairobo_msgs/msg/operation_mode.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/joy.hpp>
#include <std_msgs/msg/bool.hpp>
#include <std_msgs/msg/float32.hpp>
#include <std_msgs/msg/float64.hpp>
#include <std_msgs/msg/header.hpp>

class TeleopLogicNode : public rclcpp::Node {
  private:
    // ===========================================
    // コントローラー設定（変更はここで行う）
    // ===========================================

    // DUALSHOCK 4 ボタン番号対応表
    // ボタン番号: ボタン名
    // 0: ×ボタン
    // 1: ○ボタン
    // 2: △ボタン
    // 3: □ボタン
    // 4: L1ボタン
    // 5: R1ボタン
    // 6: L2ボタン
    // 7: R2ボタン
    // 8: SHAREボタン
    // 9: OPTIONSボタン
    // 10: 左スティック押し込み (L3)
    // 11: 右スティック押し込み (R3)
    // 12: PSボタン
    // 13: タッチパッド

    // 軸番号対応表
    // 軸番号: 軸名
    // 0: 左スティック左右 (X軸)
    // 1: 左スティック上下 (Y軸)
    // 2: L2トリガー
    // 3: 右スティック左右 (X軸)
    // 4: 右スティック上下 (Y軸)
    // 5: R2トリガー
    // 6: 十字キー左右
    // 7: 十字キー上下

    // ボタン番号（DUALSHOCK 4）
    static constexpr int PARENT_MODE_BUTTON = 5; // R1ボタン（親機操作モード）
    static constexpr int CHILD_MODE_BUTTON = 4;  // L1ボタン（子機操作モード）

    static constexpr int LAN_WINCH_WIND_BUTTON = 0;   // ×ボタン（LANウインチ巻き取り）
    static constexpr int LAN_WINCH_UNWIND_BUTTON = 2; // △ボタン（LANウインチ繰り出し/吐き出し）

    static constexpr int BRUSH_MOTOR_ON_BUTTON = 9;  // OPTIONSボタン（ブラシモーターON）
    static constexpr int BRUSH_MOTOR_OFF_BUTTON = 8; // SHAREボタン（ブラシモーターOFF）

    // アナログスティック軸番号
    static constexpr int LINEAR_AXIS = 1;  // 左スティック上下（前後移動）
    static constexpr int ANGULAR_AXIS = 3; // 右スティック左右（回転）

    // 子機ウインチ操作軸
    static constexpr int CHILD_WINCH_AXIS = 7; // 十字キー上下（子機ウインチ操作：上が吐き出し、下が巻き取り）

    // 速度設定
    static constexpr double MAX_LINEAR_VELOCITY = 1.0;  // 最大直進速度 [m/s]
    static constexpr double MAX_ANGULAR_VELOCITY = 1.0; // 最大回転速度 [rad/s]

    // ウインチの固定速度設定
    static constexpr double CHILD_WINCH_WINDING_VELOCITY = 0.5;   // 子機ウインチの巻き取り速度
    static constexpr double CHILD_WINCH_UNWINDING_VELOCITY = 0.3; // 子機ウインチの繰り出し速度
    static constexpr double LAN_WINCH_WINDING_VELOCITY = 0.5;     // 親機（LAN）ウインチの巻き取り速度
    static constexpr double LAN_WINCH_UNWINDING_VELOCITY = 0.5;   // 親機（LAN）ウインチの繰り出し速度

    // ===========================================
  public:
    TeleopLogicNode() : Node("teleop_logic_node") {
        // Subscribers
        joy_sub_ = this->create_subscription<sensor_msgs::msg::Joy>(
            "/joy", 10, std::bind(&TeleopLogicNode::joy_callback, this, std::placeholders::_1));

        // Publishers
        parent_cmd_vel_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("/parent/cmd_vel", 10);
        child_cmd_vel_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("/child/cmd_vel", 10);
        brush_cmd_pub_ = this->create_publisher<std_msgs::msg::Bool>("/brush/command", 10);
        operation_mode_pub_ = this->create_publisher<std_msgs::msg::Bool>("/operation_mode", 10);
        winch_cmd_pub_ = this->create_publisher<std_msgs::msg::Float32>("/winch/child/vel", 10);
        lan_winch_cmd_pub_ = this->create_publisher<std_msgs::msg::Float32>("/winch/lan/vel", 10);

        // 状態変数の初期化
        current_is_parent_ = true;
        brush_motor_enabled_ = false;
        winch_state_ = WinchState::STOP;
        lan_winch_state_ = WinchState::STOP;

        // 前回のボタン状態を記録
        last_parent_button_ = false;
        last_child_button_ = false;
        last_brush_on_button_ = false;
        last_brush_off_button_ = false;
        last_lan_wind_button_ = false;
        last_lan_unwind_button_ = false;

        last_child_winch_axis_ = 0.0f;

        RCLCPP_INFO(this->get_logger(), "Teleop Logic Node initialized");

        // 初期操作モードを配信
        publish_operation_mode();
    }

  private:
    // ジョイスティック入力コールバック
    void joy_callback(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 操作モード切り替えの処理
        handle_mode_switching(msg);

        // ブラシモーター制御の処理
        handle_brush_control(msg);

        // 子機ウインチ制御の処理
        handle_child_winch_control(msg);

        // LANウインチ制御の処理
        handle_lan_winch_control(msg);

        // 移動制御の処理
        handle_movement_control(msg);
    }

    // 操作モード配信
    void handle_mode_switching(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 親機操作モードボタン
        bool parent_button = static_cast<int>(msg->buttons.size()) > PARENT_MODE_BUTTON && msg->buttons[PARENT_MODE_BUTTON];
        // 子機操作モードボタン
        bool child_button = static_cast<int>(msg->buttons.size()) > CHILD_MODE_BUTTON && msg->buttons[CHILD_MODE_BUTTON];

        if (parent_button && !last_parent_button_) {
            current_is_parent_ = true;
            publish_operation_mode();
            RCLCPP_INFO(this->get_logger(), "Switched to PARENT operation mode");
        }

        if (child_button && !last_child_button_) {
            current_is_parent_ = false;
            publish_operation_mode();
            RCLCPP_INFO(this->get_logger(), "Switched to CHILD operation mode");
        }

        last_parent_button_ = parent_button;
        last_child_button_ = child_button;
    }

    // ブラシモーター制御の処理
    void handle_brush_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        bool brush_on_button = static_cast<int>(msg->buttons.size()) > BRUSH_MOTOR_ON_BUTTON && msg->buttons[BRUSH_MOTOR_ON_BUTTON];
        bool brush_off_button = static_cast<int>(msg->buttons.size()) > BRUSH_MOTOR_OFF_BUTTON && msg->buttons[BRUSH_MOTOR_OFF_BUTTON];

        bool state_changed = false;

        if (brush_on_button && !last_brush_on_button_ && !brush_motor_enabled_) {
            brush_motor_enabled_ = true;
            state_changed = true;
            RCLCPP_INFO(this->get_logger(), "Brush motor: ON");
        }

        if (brush_off_button && !last_brush_off_button_ && brush_motor_enabled_) {
            brush_motor_enabled_ = false;
            state_changed = true;
            RCLCPP_INFO(this->get_logger(), "Brush motor: OFF");
        }

        if (state_changed) {
            auto bool_msg = std_msgs::msg::Bool();
            bool_msg.data = brush_motor_enabled_;
            brush_cmd_pub_->publish(bool_msg);
        }

        last_brush_on_button_ = brush_on_button;
        last_brush_off_button_ = brush_off_button;
    }

    // 【修正】子機ウインチ制御の処理（十字キー上下を使用）
    void handle_child_winch_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        if (static_cast<int>(msg->axes.size()) <= CHILD_WINCH_AXIS) {
            return;
        }

        // 十字キー上下（Child Winch）
        // 1.0 = 上（吐き出し/UNWINDING）
        // -1.0 = 下（巻き取り/WINDING）
        float axis_val = msg->axes[CHILD_WINCH_AXIS];
        bool state_changed = false;

        // 上キー（吐き出し）が押された瞬間
        if (axis_val == 1.0f && last_child_winch_axis_ != 1.0f) {
            if (winch_state_ == WinchState::UNWINDING) {
                winch_state_ = WinchState::STOP;
                RCLCPP_INFO(this->get_logger(), "Child Winch: STOP");
            } else {
                winch_state_ = WinchState::UNWINDING;
                RCLCPP_INFO(this->get_logger(), "Child Winch: UNWINDING (Velocity: %.2f)", CHILD_WINCH_UNWINDING_VELOCITY);
            }
            state_changed = true;
        }
        // 下キー（巻き取り）が押された瞬間
        else if (axis_val == -1.0f && last_child_winch_axis_ != -1.0f) {
            if (winch_state_ == WinchState::WINDING) {
                winch_state_ = WinchState::STOP;
                RCLCPP_INFO(this->get_logger(), "Child Winch: STOP");
            } else {
                winch_state_ = WinchState::WINDING;
                RCLCPP_INFO(this->get_logger(), "Child Winch: WINDING (Velocity: %.2f)", CHILD_WINCH_WINDING_VELOCITY);
            }
            state_changed = true;
        }

        if (state_changed) {
            auto vel_msg = std_msgs::msg::Float32();
            switch (winch_state_) {
            case WinchState::STOP:
                vel_msg.data = 0.0f;
                break;
            case WinchState::WINDING:
                vel_msg.data = static_cast<float>(CHILD_WINCH_WINDING_VELOCITY);
                break;
            case WinchState::UNWINDING:
                vel_msg.data = static_cast<float>(-CHILD_WINCH_UNWINDING_VELOCITY);
                break;
            }
            winch_cmd_pub_->publish(vel_msg);
        }

        last_child_winch_axis_ = axis_val;
    }

    // LANウインチ制御の処理（△吐き出し、×巻き取り）
    void handle_lan_winch_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        bool wind_button = static_cast<int>(msg->buttons.size()) > LAN_WINCH_WIND_BUTTON && msg->buttons[LAN_WINCH_WIND_BUTTON];       // ×
        bool unwind_button = static_cast<int>(msg->buttons.size()) > LAN_WINCH_UNWIND_BUTTON && msg->buttons[LAN_WINCH_UNWIND_BUTTON]; // △
        bool state_changed = false;

        // ×ボタンで巻き取り/停止
        if (wind_button && !last_lan_wind_button_) {
            if (lan_winch_state_ == WinchState::WINDING) {
                lan_winch_state_ = WinchState::STOP;
                RCLCPP_INFO(this->get_logger(), "LAN Winch: STOP");
            } else {
                lan_winch_state_ = WinchState::WINDING;
                RCLCPP_INFO(this->get_logger(), "LAN Winch: WINDING (Velocity: %.2f)", LAN_WINCH_WINDING_VELOCITY);
            }
            state_changed = true;
        }

        // △ボタンで繰り出し/停止
        if (unwind_button && !last_lan_unwind_button_) {
            if (lan_winch_state_ == WinchState::UNWINDING) {
                lan_winch_state_ = WinchState::STOP;
                RCLCPP_INFO(this->get_logger(), "LAN Winch: STOP");
            } else {
                lan_winch_state_ = WinchState::UNWINDING;
                RCLCPP_INFO(this->get_logger(), "LAN Winch: UNWINDING (Velocity: %.2f)", LAN_WINCH_UNWINDING_VELOCITY);
            }
            state_changed = true;
        }

        if (state_changed) {
            auto vel_msg = std_msgs::msg::Float32();
            switch (lan_winch_state_) {
            case WinchState::STOP:
                vel_msg.data = 0.0f;
                break;
            case WinchState::WINDING:
                vel_msg.data = static_cast<float>(LAN_WINCH_WINDING_VELOCITY);
                break;
            case WinchState::UNWINDING:
                vel_msg.data = static_cast<float>(-LAN_WINCH_UNWINDING_VELOCITY);
                break;
            }
            lan_winch_cmd_pub_->publish(vel_msg);
        }

        last_lan_wind_button_ = wind_button;
        last_lan_unwind_button_ = unwind_button;
    }

    // 移動制御の処理
    void handle_movement_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 設定された軸を使用してスティック入力を取得
        double linear_x = 0.0;
        double angular_z = 0.0;

        if (static_cast<int>(msg->axes.size()) > LINEAR_AXIS) {
            linear_x = msg->axes[LINEAR_AXIS] * MAX_LINEAR_VELOCITY; // 前後移動軸
        }
        if (static_cast<int>(msg->axes.size()) > ANGULAR_AXIS) {
            angular_z = msg->axes[ANGULAR_AXIS] * MAX_ANGULAR_VELOCITY; // 回転軸
        }

        // Twistメッセージの作成
        auto twist_msg = geometry_msgs::msg::Twist();
        twist_msg.linear.x = linear_x;
        twist_msg.angular.z = angular_z;

        // 現在の操作モードに応じて適切なトピックに配信
        if (current_is_parent_) {
            parent_cmd_vel_pub_->publish(twist_msg);
        } else {
            child_cmd_vel_pub_->publish(twist_msg);
        }
    }

    // 停止コマンド配信の処理
    void publish_stop_command() {
        auto twist_msg = geometry_msgs::msg::Twist();
        parent_cmd_vel_pub_->publish(twist_msg);
        child_cmd_vel_pub_->publish(twist_msg);
    }

    // 操作モード配信
    void publish_operation_mode() {
        auto mode_msg = std_msgs::msg::Bool();
        mode_msg.data = current_is_parent_;
        operation_mode_pub_->publish(mode_msg);
    }

    // Subscribers
    rclcpp::Subscription<sensor_msgs::msg::Joy>::SharedPtr joy_sub_;

    // Publishers
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr parent_cmd_vel_pub_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr child_cmd_vel_pub_;
    rclcpp::Publisher<std_msgs::msg::Bool>::SharedPtr brush_cmd_pub_;
    rclcpp::Publisher<std_msgs::msg::Bool>::SharedPtr operation_mode_pub_;
    rclcpp::Publisher<std_msgs::msg::Float32>::SharedPtr winch_cmd_pub_;
    rclcpp::Publisher<std_msgs::msg::Float32>::SharedPtr lan_winch_cmd_pub_;

    // ウインチの状態
    enum class WinchState { STOP,
                            WINDING,
                            UNWINDING };

    // 状態変数
    bool current_is_parent_;
    bool brush_motor_enabled_;
    WinchState winch_state_;
    WinchState lan_winch_state_;

    // 前回ボタン状態
    bool last_parent_button_;
    bool last_child_button_;
    bool last_brush_on_button_;
    bool last_brush_off_button_;
    bool last_lan_wind_button_;
    bool last_lan_unwind_button_;
    float last_child_winch_axis_;
};

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<TeleopLogicNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
};
