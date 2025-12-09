import React from 'react';
import Toggle from '../ui/toggle';

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
