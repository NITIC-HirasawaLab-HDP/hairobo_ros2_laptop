// Loop-play hathaway.mp4 and publish frames to three image topics.
#include <chrono>
#include <memory>
#include <string>
#include <thread>
#include <vector>

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
    {"/child_front_camera/image_raw/compressed", "child_front_camera"}
};
}  // namespace

class HathawayPublisher : public rclcpp::Node {
public:
    explicit HathawayPublisher(const std::string &video_path)
        : Node("hathaway_video_publisher"),
          video_path_(video_path),
          stop_thread_(false) {
        createPublishers();
        RCLCPP_INFO(this->get_logger(), "Using video: %s", video_path_.c_str());
        publish_thread_ = std::thread(&HathawayPublisher::publishLoop, this);
    }

    ~HathawayPublisher() {
        stop_thread_ = true;
        if (publish_thread_.joinable()) {
            publish_thread_.join();
        }
    }

private:
    void createPublishers() {
        auto qos = rclcpp::QoS(rclcpp::KeepLast(QOS_DEPTH));
        for (const auto &config : CAMERA_CONFIGS) {
            publishers_.push_back(
                this->create_publisher<sensor_msgs::msg::CompressedImage>(config.topic, qos)
            );
        }
    }

    void publishLoop() {
        cv::VideoCapture cap(video_path_);
        if (!cap.isOpened()) {
            RCLCPP_ERROR(this->get_logger(), "Failed to open video: %s", video_path_.c_str());
            return;
        }

        const auto delay = calculateFrameDelay(cap);
        cv::Mat frame;

        while (rclcpp::ok() && !stop_thread_) {
            if (!readFrame(cap, frame)) {
                continue;
            }

            const auto jpeg_data = encodeToJpeg(frame);
            publishToAllCameras(jpeg_data);
            std::this_thread::sleep_for(delay);
        }

        cap.release();
    }

    std::chrono::duration<double> calculateFrameDelay(cv::VideoCapture &cap) {
        double fps = cap.get(cv::CAP_PROP_FPS);
        if (fps <= 0 || std::isnan(fps)) {
            fps = DEFAULT_FPS;
        }
        return std::chrono::duration<double>(1.0 / fps);
    }

    bool readFrame(cv::VideoCapture &cap, cv::Mat &frame) {
        cap >> frame;
        if (frame.empty()) {
            cap.set(cv::CAP_PROP_POS_FRAMES, 0);
            return false;
        }
        return true;
    }

    std::vector<uchar> encodeToJpeg(const cv::Mat &frame) {
        std::vector<uchar> jpeg_buffer;
        std::vector<int> encode_params = {cv::IMWRITE_JPEG_QUALITY, JPEG_QUALITY};
        cv::imencode(".jpg", frame, jpeg_buffer, encode_params);
        return jpeg_buffer;
    }

    void publishToAllCameras(const std::vector<uchar> &jpeg_data) {
        const auto timestamp = this->now();
        
        for (size_t i = 0; i < publishers_.size(); ++i) {
            auto msg = createCompressedImage(jpeg_data, timestamp, CAMERA_CONFIGS[i].frame_id);
            publishers_[i]->publish(*msg);
        }
    }

    sensor_msgs::msg::CompressedImage::SharedPtr createCompressedImage(
        const std::vector<uchar> &jpeg_data,
        const rclcpp::Time &timestamp,
        const std::string &frame_id) {
        auto msg = std::make_shared<sensor_msgs::msg::CompressedImage>();
        msg->header.stamp = timestamp;
        msg->header.frame_id = frame_id;
        msg->format = "jpeg";
        msg->data = jpeg_data;
        return msg;
    }

    std::string video_path_;
    std::vector<rclcpp::Publisher<sensor_msgs::msg::CompressedImage>::SharedPtr> publishers_;
    std::thread publish_thread_;
    std::atomic<bool> stop_thread_;
};

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);

    try {
        const auto pkg_share = ament_index_cpp::get_package_share_directory("hathaway_video_dummy");
        const auto video_path = pkg_share + VIDEO_FILENAME;
        
        auto node = std::make_shared<HathawayPublisher>(video_path);
        rclcpp::spin(node);
    } catch (const std::exception &e) {
        RCLCPP_ERROR(rclcpp::get_logger("rclcpp"), "Error: %s", e.what());
        rclcpp::shutdown();
        return 1;
    }

    rclcpp::shutdown();
    return 0;
}
