import React, { useState } from 'react';

interface ToggleProps {
	onToggle: (isOn: boolean) => void; // トグルの状態を親コンポーネントに通知する関数
}

const Toggle: React.FC<ToggleProps> = ({ onToggle }) => {
	const [isOn, setIsOn] = useState(false); // トグルの初期状態

	const handleClick = () => {
		const newState = !isOn; // トグルの状態を反転
		setIsOn(newState);
		onToggle(newState); // 親コンポーネントに新しい状態を通知
	};

	return (
		<button onClick={handleClick}>
			{isOn ? 'ON' : 'OFF'} {/* トグルの状態を表示 */}
		</button>
	);
};

export default Toggle; // トグルコンポーネントをエクスポート
