cmake_minimum_required(VERSION 3.8)
project(koji_dummy)

find_package(ament_cmake_auto REQUIRED)

ament_auto_find_build_dependencies()

# OpenCV is used for VideoCapture and image encoding; ensure we link against its libs
find_package(OpenCV REQUIRED COMPONENTS core imgcodecs videoio imgproc)

# ライブラリターゲット名をプロジェクト名と分ける（衝突回避）
ament_auto_add_library(${PROJECT_NAME}_lib SHARED
    DIRECTORY src
)

# Link OpenCV libraries to the generated library target so symbols like cv::VideoCapture
# are resolved at runtime.
target_link_libraries(${PROJECT_NAME}_lib ${OpenCV_LIBS})

# コンポーネント登録：ライブラリターゲット名を指定し、プラグイン名は名前空間::クラス名 に合わせる
rclcpp_components_register_node(${PROJECT_NAME}_lib
    PLUGIN "koji_dummy::KojiPublisher" # C++の登録名（パッケージ名::クラス名）
    EXECUTABLE koji_dummy              # 実行ファイル名
)

install(DIRECTORY media launch
  DESTINATION share/${PROJECT_NAME}
)

ament_auto_package(
    USE_SCOPED_HEADER_INSTALL_DIR
)
