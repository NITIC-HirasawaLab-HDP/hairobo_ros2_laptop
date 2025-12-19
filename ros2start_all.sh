#!/bin/bash
PASS_RPI="hiraken"
PASS_IDEA="hiraken"

# セッションの作成（左側: rpi4b）
tmux new-session -d -s ros2start
tmux send-keys -t ros2start:0.0 "ssh hiraken@192.168.1.11" Enter
sleep 2 
tmux send-keys -t ros2start:0.0 "cd /home/hiraken/Dev/hairobo_ws" C-m
tmux send-keys -t ros2start:0.0 "echo '$PASS_RPI' | sudo -S -E bash ./ros2start.sh" C-m

# 右側 (ideapad) ペイン作成
tmux split-window -h -t ros2start:0.0
tmux send-keys -t ros2start:0.1 "ssh hiraken@192.168.1.13" Enter
sleep 2
tmux send-keys -t ros2start:0.1 "cd /home/hiraken/Dev/hairobo_ros2_ideapad" C-m
tmux send-keys -t ros2start:0.1 "echo '$PASS_IDEA' | sudo -S -E bash ./ros2start.sh" C-m

# レイアウトを均等に整列
tmux select-layout -t ros2start even-horizontal

# セッションをアタッチ
tmux attach-session -t ros2start
