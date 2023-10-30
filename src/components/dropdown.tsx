import './dropdown.css'

type IProps<T> = {
	disabled?: boolean
	onInput: (value: string) => void
	options: Record<string, T>
	name: string
	value: T
}

export const Dropdown = <T,>(props: IProps<T>) => {
	const selectedValue =
		Object.entries(props.options).find(([, value]) => value === props.value)?.[0] ?? ''

	return (
		<select
			class="dropdown"
			children={Object.keys(props.options).map(children => (
				<option {...{children}} />
			))}
			disabled={props.disabled}
			id={props.name}
			name={props.name}
			onInput={event => props.onInput(event.currentTarget.value)}
			value={selectedValue}
		/>
	)
}
