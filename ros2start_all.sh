#!/bin/bash
PASS_XPS="12261226kei"
PASS_RPI="hiraken"
PASS_IDEA="hiraken"

cd ~/Dev/Hairobo/hairobo_ws

# セッションの作成（最初のウィンドウ名を xps13 に設定）
tmux new-session -d -s ros2start -n xps13

# 1. 左側 (xps13)
tmux send-keys -t ros2start:xps13 "cd /home/amuratakamitamu/Dev/Hairobo/hairobo_ws" C-m
sleep 2
tmux send-keys -t ros2start:xps13 "echo '$PASS_XPS' | sudo -S -E bash ./ros2start.sh" C-m

# 2. 真ん中 (rpi4b) ペイン作成
tmux split-window -h -t ros2start:xps13
tmux send-keys -t ros2start:xps13.1 "ssh hiraken@192.168.1.11" Enter
sleep 2 
tmux send-keys -t ros2start:xps13.1 "cd /home/hiraken/Dev/hairobo_ws" C-m
tmux send-keys -t ros2start:xps13.1 "echo '$PASS_RPI' | sudo -S -E bash ./ros2start.sh" C-m

# 3. 右側 (ideapad) ペイン作成
tmux split-window -h -t ros2start:xps13.1
tmux send-keys -t ros2start:xps13.2 "ssh hiraken@192.168.1.13" Enter
sleep 2
tmux send-keys -t ros2start:xps13.2 "cd /home/hiraken/Dev/hairobo_ros2_ideapad" C-m
tmux send-keys -t ros2start:xps13.2 "echo '$PASS_IDEA' | sudo -S -E bash ./ros2start.sh" C-m

# レイアウトを均等に整列
tmux select-layout -t ros2start:xps13 even-horizontal

# セッションをアタッチ
tmux attach-session -t ros2start
