import React from 'react';
import Toggle from '../ui/toggle';
import ROSLIB from 'roslib';

interface PowerButtonProps {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	label?: string;
}

const PowerButton: React.FC<PowerButtonProps> = ({
	checked,
	onChange,
	disabled = false,
	className = '',
	label = 'Power',
}) => {
	const isControlled = checked !== undefined;
	const [internalChecked, setInternalChecked] = React.useState<boolean>(
		checked !== undefined ? Boolean(checked) : true
	);

	// ROS接続とトピックの管理
	React.useEffect(() => {
		// ROSへの接続（WebSocketのURLは環境に合わせて変更してください）
		const ros = new ROSLIB.Ros({
			url: 'ws://localhost:9090'
		});

		// トピックの定義
		const powerTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/power',
			messageType: 'std_msgs/Bool'
		});

		// 接続時の処理
		ros.on('connection', () => {
			console.log('Connected to websocket server.');
			// 常時アドバタイズするためにadvertiseを呼ぶ
			powerTopic.advertise();
		});

		ros.on('error', (error) => {
			console.log('Error connecting to websocket server: ', error);
		});

		ros.on('close', () => {
			console.log('Connection to websocket server closed.');
		});

		// 現在の状態を送信する関数
		const publishState = (state: boolean) => {
			const msg = new ROSLIB.Message({
				data: state
			});
			powerTopic.publish(msg);
		};

		// 初期状態または変更時に送信（依存配列の値が変わるたびに実行されるため）
		const currentState = isControlled ? Boolean(checked) : internalChecked;
		// 接続が確立されるまで少し待つ必要がある場合がありますが、
		// ここではシンプルに接続確立後に送信されることを期待します
		if (ros.isConnected) {
			publishState(currentState);
		}

		// クリーンアップ
		return () => {
			powerTopic.unadvertise();
			ros.close();
		};
	}, []); // マウント時に一度だけ接続設定を行う（実際には状態変更時の送信ロジックを分けるのがベターですが、シンプルにします）

	// 状態変更時にメッセージを送信するためのEffect
	React.useEffect(() => {
		const ros = new ROSLIB.Ros({ url: 'ws://localhost:9090' });
		const powerTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/power',
			messageType: 'std_msgs/Bool'
		});

		ros.on('connection', () => {
			const currentState = isControlled ? Boolean(checked) : internalChecked;
			const msg = new ROSLIB.Message({ data: currentState });
			powerTopic.publish(msg);
			ros.close(); // 送信だけして閉じる（常時接続は上のEffectで管理）
		});
	}, [checked, internalChecked, isControlled]);

	React.useEffect(() => {
		if (isControlled) setInternalChecked(Boolean(checked));
	}, [checked, isControlled]);

	const current = isControlled ? Boolean(checked) : internalChecked;

	const handleChange = (next: boolean) => {
		if (!isControlled) setInternalChecked(next);
		onChange?.(next);
	};

	return (
		<div className={`flex items-center justify-center gap-3 w-full ${className}`}>
			{/* Toggle */}
			<Toggle
				title={label}
				checked={current}
				onChange={handleChange}
				disabled={disabled}
				className="w-full"
			/>
		</div>
	);
};

export default PowerButton;
