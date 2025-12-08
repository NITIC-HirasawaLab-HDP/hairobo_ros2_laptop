import React from 'react';

interface ToggleProps {
	title: string;
	checked?: boolean; // 制御コンポーネント向け
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
	title,
	checked,
	onChange,
	disabled = false,
	className = '',
}) => {
	const isControlled = checked !== undefined;
	const [internalChecked, setInternalChecked] = React.useState<boolean>(
		Boolean(checked)
	);

	// 外部から checked が変わったら同期
	React.useEffect(() => {
		if (isControlled) setInternalChecked(Boolean(checked));
	}, [checked, isControlled]);

	const active = isControlled ? Boolean(checked) : internalChecked;

	const handleToggle = () => {
		if (disabled) return;
		const next = !active;
		if (!isControlled) setInternalChecked(next);
		onChange?.(next);
	};

	return (
		<div className="bg-background/10 backdrop-blur-md px-1 py-1 rounded-full border border-foreground/10 border-gray-300 shadow-xl flex items-center justify-center gap-3">
			{/* タイトル */}
			<div className="text-base font-semibold text-foreground pl-3">
				{title}
			</div>

			{/* シンプルなトグル */}
			<button
				type="button"
				role="switch"
				aria-checked={active}
				disabled={disabled}
				onClick={handleToggle}
				className={`relative inline-flex items-center transition-colors duration-150 rounded-full w-12 h-6 focus:outline-none ${active ? 'bg-[#632BDB]' : 'bg-gray-200'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
			>
				{/* ノブ */}
				<span
					className={`inline-block bg-white rounded-full h-5 w-5 transform transition-transform duration-150 ${active ? 'translate-x-6' : 'translate-x-1'
						}`}
				/>
			</button>
		</div>
	);
};

export default Toggle;
