#include <chrono>
#include <memory>
#include <opencv2/opencv.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/image.hpp>

class CameraPublisher : public rclcpp::Node {
  public:
    CameraPublisher() : Node("camera_publisher"), cap_(2) { // USBカメラ（デバイスID=1）
        if (!cap_.isOpened()) {
            RCLCPP_ERROR(this->get_logger(), "USBカメラが開けません");
            return;
        }

        cap_.set(cv::CAP_PROP_FRAME_WIDTH, 640);
        cap_.set(cv::CAP_PROP_FRAME_HEIGHT, 480);

        publisher_ = this->create_publisher<sensor_msgs::msg::Image>("image_raw", 10);
        timer_ = this->create_wall_timer(
            std::chrono::milliseconds(66),
            std::bind(&CameraPublisher::timer_callback, this));

        RCLCPP_INFO(this->get_logger(), "Camera publisher initialized");
    }

  private:
    void timer_callback() {
        cv::Mat frame;
        if (!cap_.read(frame) || frame.empty()) {
            return;
        }

        auto msg = std::make_shared<sensor_msgs::msg::Image>();
        msg->header.stamp = this->now();
        msg->header.frame_id = "camera_frame";
        msg->height = frame.rows;
        msg->width = frame.cols;
        msg->encoding = "bgr8";
        msg->step = frame.cols * frame.channels();
        msg->data.assign(frame.data, frame.data + frame.total() * frame.elemSize());

        publisher_->publish(*msg);
    }

    cv::VideoCapture cap_;
    rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr publisher_;
    rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<CameraPublisher>());
    rclcpp::shutdown();
    return 0;
}
