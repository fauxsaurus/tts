import {createSignal} from 'solid-js'
import './App.css'

/** @todo
 * UI
 * 	functionality: play/pause toggle, fastforward, rewind, highlight spoken text, get all voices, show all voices, select default voice
 * features
 * UX
 * save settings into local storage (with a version # for switch incremental functionality or just use Object.assign(defaultSettings, saved Settings||{}))
 * 	highlight spoken text, time taken/remaining (or that very least what sentence chunk out of what--or approximate it? test by trying to get the word count and average speaking speed--possibly with a text with an insisible muted voice at the begining to verify)
 * accessibility
 * SVG & PNG (for iOS... come on, Apple, get your _stuff_ together, it's been a thing for over [*three* years now](https://caniuse.com/link-icon-svg) logo
 * 	skip to link in the before the aside
 */

/* <button onClick={() => setCount(count => count + 1)}>count is {count()}</button> */

const CONFIG = {
	exampleText: ['It is better to fail in doing good than to succeed in doing evil.'],

	placholder: `Hi! I'm a text to speech app!
Enter text to read aloud here.`,
}

/** @note Plasma */
/** @note Special thanks to: https://stackoverflow.com/a/52005323 */
const getVoices = () =>
	new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
		const synth = globalThis.speechSynthesis
		let id = 0

		id = setInterval(() => {
			if (!synth.getVoices().length) return

			resolve(synth.getVoices())
			clearInterval(id)
		}, 100)
	})

const NON_JSON_CONFIG = {
	voices: globalThis.speechSynthesis.getVoices(),
}

const App = () => {
	const [text, setText] = createSignal(CONFIG.exampleText[0])
	const [voices, setVoices] = createSignal<SpeechSynthesisVoice[]>([])

	getVoices().then(setVoices)

	const [selectedVoice, setSelectedVoice] = createSignal(
		NON_JSON_CONFIG.voices.find(voice => voice.default)?.voiceURI ?? '',
	)

	return (
		<form>
			<header>
				<button>Settings/Logo</button>
				<h1>
					<abbr title="Text to Speech">TTS</abbr>
				</h1>
			</header>
			<aside>
				<ul>
					<li>
						<label>Speed</label>
						<select></select>
					</li>
					<li>
						<label>Voice</label>
						<select
							oninput={event => setSelectedVoice(event.currentTarget.value)}
							value={selectedVoice()}
						>
							{voices().map(voice => {
								return <option value={voice.voiceURI}>{voice.name}</option>
							})}
						</select>
					</li>
					<li>
						<label>Volume</label>
						<select></select>
					</li>
					<li>
						<label>Language</label>
						<select></select>
					</li>

					<li>
						<label>Pitch</label>
						<select></select>
					</li>
					<li>
						<a>Record & Export (unavailable due to)</a>
					</li>
					<li>
						<a>View Source Code</a>
					</li>
				</ul>
			</aside>
			<textarea
				onChange={event => setText(event.currentTarget.value)}
				placeholder={CONFIG.placholder}
			>
				{text()}
			</textarea>
			<footer>
				<button>Prev⏪</button>
				<button>Play/Pause ⏯</button>
				<button>Next ⏩</button>
			</footer>
		</form>
	)
}

export default App
