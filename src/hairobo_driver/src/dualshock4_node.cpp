#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/joy.hpp"

class DualShock4Node : public rclcpp::Node {
  public:
    DualShock4Node() : Node("dualshock4_node") {
        joy_sub_ = this->create_subscription<sensor_msgs::msg::Joy>(
            "joy", 10,
            std::bind(&DualShock4Node::joy_callback, this, std::placeholders::_1));
        cmd_vel_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("cmd_vel", 10);
        RCLCPP_INFO(this->get_logger(), "DualShock4Node started.");
    }

  private:
    void joy_callback(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // 左スティック上下: axes[1]（前進:+1, 後退:-1）
        // 右スティック左右: axes[3]（右:+1, 左:-1）
        double linear = 0.0;
        double angular = 0.0;
        if (msg->axes.size() > 1) {
            // -1～+1のまま
            linear = msg->axes[1];
        }
        if (msg->axes.size() > 3) {
            angular = msg->axes[3];
        }

        geometry_msgs::msg::Twist twist;
        twist.linear.x = linear;   // 前進・後退速度
        twist.angular.z = angular; // 回転速度

        cmd_vel_pub_->publish(twist);

        RCLCPP_INFO(this->get_logger(), "linear: %.2f, angular: %.2f", linear, angular);
    }

    rclcpp::Subscription<sensor_msgs::msg::Joy>::SharedPtr joy_sub_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr cmd_vel_pub_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<DualShock4Node>());
    rclcpp::shutdown();
    return 0;
}
