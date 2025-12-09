import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import Status from '../ui/status';

// バッテリー電圧の警告しきい値 (V)
const BATTERY_THRESHOLD = 20.0;

interface BatteryProps {
	ros: ROSLIB.Ros | null;
}

const Battery: React.FC<BatteryProps> = ({ ros }) => {
	const [batteryLevel, setBatteryLevel] = useState<number | null>(null); // 初期値をnullに変更

	useEffect(() => {
		if (!ros) return;

		// バッテリー情報のトピックを作成
		const batteryTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/battery',
			messageType: 'std_msgs/Float32'
		});

		// メッセージを受信したときの処理
		batteryTopic.subscribe((message: any) => {
			setBatteryLevel(message.data);
		});

		// コンポーネントのアンマウント時に購読を解除
		return () => {
			batteryTopic.unsubscribe();
		};
	}, [ros]);

	// 値がまだ来ていない場合の表示
	if (batteryLevel === null) {
		return (
			<Status
				title="Battery"
				value="--"
				valueClassName="bg-gray-200"
			/>
		);
	}

	// しきい値を下回ったら赤、それ以外は緑
	const statusColor = batteryLevel < BATTERY_THRESHOLD ? 'bg-red-500/20' : 'bg-green-500/20';

	// 小数点第2位未満を切り捨てて表示するための計算
	const displayVoltage = Math.floor(batteryLevel * 100) / 100;

	return (
		<Status
			title="Battery"
			value={`${displayVoltage.toFixed(2)} V`}
			valueClassName={statusColor}
		/>
	);
};

export default Battery;
