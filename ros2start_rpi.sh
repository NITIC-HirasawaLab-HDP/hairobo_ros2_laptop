#!/bin/bash
PASS_RPI="hiraken"
tmux new-session -d -s ros2start
tmux send-keys -t ros2start:0.0 "ssh hiraken@192.168.1.11" Enter
sleep 2 
tmux send-keys -t ros2start:0.0 "cd /home/hiraken/Dev/hairobo_ws" C-m
tmux send-keys -t ros2start:0.0 "echo '$PASS_RPI' | sudo -S -E bash ./ros2start.sh" C-m