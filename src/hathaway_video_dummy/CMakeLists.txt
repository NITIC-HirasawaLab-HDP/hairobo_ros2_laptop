cmake_minimum_required(VERSION 3.8)
project(hathaway_video_dummy)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

if(NOT CMAKE_CXX_STANDARD)
  set(CMAKE_CXX_STANDARD 17)
endif()

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(OpenCV REQUIRED)
find_package(ament_index_cpp REQUIRED)

# Build executable
add_executable(hathaway_publisher src/hathaway_publisher.cpp)
ament_target_dependencies(hathaway_publisher
  rclcpp
  sensor_msgs
  OpenCV
  ament_index_cpp
)

# Install executable
install(TARGETS hathaway_publisher
  DESTINATION lib/${PROJECT_NAME}
)

# Install media and launch files
install(DIRECTORY media launch
  DESTINATION share/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  set(ament_cmake_copyright_FOUND TRUE)
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
