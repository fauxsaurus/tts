import './slider.css'

type IProps = {
	max: number
	min: number
	name: string
	onInput: (value: number) => void
	step: number
	unit?: string
	value: number
}

/** @note REMINDER: DON'T DESTRUCTURE PROPS, ELSE YOU [LOSE REACTIVITY](https://typeofnan.dev/how-to-use-onchange-in-solidjs/)! */
export const Slider = (props: IProps) => {
	return (
		<div class="slider">
			<button
				data-icon="subtract"
				disabled={props.value - props.step <= props.min}
				onClick={() => props.onInput(props.value - props.step)}
			>
				-
			</button>
			<label
				data-value={props.value}
				style={{
					background: `linear-gradient(to right, var(--color-theme) ${
						(props.value / props.max) * 100
					}%, transparent ${(props.value / props.max) * 100}%)`,
				}}
				title={`${props.min}-${props.max}`}
			>
				{props.name}
				<input
					max={props.max}
					min={props.min}
					onInput={event => props.onInput(event.currentTarget.valueAsNumber)}
					step={props.step}
					type="range"
					value={props.value}
				/>
			</label>
			<button
				data-icon="add"
				disabled={props.value + props.step >= props.max}
				onClick={() => props.onInput(props.value + props.step)}
			>
				+
			</button>
			<input
				class="shrink"
				max={props.max}
				min={props.min}
				onInput={event => props.onInput(event.currentTarget.valueAsNumber)}
				step={props.step}
				title={`${props.name}-number-field`}
				type="number"
				value={props.value}
			/>
			{props.unit ?? ''}
		</div>
	)
}
