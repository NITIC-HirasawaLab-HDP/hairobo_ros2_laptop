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

#include "video_dummy/video_dummy_node.hpp"

namespace video_dummy {

VideoDummyNode::VideoDummyNode(const rclcpp::NodeOptions &node_options)
    : Node("video_dummy_node", node_options), current_frame_(0) {

    // パラメータ宣言
    video_path_ = this->declare_parameter<std::string>("video_path", "video.mp4");
    publish_rate_ = this->declare_parameter<double>("publish_rate", 30.0);

    // ビデオファイルを開く
    video_capture_.open(video_path_);
    if (!video_capture_.isOpened()) {
        RCLCPP_ERROR(this->get_logger(), "Failed to open video file: %s", video_path_.c_str());
        return;
    }

    total_frames_ = static_cast<int>(video_capture_.get(cv::CAP_PROP_FRAME_COUNT));
    RCLCPP_INFO(this->get_logger(), "Video file opened successfully. Total frames: %d", total_frames_);

    // パブリッシャー作成
    parent_front_pub_ = this->create_publisher<sensor_msgs::msg::CompressedImage>(
        "/parent_front_camera/image_raw/compressed", 10);
    parent_rear_pub_ = this->create_publisher<sensor_msgs::msg::CompressedImage>(
        "/parent_rear_camera/image_raw/compressed", 10);
    child_front_pub_ = this->create_publisher<sensor_msgs::msg::CompressedImage>(
        "/child_front_camera/image_raw/compressed", 10);

    // タイマー作成
    auto timer_period = std::chrono::duration<double>(1.0 / publish_rate_);
    timer_ = this->create_wall_timer(
        std::chrono::duration_cast<std::chrono::milliseconds>(timer_period),
        std::bind(&VideoDummyNode::timer_callback, this));

    RCLCPP_INFO(this->get_logger(), "VideoDummyNode initialized");
}

VideoDummyNode::~VideoDummyNode() {
    if (video_capture_.isOpened()) {
        video_capture_.release();
    }
}

void VideoDummyNode::timer_callback() {
    cv::Mat frame;

    // フレームを読み込む
    if (!video_capture_.read(frame)) {
        // ビデオの最後に達した場合、最初に戻る
        RCLCPP_INFO(this->get_logger(), "Video loop: restarting from beginning");
        video_capture_.set(cv::CAP_PROP_POS_FRAMES, 0);
        current_frame_ = 0;

        if (!video_capture_.read(frame)) {
            RCLCPP_ERROR(this->get_logger(), "Failed to read frame after reset");
            return;
        }
    }

    current_frame_++;

    // フレームをJPEGに圧縮
    std::vector<uchar> buffer;
    std::vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 90};
    if (!cv::imencode(".jpg", frame, buffer, params)) {
        RCLCPP_ERROR(this->get_logger(), "Failed to encode frame");
        return;
    }

    // CompressedImageメッセージを作成
    auto msg = sensor_msgs::msg::CompressedImage();
    msg.header.stamp = this->now();
    msg.format = "jpeg";
    msg.data = buffer;

    // 3つのトピックに同じ画像をパブリッシュ
    msg.header.frame_id = "parent_front_camera";
    parent_front_pub_->publish(msg);

    msg.header.frame_id = "parent_rear_camera";
    parent_rear_pub_->publish(msg);

    msg.header.frame_id = "child_front_camera";
    child_front_pub_->publish(msg);
}

} // namespace video_dummy

#include "rclcpp_components/register_node_macro.hpp"
RCLCPP_COMPONENTS_REGISTER_NODE(video_dummy::VideoDummyNode)
