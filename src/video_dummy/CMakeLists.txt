cmake_minimum_required(VERSION 3.8)
project(video_dummy)

find_package(ament_cmake_auto REQUIRED)
find_package(OpenCV REQUIRED)

ament_auto_find_build_dependencies()

ament_auto_add_library(${PROJECT_NAME} SHARED
    DIRECTORY src
)

target_link_libraries(${PROJECT_NAME} ${OpenCV_LIBS})

rclcpp_components_register_node(${PROJECT_NAME}
    PLUGIN "video_dummy::VideoDummyNode"
    EXECUTABLE video_dummy_node
)

ament_auto_package(
    INSTALL_TO_SHARE
    launch
    config
)
