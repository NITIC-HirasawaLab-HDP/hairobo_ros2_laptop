// Copyright 2025 Keita Sekiguchi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#ifndef VIDEO_DUMMY__VIDEO_DUMMY_NODE_HPP__
#define VIDEO_DUMMY__VIDEO_DUMMY_NODE_HPP__

#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/compressed_image.hpp"
#include <opencv2/opencv.hpp>
#include <string>

namespace video_dummy {

class VideoDummyNode : public rclcpp::Node {
  public:
    VideoDummyNode(const rclcpp::NodeOptions &node_options);
    ~VideoDummyNode();

  private:
    // パラメータ
    std::string video_path_;
    double publish_rate_;

    // OpenCV video capture
    cv::VideoCapture video_capture_;
    int total_frames_;
    int current_frame_;

    // タイマーコールバック
    void timer_callback();

    // パブリッシャー
    rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr parent_front_pub_;
    rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr parent_rear_pub_;
    rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr child_front_pub_;

    // タイマー
    rclcpp::TimerBase::SharedPtr timer_;
};

} // namespace video_dummy

#endif // VIDEO_DUMMY__VIDEO_DUMMY_NODE_HPP__
