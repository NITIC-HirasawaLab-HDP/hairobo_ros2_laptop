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

#include <chrono>
#include <memory>
#include <string>
#include <thread>
#include <vector>

#include "../include/hathaway_video_dummy/hathaway_publisher.hpp"
#include "rclcpp_components/register_node_macro.hpp"
#include <ament_index_cpp/get_package_share_directory.hpp>
#include <opencv2/opencv.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/compressed_image.hpp>

namespace {
constexpr int QOS_DEPTH = 10;
constexpr int JPEG_QUALITY = 80;
constexpr double DEFAULT_FPS = 30.0;
constexpr char VIDEO_FILENAME[] = "/media/hathaway.mp4";

struct CameraConfig {
    std::string topic;
    std::string frame_id;
};

const std::vector<CameraConfig> CAMERA_CONFIGS = {
    {"/parent_rear_camera/image_raw/compressed", "parent_rear_camera"},
    {"/parent_front_camera/image_raw/compressed", "parent_front_camera"},
    {"/child_front_camera/image_raw/compressed", "child_front_camera"}};
} // namespace

namespace hathaway_video_dummy {

HathawayPublisher::HathawayPublisher(const rclcpp::NodeOptions &node_options)
    : Node("hathaway_publisher", node_options), stop_thread_(false) {
    // 動画ファイルパスを取得
    try {
        video_path_ = ament_index_cpp::get_package_share_directory("hathaway_video_dummy") + VIDEO_FILENAME;
    } catch (...) {
        RCLCPP_FATAL(this->get_logger(), "Failed to find package share directory.");
        throw;
    }

    // パブリッシャーを作成
    createPublishers();

    // パブリッシュスレッドを開始
    publish_thread_ = std::thread(&HathawayPublisher::publishLoop, this);
}

HathawayPublisher::~HathawayPublisher() {
    // スレッドを停止
    stop_thread_ = true;
    if (publish_thread_.joinable()) {
        publish_thread_.join();
    }
}

void HathawayPublisher::createPublishers() {
    // QoS設定
    auto qos = rclcpp::QoS(rclcpp::KeepLast(QOS_DEPTH));
    for (const auto &config : CAMERA_CONFIGS) {
        // 各カメラトピックに対応するパブリッシャーを作成
        publishers_.emplace_back(this->create_publisher<sensor_msgs::msg::CompressedImage>(config.topic, qos));
    }
}

void HathawayPublisher::publishLoop() {
    // 動画ファイルを開く
    cv::VideoCapture cap(video_path_);
    if (!cap.isOpened()) {
        RCLCPP_ERROR(this->get_logger(), "Failed to open video: %s", video_path_.c_str());
        return;
    }

    // フレーム間の遅延時間を計算
    auto delay = std::chrono::duration<double>(1.0 / std::max(cap.get(cv::CAP_PROP_FPS), DEFAULT_FPS));
    cv::Mat frame;

    while (rclcpp::ok() && !stop_thread_) {
        cap >> frame;
        if (frame.empty()) {
            // 動画をループ再生
            cap.set(cv::CAP_PROP_POS_FRAMES, 0);
            continue;
        }

        // フレームをJPEG形式にエンコード
        std::vector<uchar> jpeg_data;
        cv::imencode(".jpg", frame, jpeg_data, {cv::IMWRITE_JPEG_QUALITY, JPEG_QUALITY});
        auto timestamp = this->now();

        // 各トピックにフレームをパブリッシュ
        for (size_t i = 0; i < publishers_.size(); ++i) {
            auto msg = std::make_shared<sensor_msgs::msg::CompressedImage>();
            msg->header.stamp = timestamp;
            msg->header.frame_id = CAMERA_CONFIGS[i].frame_id;
            msg->format = "jpeg";
            msg->data = jpeg_data;
            publishers_[i]->publish(*msg);
        }
        std::this_thread::sleep_for(delay);
    }
}

} // namespace hathaway_video_dummy

#include "rclcpp_components/register_node_macro.hpp"
RCLCPP_COMPONENTS_REGISTER_NODE(hathaway_video_dummy::HathawayPublisher)

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    try {
        auto node = std::make_shared<hathaway_video_dummy::HathawayPublisher>(rclcpp::NodeOptions());
        rclcpp::spin(node);
    } catch (...) {
        RCLCPP_ERROR(rclcpp::get_logger("rclcpp"), "Error creating node.");
    }
    rclcpp::shutdown();
    return 0;
}
