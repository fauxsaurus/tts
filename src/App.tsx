import {createSignal} from 'solid-js'
import './App.css'

/** @todo
 * UX
 * dark mode
 * hide options
 * hide help
 * ✓▼
 * button to put help text into the text area & read aloud
 * save options into local storage (with a version # for switch incremental functionality or just use Object.assign(defaultoptions, saved options||{}))
 * 	highlight spoken text, time taken/remaining (or that very least what sentence chunk out of what--or approximate it? test by trying to get the word count and average speaking speed--possibly with a text with an insisible muted voice at the begining to verify)
 * accessibility
 * SVG & PNG (for iOS... come on, Apple, get your _stuff_ together, it's been a thing for over [*three* years now](https://caniuse.com/link-icon-svg) logo
 * 	skip to link in the before the aside
 * Localization
 * pull all magic strings out & into a localization object
 * spanish & mandarin, see a language you want added?
 * Misc
 * firefox, android, & iPhone styling
 * 	bug fixes, error message banner at the top
 * need to expand centeral column when the sidebars are toggled off
 * position absolute sidebars on portrait with a min rem width
 * CSS grid needs to respect zooming
 * what happens if the text changes between pausing... (need a way to clear that utterance and start anew/from a certain point)
 */

/* <button onClick={() => setCount(count => count + 1)}>count is {count()}</button> */

const CONFIG = {
	exampleText: ['It is better to fail in doing good than to succeed in doing evil.'],

	placholder: `Hi! I'm a text to speech app!
Enter text to read aloud here.`,
}

type IProps = {
	max: number
	min: number
	onInput: (value: number) => void
	step: number
	value: number
}

/** @note REMINDER: DON'T DESTRUCTURE PROPS, ELSE YOU [LOSE REACTIVITY](https://typeofnan.dev/how-to-use-onchange-in-solidjs/)! */
const Slider = (props: IProps) => {
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
		</div>
	)
}

/** @note Plasma */
const synth = globalThis.speechSynthesis
const getVoices = () => synth.getVoices()
const getDefaultVoice = () => getVoices().find(voice => voice.default)

const App = () => {
	const [text, setText] = createSignal(CONFIG.exampleText[0])
	const [voices, setVoices] = createSignal(getVoices())
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [selectedVoice, setSelectedVoice] = createSignal(getDefaultVoice())
	const [utterance] = createSignal(new globalThis.SpeechSynthesisUtterance(text()))

	const [pitch, setPitch] = createSignal(1)
	const [speed, setSpeed] = createSignal(1)
	const [volume, setVolume] = createSignal(100)

	if ('onvoiceschanged' in synth)
		synth.onvoiceschanged = () => {
			setVoices(getVoices())
			if (!selectedVoice()) setSelectedVoice(getDefaultVoice())
		}

	utterance().addEventListener('end', () => setIsPlaying(false))
	utterance().addEventListener('pause', () => setIsPlaying(false))
	utterance().addEventListener('resume', () => setIsPlaying(true))
	utterance().addEventListener('start', () => setIsPlaying(true))

	console.log(pitch(), speed(), volume())

	return (
		<form class="layout-grid" onSubmit={event => event.preventDefault()}>
			<header class="layout-top">
				<button class="toggle-menu" title="options">
					<label for="toggle-menu-options">options/Logo</label>
				</button>
				<h1>
					<abbr title="Text to Speech">TTS</abbr>
				</h1>
				<button class="toggle-menu" title="help">
					<label for="toggle-menu-help">?</label>
				</button>
			</header>
			<input checked hidden id="toggle-menu-options" type="checkbox" />
			<aside class="layout-left menu-options">
				<fieldset>
					<legend>Speed</legend>
					{/* @note actual values are 10-0.1 */}
					<Slider max={10} min={0.1} onInput={setSpeed} step={0.1} value={speed()} />
				</fieldset>
				<fieldset>
					<legend>Voice</legend>
					<label for="option-voice" title="voice"></label>
					<select
						id="option-voice"
						oninput={event =>
							setSelectedVoice(
								voices().find(
									voice => voice.voiceURI === event.currentTarget.value,
								),
							)
						}
						value={selectedVoice()?.voiceURI}
					>
						{voices().map(voice => {
							return <option value={voice.voiceURI}>{voice.name}</option>
						})}
					</select>
				</fieldset>
				<fieldset>
					<legend>Volume</legend>
					{/* actual values are 0-1 */}
					<Slider max={100} min={0} onInput={setVolume} step={1} value={volume()} />
				</fieldset>
				<fieldset>
					<legend>Loop</legend>
					<label for="option-loop" title="loop"></label>
					<input id="option-loop" hidden type="checkbox" />
					<span>On/Off</span>
				</fieldset>
				<fieldset>
					<legend>Language</legend>
					<label for="option-language" title="language"></label>
					<select id="option-language"></select>
				</fieldset>
				<fieldset>
					<legend>Pitch</legend>
					<Slider max={2} min={0} onInput={setPitch} step={0.1} value={pitch()} />
				</fieldset>
			</aside>
			<textarea
				class="layout-center"
				onChange={event => setText(event.currentTarget.value)}
				placeholder={CONFIG.placholder}
			>
				{text()}
			</textarea>
			<input checked hidden id="toggle-menu-help" type="checkbox" />
			<aside class="layout-right menu-help">
				<h2>Help</h2>
				<p>
					Enter text into the field on the left and hit play at the bottom to listen to
					it.
				</p>
				<h3>Can I export the audio to a file?</h3>
				<p>unavailable due to</p>
				<h3>I found a bug, what should I do?</h3>
				<p>
					Please report it <a target="_blank">here</a>!
				</p>
				<a target="_blank">View Source Code</a>
			</aside>
			<footer class="layout-bottom">
				<button disabled title="Rewind">
					⏪
				</button>
				<button
					onClick={event => {
						event.preventDefault()

						if (isPlaying()) return void synth.pause()
						/** @note resume is *very* important. Not only does it save the user's spot, but running the code below when synth is paused crashes the entire speech synthesis service so hard that not even the [MDN demo](https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/) works until the computer is restareted */
						if (synth.paused) return void synth.resume()

						const selectedVoiceRef = selectedVoice()
						if (!selectedVoiceRef) throw new Error('No Selected Voice!')

						utterance().voice = selectedVoiceRef
						utterance().text = text()

						synth.speak(utterance())
					}}
					title={isPlaying() ? 'Pause' : 'Play'}
				>
					{isPlaying() ? '⏸' : '⏵'}
				</button>
				<button disabled title="Fast Forward">
					⏩
				</button>
			</footer>
		</form>
	)
}

export default App
