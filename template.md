

## CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.8)
project(パッケージ名)

find_package(ament_cmake_auto REQUIRED)
ament_auto_find_build_dependencies()

ament_auto_add_library(${PROJECT_NAME} SHARED
    DIRECTORY src
)

rclcpp_components_register_node(${PROJECT_NAME}
    PLUGIN "ネームスペース::クラス名"
    EXECUTABLE 実行可能ファイル名
)

ament_auto_package(USE_SCOPED_HEADER_INSTALL_DIR)
```

## package.xml

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>パッケージ名</name>
  <version>1.0.0</version>
  <description>説明文</description>
  <maintainer email="メアド">メンテナ名</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake_auto</buildtool_depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <depend>rclcpp</depend>
  <depend>rclcpp_components</depend>
  <!-- <depend>追加の依存関係</depend> -->

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

## License

```plaintext
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
```

## hpp

```cpp
#ifndef __ヘッダー名_HPP__
#define __ヘッダー名_HPP__

#include "rclcpp/rclcpp.hpp"

// クオータニオン変換が必要なときは追加
// #include "tf2/LinearMath/Quaternion.hpp"
// #include "tf2/utils.hpp"

#include "メッセージ型ヘッダー.hpp"

namespace ネームスペース {
class クラス名 : public rclcpp::Node {
public:
    クラス名 (const rclcpp::NodeOptions &node_options);
    ~クラス名 ();

private:
    // パラメータ宣言例:
    型 parameter_;

    // コールバック関数宣言例:
    void コールバック関数名(const メッセージ型::SharedPtr msg);
    void タイマーコールバック関数名();

    // メンバ変数宣言例:
    rclcpp::Publisher<メッセージ型>::SharedPtr publisher_;
    rclcpp::Subscription<メッセージ型>::SharedPtr subscriber_;
    rclcpp::TimerBase::SharedPtr timer_;
};
}  // namespace ネームスペース

#endif  // __ヘッダー名_HPP__
```

## cpp

```cpp
#include "パッケージ名/ヘッダー名.hpp"

namespace ネームスペース {

クラス名::クラス名(const rclcpp::NodeOptions & node_options) : Node("ノード名", node_options) {
    // コンストラクタ内容

    // パブリッシャー、サブスクライバー 宣言例:
    publisher_ = this->create_publisher<メッセージ型>("トピック名", キューサイズ);
    subscriber_ = this->create_subscription<メッセージ型>(
        "トピック名", キューサイズ,
        std::bind(&クラス名::コールバック関数名, this, std::placeholders::_1)
    );

    // パラメータ宣言例:
    parameter_ = this->declare_parameter<型>("パラメータ名", デフォルト値);

    // タイマー宣言例:
    timer_ = this->create_wall_timer(
        std::chrono::milliseconds(周期),
        std::bind(&クラス名::タイマーコールバック関数名, this)
    );
}

クラス名::~クラス名() {
    // デストラクタ内容
}

void クラス名::コールバック関数名(const メッセージ型::SharedPtr msg) {
    // 受信コールバック内容
msg->データメンバ名 でアクセス可能
}

void クラス名::タイマーコールバック関数名() {
// タイマーコールバック内容
}

}  // namespace ネームスペース

#include "rclcpp_components/register_node_macro.hpp"
RCLCPP_COMPONENTS_REGISTER_NODE(ネームスペース::クラス名)
```

## .launch.xml
```xml
<?xml version="1.0"?>
<launch>

  <!-- ノードA：センサやメイン処理 -->
  <node pkg="package_name" exec="executable_a" name="node_a" ns="ns_a" output="screen">
    <param name="param_name" value="value"/>              <!-- パラメータ設定 -->
    <remap from="/original/topic" to="/new/topic"/>       <!-- トピック名変更 -->
  </node>

  <!-- ノードB：補助処理や可視化 -->
  <node pkg="package_name" exec="executable_b" name="node_b" ns="ns_b" output="screen">
    <!-- ここに必要ならparam/remapを追加 -->
  </node>

</launch>
```

## bringup.launch.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<launch>

    <!-- パッケージ名 の {hoge}.launch.py をインクルード -->
    <include file="$(find-pkg-share パッケージ名)/launch/ほげ.launch.py" />

    <!-- ここに他のパッケージの launch ファイルを追加可能 -->
    <!-- 例：
    <include file="$(find-pkg-share package_b)/launch/some_launch.launch.py" />
    <include file="$(find-pkg-share package_c)/launch/another.launch.xml" />
    -->

    <!-- コマンドから他のファイルを実行 -->
    <executable cmd="コマンド" cwd="$(var ディレクトリ)" output="screen"></executable>

</launch>
```

>[!important]
>以下のpythonを使ったlaunchファイルは極力使用せず、上記のxml形式を使用すること。

## .launch.py
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    # --- ノードAの設定 ---
    node_a = Node(
        package='package_name',       # 実行するパッケージ名
        executable='executable_a',    # setup.pyのエントリポイントで指定した実行ファイル名
        name='node_a',                # ノード名（ros2 node listで表示される名前）
        namespace='ns_a',             # 名前空間（任意）
        output='screen',              # ログを端末に出力
        parameters=[
            {'param_name': 'value'}   # パラメータ設定（必要な場合）
        ],
        remappings=[
            ('/original/topic', '/new/topic') # トピック名の変更（必要な場合）
        ]
    )

    # --- ノードBの設定 ---
    node_b = Node(
        package='package_name',       # 同じパッケージでも、別のパッケージでも可
        executable='executable_b',
        name='node_b',
        namespace='ns_b',
        output='screen'
    )

    # LaunchDescriptionにリスト形式で記述して返す
    return LaunchDescription([
        node_a,
        node_b,
    ])
```

## bringup.launch.py
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
# ---add imports here---

# ----------------------


def generate_launch_description():

    # get package_a launch file path
    package_a_launch_dir = os.path.join(
        get_package_share_directory('package_a'),
        'launch'
    )

    # include package_a launch file
    launch_package_a = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(package_a_launch_dir, '{hoge}.launch.py')
        )
    )

    # ---add packages here---

    # -----------------------

    return LaunchDescription([
        launch_package_a,
    ])

```
