import {createSignal} from 'solid-js'
import './App.css'

/** @todo
 * UX
 * dark mode
 * hide settings
 * hide help
 * button to put help text into the text area & read aloud
 * save settings into local storage (with a version # for switch incremental functionality or just use Object.assign(defaultSettings, saved Settings||{}))
 * 	highlight spoken text, time taken/remaining (or that very least what sentence chunk out of what--or approximate it? test by trying to get the word count and average speaking speed--possibly with a text with an insisible muted voice at the begining to verify)
 * accessibility
 * SVG & PNG (for iOS... come on, Apple, get your _stuff_ together, it's been a thing for over [*three* years now](https://caniuse.com/link-icon-svg) logo
 * 	skip to link in the before the aside
 * Localization
 * pull all magic strings out & into a localization object
 * spanish & mandarin, see a language you want added?
 * Misc
 * 	bug fixes, error message banner at the top
 * what happens if the text changes between pausing... (need a way to clear that utterance and start anew/from a certain point)
 */

/* <button onClick={() => setCount(count => count + 1)}>count is {count()}</button> */

const CONFIG = {
	exampleText: ['It is better to fail in doing good than to succeed in doing evil.'],

	placholder: `Hi! I'm a text to speech app!
Enter text to read aloud here.`,
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

	if ('onvoiceschanged' in synth)
		synth.onvoiceschanged = () => {
			setVoices(getVoices())
			if (!selectedVoice()) setSelectedVoice(getDefaultVoice())
		}

	utterance().addEventListener('end', () => setIsPlaying(false))
	utterance().addEventListener('pause', () => setIsPlaying(false))
	utterance().addEventListener('resume', () => setIsPlaying(true))
	utterance().addEventListener('start', () => setIsPlaying(true))

	return (
		<form class="layout-grid">
			<header class="layout-top">
				<button>Settings/Logo</button>
				<h1>
					<abbr title="Text to Speech">TTS</abbr>
				</h1>
				<button>?</button>
			</header>
			<aside class="layout-left menu-settings">
				<ul>
					<li>
						<label title="speed"></label>
						<input disabled type="range" />
					</li>
					<li>
						<label title="voice"></label>
						<select
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
					</li>
					<li>
						<label title="volume"></label>
						<input disabled type="range" />
					</li>
					<li>
						<label title="loop"></label>
						<input type="checkbox" />
					</li>
					<li>
						<label title="language"></label>
						<select></select>
					</li>

					<li>
						<label title="pitch"></label>
						<input disabled type="range" />
					</li>
				</ul>
			</aside>
			<textarea
				class="layout-center"
				onChange={event => setText(event.currentTarget.value)}
				placeholder={CONFIG.placholder}
			>
				{text()}
			</textarea>
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
					Please report it <a>Here</a>!
				</p>
				<a>View Source Code</a>
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
