type IProps = {
	max: number
	min: number
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
				disabled={props.value - props.step <= props.min}
				onClick={() => props.onInput(props.value - props.step)}
			>
				-
			</button>
			<div class="range stretch" title={`${props.min}-${props.max}`}>
				<meter max={props.max} min={props.min} value={props.value}></meter>
				<input
					max={props.max}
					min={props.min}
					onInput={event => props.onInput(event.currentTarget.valueAsNumber)}
					step={props.step}
					type="range"
					value={props.value}
				/>
			</div>
			<button
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
				type="number"
				value={props.value}
			/>
			{props.unit ?? ''}
		</div>
	)
}
