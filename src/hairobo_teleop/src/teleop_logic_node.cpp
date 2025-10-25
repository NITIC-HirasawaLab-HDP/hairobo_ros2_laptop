#include <geometry_msgs/msg/twist.hpp>
#include <hairobo_msgs/msg/operation_mode.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/joy.hpp>
#include <std_msgs/msg/bool.hpp>
#include <std_msgs/msg/header.hpp>

class TeleopLogicNode : public rclcpp::Node {
  private:
    // ===========================================
    // コントローラー設定（変更はここで行う）
    // ===========================================

    // DUALSHOCK 4 ボタン番号対応表
    // ボタン番号: ボタン名
    // 0: ○ボタン
    // 1: ×ボタン
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
    static constexpr int PARENT_MODE_BUTTON = 3;     // □ボタン（親機操作モード）
    static constexpr int CHILD_MODE_BUTTON = 2;      // △ボタン（子機操作モード）
    static constexpr int BRUSH_MOTOR_ON_BUTTON = 0;  // ○ボタン（ブラシモーターON）
    static constexpr int BRUSH_MOTOR_OFF_BUTTON = 1; // ×ボタン（ブラシモーターOFF）

    // アナログスティック軸番号
    static constexpr int LINEAR_AXIS = 1;  // 左スティック上下（前後移動）
    static constexpr int ANGULAR_AXIS = 3; // 右スティック左右（回転）

    // 速度設定
    static constexpr double MAX_LINEAR_VELOCITY = 1.0;  // 最大直進速度 [m/s]
    static constexpr double MAX_ANGULAR_VELOCITY = 1.0; // 最大回転速度 [rad/s]

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
        operation_mode_pub_ = this->create_publisher<hairobo_msgs::msg::OperationMode>("/operation_mode", 10);

        // 状態変数の初期化
        current_operation_mode_ = hairobo_msgs::msg::OperationMode::MODE_PARENT;
        brush_motor_enabled_ = false;

        // 前回のボタン状態を記録（トグル処理用）
        last_parent_button_ = false;
        last_child_button_ = false;
        last_brush_on_button_ = false;
        last_brush_off_button_ = false;

        RCLCPP_INFO(this->get_logger(), "Teleop Logic Node initialized");
        RCLCPP_INFO(this->get_logger(), "Controller mapping - Parent: □(%d), Child: △(%d)",
                    PARENT_MODE_BUTTON, CHILD_MODE_BUTTON);

        // 初期操作モードを配信
        publish_operation_mode();
    }

  private:
    void joy_callback(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 操作モード切り替えの処理
        handle_mode_switching(msg);

        // ブラシモーター制御の処理
        handle_brush_control(msg);

        // 移動制御の処理
        handle_movement_control(msg);
    }

    void handle_mode_switching(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 親機操作モードボタン
        bool parent_button = static_cast<int>(msg->buttons.size()) > PARENT_MODE_BUTTON && msg->buttons[PARENT_MODE_BUTTON];
        // 子機操作モードボタン
        bool child_button = static_cast<int>(msg->buttons.size()) > CHILD_MODE_BUTTON && msg->buttons[CHILD_MODE_BUTTON];

        // トグル処理: ボタンが押された瞬間を検出
        if (parent_button && !last_parent_button_) {
            current_operation_mode_ = hairobo_msgs::msg::OperationMode::MODE_PARENT;
            publish_operation_mode();
            RCLCPP_INFO(this->get_logger(), "Switched to PARENT operation mode");
        }

        if (child_button && !last_child_button_) {
            current_operation_mode_ = hairobo_msgs::msg::OperationMode::MODE_CHILD;
            publish_operation_mode();
            RCLCPP_INFO(this->get_logger(), "Switched to CHILD operation mode");
        }

        // 前回のボタン状態を更新
        last_parent_button_ = parent_button;
        last_child_button_ = child_button;
    }

    void handle_brush_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // ブラシモーター制御ボタン
        bool brush_on_button = static_cast<int>(msg->buttons.size()) > BRUSH_MOTOR_ON_BUTTON && msg->buttons[BRUSH_MOTOR_ON_BUTTON];
        bool brush_off_button = static_cast<int>(msg->buttons.size()) > BRUSH_MOTOR_OFF_BUTTON && msg->buttons[BRUSH_MOTOR_OFF_BUTTON];

        bool state_changed = false;

        // ブラシモーターONの処理
        if (brush_on_button && !last_brush_on_button_ && !brush_motor_enabled_) {
            brush_motor_enabled_ = true;
            state_changed = true;
            RCLCPP_INFO(this->get_logger(), "Brush motor: ON");
        }

        // ブラシモーターOFFの処理
        if (brush_off_button && !last_brush_off_button_ && brush_motor_enabled_) {
            brush_motor_enabled_ = false;
            state_changed = true;
            RCLCPP_INFO(this->get_logger(), "Brush motor: OFF");
        }

        // 状態が変更された場合のみコマンドを配信
        if (state_changed) {
            auto bool_msg = std_msgs::msg::Bool();
            bool_msg.data = brush_motor_enabled_;
            brush_cmd_pub_->publish(bool_msg);
        }

        // 前回のボタン状態を更新
        last_brush_on_button_ = brush_on_button;
        last_brush_off_button_ = brush_off_button;
    }

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
        if (current_operation_mode_ == hairobo_msgs::msg::OperationMode::MODE_PARENT) {
            parent_cmd_vel_pub_->publish(twist_msg);
        } else if (current_operation_mode_ == hairobo_msgs::msg::OperationMode::MODE_CHILD) {
            child_cmd_vel_pub_->publish(twist_msg);
        }
    }

    void publish_stop_command() {
        auto twist_msg = geometry_msgs::msg::Twist();
        // すべての値は0.0で初期化済み

        // 両方のロボットに停止指令を送信（安全のため）
        parent_cmd_vel_pub_->publish(twist_msg);
        child_cmd_vel_pub_->publish(twist_msg);
    }

    void publish_operation_mode() {
        auto mode_msg = hairobo_msgs::msg::OperationMode();
        mode_msg.header.stamp = this->now();
        mode_msg.header.frame_id = "";
        mode_msg.mode = current_operation_mode_;

        operation_mode_pub_->publish(mode_msg);
    }

    // Subscribers
    rclcpp::Subscription<sensor_msgs::msg::Joy>::SharedPtr joy_sub_;

    // Publishers
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr parent_cmd_vel_pub_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr child_cmd_vel_pub_;
    rclcpp::Publisher<std_msgs::msg::Bool>::SharedPtr brush_cmd_pub_;
    rclcpp::Publisher<hairobo_msgs::msg::OperationMode>::SharedPtr operation_mode_pub_;

    // 状態変数
    uint8_t current_operation_mode_;
    bool brush_motor_enabled_;

    // 前回ボタン状態（トグル処理用）
    bool last_parent_button_;
    bool last_child_button_;
    bool last_brush_on_button_;
    bool last_brush_off_button_;
};

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<TeleopLogicNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
};
