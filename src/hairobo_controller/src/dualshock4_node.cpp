#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/joy.hpp"

class DualShock4Node : public rclcpp::Node {
  public:
    DualShock4Node() : Node("dualshock4_node") {
        joy_sub_ = this->create_subscription<sensor_msgs::msg::Joy>(
            "joy", 10,
            std::bind(&DualShock4Node::joy_callback, this, std::placeholders::_1));
        RCLCPP_INFO(this->get_logger(), "DualShock4Node started.");
    }

  private:
    void joy_callback(const sensor_msgs::msg::Joy::SharedPtr msg) {
        // DualShock4のボタンやスティック値をここで処理
        RCLCPP_INFO(this->get_logger(), "axes: [%f, %f, %f, %f] buttons: [%d, %d, %d, %d]",
                    msg->axes.size() > 0 ? msg->axes[0] : 0.0,
                    msg->axes.size() > 1 ? msg->axes[1] : 0.0,
                    msg->axes.size() > 2 ? msg->axes[2] : 0.0,
                    msg->axes.size() > 3 ? msg->axes[3] : 0.0,
                    msg->buttons.size() > 0 ? msg->buttons[0] : 0,
                    msg->buttons.size() > 1 ? msg->buttons[1] : 0,
                    msg->buttons.size() > 2 ? msg->buttons[2] : 0,
                    msg->buttons.size() > 3 ? msg->buttons[3] : 0);
    }

    rclcpp::Subscription<sensor_msgs::msg::Joy>::SharedPtr joy_sub_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<DualShock4Node>());
    rclcpp::shutdown();
    return 0;
}
