#!/usr/bin/env python3
import cv2
import time


def test_camera(device_id):
    print(f"Testing camera device {device_id}...")
    cap = cv2.VideoCapture(device_id, cv2.CAP_V4L2)

    if not cap.isOpened():
        print(f"Failed to open camera device {device_id}")
        return False

    print(f"Camera device {device_id} opened successfully")

    # Get some properties
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    fps = cap.get(cv2.CAP_PROP_FPS)

    print(f"  Width: {width}")
    print(f"  Height: {height}")
    print(f"  FPS: {fps}")

    # Try to read a frame
    for i in range(5):
        ret, frame = cap.read()
        if ret:
            print(f"  Frame {i+1}: Successfully read frame {frame.shape}")
            break
        else:
            print(f"  Frame {i+1}: Failed to read frame")
            time.sleep(0.1)

    cap.release()
    return ret


if __name__ == "__main__":
    for device in range(4):
        success = test_camera(device)
        if success:
            print(f"Device {device} is working!")
        print("-" * 40)
