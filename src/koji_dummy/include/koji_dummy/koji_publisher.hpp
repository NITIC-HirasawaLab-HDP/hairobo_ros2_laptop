// Copyright 2025
// Licensed under the Apache License, Version 2.0

#pragma once

#include <memory>
#include <string>
#include <vector>
#include <thread>
#include <atomic>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/compressed_image.hpp>

namespace koji_dummy {

class KojiPublisher : public rclcpp::Node {
public:
    explicit KojiPublisher(const rclcpp::NodeOptions &node_options);
    ~KojiPublisher();

private:
    void createPublishers();
    void publishLoop();

    std::vector<rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr> publishers_;
    std::string video_path_;
    std::thread publish_thread_;
    std::atomic<bool> stop_thread_{false};
};

} // namespace koji_dummy
