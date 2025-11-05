cmake_minimum_required(VERSION 3.8)
project(hathaway_video_dummy)

find_package(ament_cmake_auto REQUIRED)

ament_auto_find_build_dependencies()

ament_auto_add_library(${PROJECT_NAME} SHARED
    DIRECTORY src
)

rclcpp_components_register_node(${PROJECT_NAME}
    PLUGIN "hathaway_video_dummy::HathawayPublisher" # C++の登録名
    EXECUTABLE hathaway_publisher                    # 実行ファイル名
)

install(DIRECTORY media launch
  DESTINATION share/${PROJECT_NAME}
)

ament_auto_package(
    USE_SCOPED_HEADER_INSTALL_DIR
)
