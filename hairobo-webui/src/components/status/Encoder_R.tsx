import React, { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface EncoderRProps {
	ros: ROSLIB.Ros | null;
}

const EncoderRight: React.FC<EncoderRProps> = ({ ros }) => {
	const storageKey = 'status_panel_encoder_right';
	const [encoderValue, setEncoderValue] = useState<number | null>(() => {
		const saved = sessionStorage.getItem(storageKey);
		return saved ? parseFloat(saved) : null;
	});
	const hasConnected = useRef(false);

	useEffect(() => {
		if (encoderValue !== null) {
			sessionStorage.setItem(storageKey, encoderValue.toString());
		} else {
			sessionStorage.removeItem(storageKey);
		}
	}, [encoderValue]);

	useEffect(() => {
		if (!ros) {
			if (hasConnected.current) {
				setEncoderValue(null);
			}
			return;
		}

		hasConnected.current = true;

		// エンコーダー左のトピックを作成
		const encoderTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/encoder_right',
			messageType: 'std_msgs/Float32'
		});

		// メッセージを受信したときの処理
		encoderTopic.subscribe((message: any) => {
			setEncoderValue(message.data);
		});

		// コンポーネントのアンマウント時に購読を解除
		return () => {
			encoderTopic.unsubscribe();
		};
	}, [ros]);

	// 値がまだ来ていない場合の表示
	if (encoderValue === null) {
		return (
			<Status
				title="Encoder Right"
				value="--"
				valueClassName="bg-gray-200"
			/>
		);
	}

	// 値が来ている場合の表示
	return (
		<Status
			title="Encoder Right"
			value={(Math.trunc(encoderValue * 100) / 100).toFixed(2)}
			valueClassName="bg-blue-500/20"
		/>
	);
};

export default EncoderRight;
