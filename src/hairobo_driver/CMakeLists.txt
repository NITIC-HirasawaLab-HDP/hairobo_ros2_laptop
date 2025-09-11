cmake_minimum_required(VERSION 3.8)
project(hairobo_driver)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)


add_executable(dualshock4_node src/dualshock4_node.cpp)
ament_target_dependencies(dualshock4_node rclcpp sensor_msgs)

install(TARGETS
  dualshock4_node
DESTINATION lib/${PROJECT_NAME})

install(
  DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
