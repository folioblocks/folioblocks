import {
	BaseControl,
	Button,
	Popover,
	ColorPalette,
	TabPanel,
} from "@wordpress/components";
import { useState, useRef } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

function useThemePalette() {
	return useSelect((select) => {
		const settings = select("core/block-editor").getSettings();
		return {
			themeColors: settings?.colors ?? [],
			disableCustomColors: !!settings?.disableCustomColors,
		};
	}, []);
}

export default function CompactColorControl({ label, value, onChange, help }) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef();

	const { themeColors, disableCustomColors } = useThemePalette();

	return (
		<BaseControl
			label={label}
			help={help}
			__nextHasNoMarginBottom
			className="pb-compact-color-control"
			style={{ width: "100%" }}
		>
			<div
				style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
			>
				<Button
					ref={buttonRef}
					onClick={() => setIsOpen((v) => !v)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						width: "100%",
						height: 42,
						flex: 1,
						justifyContent: "space-between",
						border: "1px solid #ddd",
						borderRadius: 2,
					}}
					__next40pxDefaultSize
				>
					<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span
							aria-hidden="true"
							style={{
								width: 20,
								height: 20,
								borderRadius: 999,
								background: value || "transparent",
								border: "1px solid #ccc",
								display: "inline-block",
							}}
						/>
						<span
							style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.9 }}
						>
							{value || __("None", "folioblocks")}
						</span>
					</span>
				</Button>
			</div>

			{isOpen && (
				<Popover
					anchor={buttonRef.current}
					placement="bottom-start"
					onClose={() => setIsOpen(false)}
					focusOnMount="firstElement"
				>
					<div style={{ padding: 12, width: 260 }}>
						<ColorPalette
							colors={themeColors}
							value={value}
							onChange={onChange}
							disableCustomColors={disableCustomColors}
							__experimentalIsRenderedInSidebar
						/>
					</div>
				</Popover>
			)}
		</BaseControl>
	);
}

export function CompactTwoColorControl({
	label,
	value,
	onChange,
	firstLabel = __("Default", "folioblocks"),
	secondLabel = __("Hover", "folioblocks"),
}) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef();
	const { themeColors, disableCustomColors } = useThemePalette();

	const first = value?.first;
	const second = value?.second;

	const setFirst = (next) => onChange({ ...(value || {}), first: next });
	const setSecond = (next) => onChange({ ...(value || {}), second: next });

	return (
		<BaseControl
			label={label}
			__nextHasNoMarginBottom
			className="pb-compact-two-color-control"
			style={{ width: "100%" }}
		>
			<div style={{ width: "100%" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						width: "100%",
					}}
				>
					<Button
						ref={buttonRef}
						onClick={() => setIsOpen((v) => !v)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							width: "100%",
							height: 42,
							flex: 1,
							justifyContent: "space-between",
							border: "1px solid #ddd",
							borderRadius: 2,
						}}
						__next40pxDefaultSize
					>
						<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<span
								aria-hidden="true"
								style={{
									width: 20,
									height: 20,
									borderRadius: 999,
									background: first || "transparent",
									border: "1px solid #ccc",
									display: "inline-block",
								}}
							/>
							<span
								aria-hidden="true"
								style={{
									width: 20,
									height: 20,
									borderRadius: 999,
									background: second || "transparent",
									border: "1px solid #ccc",
									display: "inline-block",
								}}
							/>
							<span style={{ fontSize: 12, opacity: 0.9 }}>
								{firstLabel} / {secondLabel}
							</span>
						</span>
					</Button>
				</div>

				{isOpen && (
					<Popover
						anchor={buttonRef.current}
						placement="bottom-start"
						onClose={() => setIsOpen(false)}
						focusOnMount="firstElement"
					>
						<div style={{ padding: 12, width: 280 }}>
							<TabPanel
								className="pb-compact-two-color-tabs"
								tabs={[
									{ name: "first", title: firstLabel },
									{ name: "second", title: secondLabel },
								]}
							>
								{(tab) => (
									<ColorPalette
										colors={themeColors}
										value={tab.name === "first" ? first : second}
										onChange={tab.name === "first" ? setFirst : setSecond}
										disableCustomColors={disableCustomColors}
										__experimentalIsRenderedInSidebar
									/>
								)}
							</TabPanel>
						</div>
					</Popover>
				)}
			</div>
		</BaseControl>
	);
}
