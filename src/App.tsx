import {createSignal} from 'solid-js'
import './styles/'
import {Dropdown, Slider} from './components'

/** @todo
 * 1px gap between header & footer elements (give the middle one a stretch prop) & make the edge elements have the same width as height
 * Remove display non-properties from toggleable sidebars. The help menu is still displayed after being hidden because of the padding. Said border box sizing to whatever check index CSS for the default they use. Probably apply it to everything.
 * icons
 * * use an equilateral SVG triangle for dropdowns (rounded corners)
 * * play, pause, FF, Rewind, logo
 * SVG & PNG (for iOS... come on, Apple, get your _stuff_ together, it's been a thing for over [*three* years now](https://caniuse.com/link-icon-svg) logo
 * make settings work once the audio has been paused
 * dark mode
 * holding the button down should continue to increment the value until the user lifts it up (or hits the limit)
 * button to put help text into the text area & read aloud
 * save options into local storage (with a version # for switch incremental functionality or just use Object.assign(defaultoptions, saved options||{}))
 * 	highlight spoken text, time taken/remaining (or that very least what sentence chunk out of what--or approximate it? test by trying to get the word count and average speaking speed--possibly with a text with an insisible muted voice at the begining to verify)
 * accessibility
 * alphabetize options menu
 * Localization
 * pull all magic strings out & into a localization object
 * spanish & mandarin, see a language you want added?
 * Misc
 * firefox, android, & iPhone styling
 * 	bug fixes, error message banner at the top
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

	const [pitch, setPitch] = createSignal(100)
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

	return (
		<>
			<a class="skip-to-link" href="#text-to-read-aloud">
				Skip to content
			</a>
			<input checked hidden id="toggle-menu-options" type="checkbox" />
			<input checked hidden id="toggle-menu-help" type="checkbox" />
			<form class="layout-grid" onSubmit={event => event.preventDefault()}>
				<header class="layout-top">
					<button class="toggle-menu" title="Toggle Options Menu">
						<label for="toggle-menu-options"></label>
					</button>
					<label class="stretch" for="text-to-read-aloud">
						<h1>Text to Speech</h1>
					</label>
					<button class="toggle-menu" title="Toggle Help Menu">
						<label for="toggle-menu-help">?</label>
					</button>
				</header>
				<aside class="layout-left menu-options">
					<fieldset>
						<legend>Language</legend>
						<Dropdown
							disabled
							onInput={() => void 0}
							options={{English: 'English'}}
							name="language"
							value="English"
						/>
					</fieldset>
					<fieldset>
						<legend hidden>Pitch</legend>
						{/* note the actual values are 0-2 */}
						<Slider
							max={200}
							min={0}
							name="Pitch"
							onInput={setPitch}
							step={1}
							unit="%"
							value={pitch()}
						/>
					</fieldset>
					<fieldset>
						<legend hidden>Speed</legend>
						{/* @note actual values are 10-0.1 */}
						<Slider
							max={10}
							min={0.1}
							name="Speed"
							onInput={setSpeed}
							step={0.1}
							unit="x"
							value={speed()}
						/>
					</fieldset>
					<fieldset>
						<legend>Voice</legend>
						<Dropdown
							name="option-voice"
							onInput={value =>
								setSelectedVoice(voices().find(voice => voice.voiceURI === value))
							}
							options={Object.assign(
								{},
								...voices().map(voice => ({[voice.voiceURI]: voice})),
							)}
							value={selectedVoice()}
						/>
					</fieldset>
					<fieldset>
						<legend hidden>Volume</legend>
						{/* actual values are 0-1 */}
						<Slider
							max={100}
							min={0}
							name="Volume"
							onInput={setVolume}
							step={1}
							unit="%"
							value={volume()}
						/>
					</fieldset>
				</aside>
				<textarea
					class="layout-center"
					id="text-to-read-aloud"
					name="text-to-read-aloud"
					onChange={event => setText(event.currentTarget.value)}
					placeholder={CONFIG.placholder}
				>
					{text()}
				</textarea>
				<aside class="layout-right menu-help">
					<h2>Help</h2>
					<p>
						Enter text into the field on the left and hit play at the bottom to listen
						to it.
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
					<button disabled title="Rewind"></button>
					<div class="stretch">
						<button
							onClick={event => {
								event.preventDefault()

								if (isPlaying()) return void synth.pause()
								/** @note resume is *very* important. Not only does it save the user's spot, but running the code below when synth is paused crashes the entire speech synthesis service so hard that not even the [MDN demo](https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/) works until the computer is restareted */
								if (synth.paused) return void synth.resume()

								const selectedVoiceRef = selectedVoice()
								if (!selectedVoiceRef) throw new Error('No Selected Voice!')

								utterance().pitch = pitch() / 100
								utterance().rate = speed()
								utterance().text = text()
								utterance().voice = selectedVoiceRef
								utterance().volume = volume() / 100

								synth.speak(utterance())
							}}
							title={isPlaying() ? 'Pause' : 'Play'}
						>
							{isPlaying() ? '⏸' : '⏵'}
						</button>
					</div>
					<button disabled title="Fast Forward"></button>
				</footer>
			</form>
		</>
	)
}

export default App
