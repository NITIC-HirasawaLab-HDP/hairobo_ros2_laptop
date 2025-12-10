import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

interface EncoderRProps {
	ros: ROSLIB.Ros | null;
}

const EncoderRight: React.FC<EncoderRProps> = ({ ros }) => {
	const [encoderValue, setEncoderValue] = useState<number | null>(null);

	useEffect(() => {
		if (!ros) return;

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
			value={encoderValue.toString()}
			valueClassName="bg-blue-500/20"
		/>
	);
};

export default EncoderRight;
