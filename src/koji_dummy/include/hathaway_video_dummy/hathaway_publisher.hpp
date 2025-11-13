#ifndef HATHAWAY_VIDEO_DUMMY__HATHAWAY_PUBLISHER_HPP_
#define HATHAWAY_VIDEO_DUMMY__HATHAWAY_PUBLISHER_HPP_

#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/compressed_image.hpp"

namespace hathaway_video_dummy {

class HathawayPublisher : public rclcpp::Node {
  public:
    HathawayPublisher(const rclcpp::NodeOptions &node_options);
    ~HathawayPublisher();

  private:
    std::string video_path_;

    void createPublishers();
    void publishLoop();

    std::vector<rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr> publishers_;
    rclcpp::TimerBase::SharedPtr timer_;
    std::thread publish_thread_;
    std::atomic<bool> stop_thread_;
};

} // namespace hathaway_video_dummy

#endif // HATHAWAY_VIDEO_DUMMY__HATHAWAY_PUBLISHER_HPP_
