#!/bin/bash

# --- 1. 標準のROS 2ワークスペース環境を読み込む ---
source install/setup.sh

# --- 2. DDSネットワーク設定の環境変数を読み込む ---
# export FASTRTPS_DEFAULT_PROFILES_FILE=src/hairobo_config/fastdds_profile.xml

# --- 3. わかりやすくメッセージを表示 (任意) ---
echo "[Hairobo Setup] ROS 2ワークスペースとDDS設定を読み込みました。"
echo "   (Network IF: $FASTRTPS_DEFAULT_PROFILES_FILE)"
