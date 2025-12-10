import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface EncoderLProps {
	ros: ROSLIB.Ros | null;
}

const EncoderLeft: React.FC<EncoderLProps> = ({ ros }) => {
	const [encoderValue, setEncoderValue] = useState<number | null>(() => {
		const saved = localStorage.getItem('encoder_left_value');
		return saved !== null ? parseFloat(saved) : null;
	});

	useEffect(() => {
		if (!ros) return;

		// エンコーダー左のトピックを作成
		const encoderTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/encoder_left',
			messageType: 'std_msgs/Float32'
		});

		// メッセージを受信したときの処理
		encoderTopic.subscribe((message: any) => {
			setEncoderValue(message.data);
			localStorage.setItem('encoder_left_value', message.data.toString());
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
				title="Encoder Left"
				value="--"
				valueClassName="bg-gray-200"
			/>
		);
	}

	// 値が来ている場合の表示
	return (
		<Status
			title="Encoder Left"
			value={(Math.trunc(encoderValue * 100) / 100).toFixed(2)}
			valueClassName="bg-blue-500/20"
		/>
	);
};

export default EncoderLeft;
