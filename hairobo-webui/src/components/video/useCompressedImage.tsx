// useCompressedImage.ts
import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

/**
 * CompressedImageトピックを購読し、Base64形式の画像データを返すカスタムフック
 * @param ros ROSLIB.Ros インスタンス (null許容)
 * @param topicName 購読するトピック名
 * @returns Base64形式の画像データ文字列 (例: "data:image/jpeg;base64,...")。データがない場合は空文字。
 */
export const useCompressedImage = (ros: ROSLIB.Ros | null, topicName: string): string => {
	const [imgData, setImgData] = useState<string>('');

	useEffect(() => {
		// ROS接続がない場合、またはトピック名がない場合は何もしない
		if (!ros || !topicName) {
			setImgData(''); // ROSが切断されたら画像もクリア
			return;
		}

		console.log(`Subscribing to image topic: ${topicName}`);

		const imageTopic = new ROSLIB.Topic({
			ros: ros,
			name: topicName,
			messageType: 'sensor_msgs/msg/CompressedImage',
		});

		const callback = (message: any) => {
			if (message.data) {
				// message.data はすでにBase64エンコードされていると仮定
				setImgData(`data:image/jpeg;base64,${message.data}`);
			} else {
				console.warn(`Received empty image data from ${topicName}`);
			}
		};

		const onError = (error: any) => {
			console.error(`Error with topic ${topicName}:`, error);
			setImgData(''); // エラー時もクリア
		};

		// 購読開始
		imageTopic.subscribe(callback);
		imageTopic.on('error', onError);

		// クリーンアップ関数
		return () => {
			console.log(`Unsubscribing from ${topicName}`);
			imageTopic.unsubscribe(callback);
			// roslib.js のバージョンによっては、 'error' イベントリスナーも明示的に削除する必要があるかもしれません
			// imageTopic.removeListener('error', onError);
		};
	}, [ros, topicName]); // ros または topicName が変更されたら再購読

	return imgData;
};
