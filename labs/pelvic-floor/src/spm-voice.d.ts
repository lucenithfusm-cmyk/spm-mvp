type SPMVoiceState = {state: string; message: string; index: number; total: number};
interface SPMVoiceClient {
 supported: boolean; state: string; speaking: boolean; paused: boolean;
 listen(text: string, options?: {owner?: object; lang?: string; rate?: number; onstate?: (event: SPMVoiceState) => void; onend?: () => void; onerror?: () => void; oncancel?: () => void}): boolean;
 speak(utterance: SpeechSynthesisUtterance, options?: {owner?: object}): boolean;
 cancel(): void; pause(): void; resume(): void;
}
interface Window { SPM_VOICE?: SPMVoiceClient }
