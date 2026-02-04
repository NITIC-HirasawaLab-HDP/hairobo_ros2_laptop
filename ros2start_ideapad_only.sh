# #!/bin/bash

# # rpi4b ターミナル
# mate-terminal -- bash -c "ssh hiraken@192.168.1.11; \
#     cd /home/hiraken/Dev/hairobo_ws; \
#     echo 'hiraken' | sudo -S -E bash ./ros2start.sh: \
#     exec bash"

# # ideapad ターミナル
# mate-terminal -- bash -c "cd /home/hiraken/Dev/hairobo_ros2_ideapad; \
#     echo 'hiraken' | sudo -S -E bash ./ros2start.sh; \
#     exec bash"

# # laptop ターミナル
# mate-terminal -- bash -c "cd /home/hiraken/Dev/hairobo_ros2_laptop; \
#     source ~/Dev/hairobo_ros2_laptop/install/setup.sh; \
#     ros2 launch hairobo_bringup bringup.launch.xml; \
#     exec bash"

# # rviz ターミナル
# mate-terminal -- bash -c "cd /home/hiraken/Dev/hairobo_ros2_laptop; \
#     source ~/Dev/hairobo_ros2_laptop/install/setup.bash; \
#    ros2 launch hairobo_rviz ydlidar_view.launch.xml
#     exec bash"


#!/bin/bash

# tmuxセッションを作成
tmux new-session -d -s hairobo

# ウィンドウを4つのペインに分割
tmux split-window -h
tmux split-window -v
tmux select-pane -t 0
tmux split-window -v

# ペイン0: rpi4b
tmux select-pane -t 0
tmux send-keys "ssh hiraken@192.168.1.11" C-m
tmux send-keys "cd /home/hiraken/Dev/hairobo_ws" C-m
tmux send-keys "echo 'hiraken' | sudo -S -E bash ./ros2start.sh" C-m

# ペイン1: ideapad
tmux select-pane -t 1
tmux send-keys "cd /home/hiraken/Dev/hairobo_ros2_ideapad" C-m
tmux send-keys "echo 'hiraken' | sudo -S -E bash ./ros2start.sh" C-m

# ペイン2: laptop
tmux select-pane -t 2
tmux send-keys "cd /home/hiraken/Dev/hairobo_ros2_laptop" C-m
tmux send-keys "source ~/Dev/hairobo_ros2_laptop/install/setup.bash" C-m
tmux send-keys "ros2 launch hairobo_bringup bringup.launch.xml" C-m

# ペイン3: rviz
tmux select-pane -t 3
tmux send-keys "cd /home/hiraken/Dev/hairobo_ros2_laptop" C-m
tmux send-keys "source ~/Dev/hairobo_ros2_laptop/install/setup.bash" C-m
tmux send-keys "ros2 launch hairobo_rviz ydlidar_view.launch.xml" C-m

# セッションにアタッチ
tmux attach-session -t hairobo