#include <geometry_msgs/msg/twist.hpp>
#include <hairobo_msgs/msg/operation_mode.hpp>
#include <hairobo_msgs/msg/recovery_command.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/joy.hpp>
#include <std_msgs/msg/header.hpp>

class TeleopLogicNode : public rclcpp::Node {
  public:
    TeleopLogicNode() : Node("teleop_logic_node") {
        // パラメータの宣言
        this->declare_parameter("max_linear_velocity", 1.0);
        this->declare_parameter("max_angular_velocity", 1.0);
        this->declare_parameter("deadman_button", 4); // L1ボタン（通常のデッドマンスイッチ）

        // パラメータの取得
        max_linear_vel_ = this->get_parameter("max_linear_velocity").as_double();
        max_angular_vel_ = this->get_parameter("max_angular_velocity").as_double();
        deadman_button_ = this->get_parameter("deadman_button").as_int();

        // Subscribers
        joy_sub_ = this->create_subscription<sensor_msgs::msg::Joy>(
            "/joy", 10, std::bind(&TeleopLogicNode::joy_callback, this, std::placeholders::_1));

        parent_cmd_vel_sub_ = this->create_subscription<geometry_msgs::msg::Twist>(
            "/parent/cmd_vel", 10, std::bind(&TeleopLogicNode::parent_cmd_vel_callback, this, std::placeholders::_1));

        child_cmd_vel_sub_ = this->create_subscription<geometry_msgs::msg::Twist>(
            "/child/cmd_vel", 10, std::bind(&TeleopLogicNode::child_cmd_vel_callback, this, std::placeholders::_1));

        // Publishers
        parent_cmd_vel_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("/parent/cmd_vel", 10);
        child_cmd_vel_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("/child/cmd_vel", 10);
        recovery_cmd_pub_ = this->create_publisher<hairobo_msgs::msg::RecoveryCommand>("/recovery_mechanism/command", 10);
        operation_mode_pub_ = this->create_publisher<hairobo_msgs::msg::OperationMode>("/operation_mode", 10);

        // 状態変数の初期化
        current_operation_mode_ = hairobo_msgs::msg::OperationMode::MODE_PARENT;
        brush_motor_enabled_ = false;
        lid_servo_open_ = false;

        // 前回のボタン状態を記録（トグル処理用）
        last_parent_button_ = false;
        last_child_button_ = false;
        last_brush_button_ = false;
        last_lid_button_ = false;

        RCLCPP_INFO(this->get_logger(), "Teleop Logic Node initialized");

        // 初期操作モードを配信
        publish_operation_mode();
    }

  private:
    void parent_cmd_vel_callback(const geometry_msgs::msg::Twist::SharedPtr msg) {
        RCLCPP_INFO(this->get_logger(),
                    "Parent cmd_vel received - linear: [%.3f, %.3f, %.3f], angular: [%.3f, %.3f, %.3f]",
                    msg->linear.x, msg->linear.y, msg->linear.z,
                    msg->angular.x, msg->angular.y, msg->angular.z);
    }

    void child_cmd_vel_callback(const geometry_msgs::msg::Twist::SharedPtr msg) {
        RCLCPP_INFO(this->get_logger(),
                    "Child cmd_vel received - linear: [%.3f, %.3f, %.3f], angular: [%.3f, %.3f, %.3f]",
                    msg->linear.x, msg->linear.y, msg->linear.z,
                    msg->angular.x, msg->angular.y, msg->angular.z);
    }

    void joy_callback(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // デッドマンスイッチのチェック（L1ボタン）
        bool deadman_pressed = false;
        if (static_cast<int>(msg->buttons.size()) > deadman_button_) {
            deadman_pressed = msg->buttons[deadman_button_];
        }

        // 操作モード切り替えの処理
        handle_mode_switching(msg);

        // 回収機構制御の処理
        handle_recovery_mechanism(msg);

        // 移動制御の処理
        if (deadman_pressed) {
            handle_movement_control(msg);
        } else {
            // デッドマンスイッチが押されていない場合は停止指令
            publish_stop_command();
        }
    }

    void handle_mode_switching(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // □ボタン (button[3]) で親機操作モード
        bool parent_button = msg->buttons.size() > 3 && msg->buttons[3];
        // △ボタン (button[2]) で子機操作モード
        bool child_button = msg->buttons.size() > 2 && msg->buttons[2];

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

    void handle_recovery_mechanism(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // ×ボタン (button[1]) でブラシモーターのON/OFF切り替え
        bool brush_button = msg->buttons.size() > 1 && msg->buttons[1];
        // ○ボタン (button[0]) で蓋サーボの開閉切り替え
        bool lid_button = msg->buttons.size() > 0 && msg->buttons[0];

        bool command_changed = false;

        // ブラシモーターのトグル処理
        if (brush_button && !last_brush_button_) {
            brush_motor_enabled_ = !brush_motor_enabled_;
            command_changed = true;
            RCLCPP_INFO(this->get_logger(), "Brush motor: %s", brush_motor_enabled_ ? "ON" : "OFF");
        }

        // 蓋サーボのトグル処理
        if (lid_button && !last_lid_button_) {
            lid_servo_open_ = !lid_servo_open_;
            command_changed = true;
            RCLCPP_INFO(this->get_logger(), "Lid servo: %s", lid_servo_open_ ? "OPEN" : "CLOSE");
        }

        // 回収機構コマンドの配信
        if (command_changed) {
            auto recovery_cmd = hairobo_msgs::msg::RecoveryCommand();
            recovery_cmd.header.stamp = this->now();
            recovery_cmd.header.frame_id = "base_link";
            recovery_cmd.brush_motor_enable = brush_motor_enabled_;
            recovery_cmd.lid_servo_open = lid_servo_open_;
            recovery_cmd.child_motor_enable = true; // 通常は有効
            recovery_cmd.priority = 0;              // 通常優先度

            recovery_cmd_pub_->publish(recovery_cmd);
        }

        // 前回のボタン状態を更新
        last_brush_button_ = brush_button;
        last_lid_button_ = lid_button;
    }

    void handle_movement_control(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 左スティック: axes[1] (前後), 右スティック: axes[3] (左右回転)
        double linear_x = 0.0;
        double angular_z = 0.0;

        if (msg->axes.size() > 1) {
            linear_x = msg->axes[1] * max_linear_vel_; // 左スティック上下: 前後移動
        }
        if (msg->axes.size() > 3) {
            angular_z = msg->axes[3] * max_angular_vel_; // 右スティック左右: 回転
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
    rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr parent_cmd_vel_sub_;
    rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr child_cmd_vel_sub_;

    // Publishers
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr parent_cmd_vel_pub_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr child_cmd_vel_pub_;
    rclcpp::Publisher<hairobo_msgs::msg::RecoveryCommand>::SharedPtr recovery_cmd_pub_;
    rclcpp::Publisher<hairobo_msgs::msg::OperationMode>::SharedPtr operation_mode_pub_;

    // パラメータ
    double max_linear_vel_;
    double max_angular_vel_;
    int deadman_button_;

    // 状態変数
    uint8_t current_operation_mode_;
    bool brush_motor_enabled_;
    bool lid_servo_open_;

    // 前回ボタン状態（トグル処理用）
    bool last_parent_button_;
    bool last_child_button_;
    bool last_brush_button_;
    bool last_lid_button_;
};

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<TeleopLogicNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}
