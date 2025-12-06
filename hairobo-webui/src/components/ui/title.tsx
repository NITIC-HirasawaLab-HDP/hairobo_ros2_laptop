import React from 'react';

interface StatusProps {
	title: string;
}

const Title: React.FC<StatusProps> = ({ title }) => {
	return (
		<div className="bg-white p-1 rounded-full border border-foreground/10 border-gray-300 shadow-xl flex items-center justify-center gap-3">
			<div className="text-base font-semibold text-foreground">
				{title}
			</div>
		</div>
	);
};

export default Title;
