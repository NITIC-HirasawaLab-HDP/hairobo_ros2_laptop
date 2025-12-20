import React, { useEffect, useState, useRef } from 'react';
import ROSLIB from 'roslib';

// sensor_msgs/Joyメッセージの型定義
interface JoyMessage {
	axes: number[];
	buttons: number[];
}

interface GamepadState {
	leftStickX: number;
	leftStickY: number;
	rightStickX: number;
	rightStickY: number;
	leftTrigger: number;
	rightTrigger: number;
	buttons: boolean[];
}

interface GamepadVisualizerProps {
	ros: ROSLIB.Ros | null;
}

const GamepadVisualizer: React.FC<GamepadVisualizerProps> = ({ ros }) => {
	const [gamepadState, setGamepadState] = useState<GamepadState>({
		leftStickX: 0,
		leftStickY: 0,
		rightStickX: 0,
		rightStickY: 0,
		leftTrigger: 0,
		rightTrigger: 0,
		buttons: new Array(20).fill(false),
	});
	const [isConnected, setIsConnected] = useState(false);
	const hasConnected = useRef(false);

	useEffect(() => {
		if (!ros) {
			if (hasConnected.current) {
				setIsConnected(false);
			}
			return;
		}

		hasConnected.current = true;

		const joyTopic = new ROSLIB.Topic({
			ros: ros,
			name: '/joy',
			messageType: 'sensor_msgs/Joy'
		});

		joyTopic.subscribe((message: any) => {
			const joyMsg = message as JoyMessage;
			setIsConnected(true);

			setGamepadState({
				leftStickX: joyMsg.axes[0] ?? 0,
				leftStickY: joyMsg.axes[1] ?? 0,
				rightStickX: joyMsg.axes[3] ?? 0,
				rightStickY: joyMsg.axes[4] ?? 0,
				leftTrigger: joyMsg.axes[2] ?? 0,
				rightTrigger: joyMsg.axes[5] ?? 0,
				buttons: joyMsg.buttons.map(b => b === 1),
			});
		});

		return () => {
			joyTopic.unsubscribe();
		};
	}, [ros]);

	// スティック位置（-1~1 を -10~10px に変換）
	const getStickOffset = (x: number, y: number) => ({
		x: -x * 10,
		y: -y * 10,
	});

	// トリガー値を正規化
	const getTriggerFill = (value: number) => {
		const normalized = (1 - value) / 2;
		return Math.max(0, Math.min(1, normalized));
	};

	const isPressed = (index: number) => gamepadState.buttons[index] ?? false;

	// ボタンインデックス
	const BTN_A = 0, BTN_B = 1, BTN_X = 2, BTN_Y = 3;
	const BTN_L1 = 4, BTN_R1 = 5;
	const DPAD_UP = 11, DPAD_DOWN = 12, DPAD_LEFT = 13, DPAD_RIGHT = 14;

	const activeColor = '#3B82F6';
	const strokeColor = '#334155';
	const bgColor = '#f8fafc';

	// --- 定数化（マジックナンバー回避） ---
	const SVG_WIDTH = 180;
	const SVG_HEIGHT = 120; // 縦を広げて下が見切れないようにする

	// トリガー（L2/R2）サイズを小さくする
	const TRIGGER_WIDTH = 18;   // 以前は20
	const TRIGGER_HEIGHT = 18;  // 以前は25
	const TRIGGER_RX = 5;
	const TRIGGER_X = -TRIGGER_WIDTH / 2; // 中央寄せ
	const TRIGGER_Y = 5;

	// L1/R1 のサイズ・位置（トリガー下に配置）
	const L1_WIDTH = 28;
	const L1_HEIGHT = 10;
	const L1_RX = 4;
	const L1_X = -L1_WIDTH / 2;
	const L1_Y = TRIGGER_Y + TRIGGER_HEIGHT + 6; // トリガーの下に少しスペース

	// スティック / ボタン群の配置（以前に導入した定数を利用）
	const leftStick = getStickOffset(gamepadState.leftStickX, gamepadState.leftStickY);
	const rightStick = getStickOffset(gamepadState.rightStickX, gamepadState.rightStickY);

	// 定数化してスティック/ボタン群を下に少し移動（トリガーと被らないようにする）
	const LEFT_GROUP_X = 45;
	const RIGHT_GROUP_X = 135;
	const STICK_TOP_Y = 63; // 必要なら微調整
	const BUTTONS_TOP_Y = STICK_TOP_Y + 30; // スティックの下にボタン群を配置

	const leftStickTransform = `translate(${LEFT_GROUP_X}, ${STICK_TOP_Y})`;
	const dpadTransform = `translate(${LEFT_GROUP_X}, ${BUTTONS_TOP_Y})`;
	const abxyTransform = `translate(${RIGHT_GROUP_X}, ${STICK_TOP_Y})`;
	const rightStickTransform = `translate(${RIGHT_GROUP_X}, ${BUTTONS_TOP_Y})`;

	return (
		<div className="bg-white px-4 py-3 rounded-2xl border border-gray-300 shadow-xl">
			<div className="text-sm font-semibold text-gray-600 mb-2 text-center">
				Gamepad {isConnected ? '' : '(Waiting...)'}
			</div>

			{/* viewBox を定数で設定（縦を広げる） */}
			<svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full" style={{ maxWidth: '240px', margin: '0 auto', display: 'block' }}>
				{/* 左側: L2 + L1 */}
				<g transform="translate(30, 0)">
					{/* L2 (サイズ小さくして位置は同じ) */}
					<rect
						x={TRIGGER_X} y={TRIGGER_Y} width={TRIGGER_WIDTH} height={TRIGGER_HEIGHT} rx={TRIGGER_RX}
						fill={getTriggerFill(gamepadState.leftTrigger) > 0.1 ? activeColor : 'white'}
						fillOpacity={getTriggerFill(gamepadState.leftTrigger) > 0.1 ? 0.3 + getTriggerFill(gamepadState.leftTrigger) * 0.7 : 1}
						stroke={strokeColor} strokeWidth="2"
					/>
					{/* L1 (トリガー高さに合わせて下に配置) */}
					<rect
						x={L1_X} y={L1_Y} width={L1_WIDTH} height={L1_HEIGHT} rx={L1_RX}
						fill={isPressed(BTN_L1) ? activeColor : 'white'}
						stroke={strokeColor} strokeWidth="2"
					/>
				</g>

				{/* 右側: R2 + R1 */}
				<g transform="translate(150, 0)">
					{/* R2 (小さくする) */}
					<rect
						x={TRIGGER_X} y={TRIGGER_Y} width={TRIGGER_WIDTH} height={TRIGGER_HEIGHT} rx={TRIGGER_RX}
						fill={getTriggerFill(gamepadState.rightTrigger) > 0.1 ? activeColor : 'white'}
						fillOpacity={getTriggerFill(gamepadState.rightTrigger) > 0.1 ? 0.3 + getTriggerFill(gamepadState.rightTrigger) * 0.7 : 1}
						stroke={strokeColor} strokeWidth="2"
					/>
					{/* R1 */}
					<rect
						x={L1_X} y={L1_Y} width={L1_WIDTH} height={L1_HEIGHT} rx={L1_RX}
						fill={isPressed(BTN_R1) ? activeColor : 'white'}
						stroke={strokeColor} strokeWidth="2"
					/>
				</g>

				{/* 左スティック（少し下に移動） */}
				<g transform={leftStickTransform}>
					<circle cx="0" cy="0" r="16" fill={bgColor} stroke={strokeColor} strokeWidth="2" />
					<circle
						cx={leftStick.x} cy={leftStick.y} r="10"
						fill={isPressed(9) ? activeColor : 'white'}
						stroke={strokeColor} strokeWidth="2"
					/>
				</g>

				{/* D-Pad（左ボタン）をスティックの下に配置 */}
				<g transform={dpadTransform}>
					<circle cx="0" cy="0" r="12" fill={bgColor} stroke={strokeColor} strokeWidth="1.5" />
					<polygon points="0,-9 -4,-3 4,-3" fill={isPressed(DPAD_UP) ? activeColor : strokeColor} />
					<polygon points="0,9 -4,3 4,3" fill={isPressed(DPAD_DOWN) ? activeColor : strokeColor} />
					<polygon points="-9,0 -3,-4 -3,4" fill={isPressed(DPAD_LEFT) ? activeColor : strokeColor} />
					<polygon points="9,0 3,-4 3,4" fill={isPressed(DPAD_RIGHT) ? activeColor : strokeColor} />
				</g>

				{/* ABXY（右ボタン）を上寄せ、右スティックはその下に */}
				<g transform={abxyTransform}>
					<circle cx="0" cy="0" r="12" fill={bgColor} stroke={strokeColor} strokeWidth="1.5" />
					<circle cx="0" cy="-7" r="4" fill={isPressed(BTN_X) ? activeColor : 'white'} stroke={strokeColor} strokeWidth="1" />
					<circle cx="0" cy="7" r="4" fill={isPressed(BTN_A) ? activeColor : 'white'} stroke={strokeColor} strokeWidth="1" />
					<circle cx="-7" cy="0" r="4" fill={isPressed(BTN_Y) ? activeColor : 'white'} stroke={strokeColor} strokeWidth="1" />
					<circle cx="7" cy="0" r="4" fill={isPressed(BTN_B) ? activeColor : 'white'} stroke={strokeColor} strokeWidth="1" />
				</g>

				{/* 右スティックを右ボタンの下に配置 */}
				<g transform={rightStickTransform}>
					<circle cx="0" cy="0" r="16" fill={bgColor} stroke={strokeColor} strokeWidth="2" />
					<circle
						cx={rightStick.x} cy={rightStick.y} r="10"
						fill={isPressed(10) ? activeColor : 'white'}
						stroke={strokeColor} strokeWidth="2"
					/>
				</g>
			</svg>
		</div>
	);
};

export default GamepadVisualizer;
