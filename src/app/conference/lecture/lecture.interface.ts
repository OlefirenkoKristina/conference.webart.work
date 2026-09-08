import { StoredEntity } from '../local-store';

/** A single conference talk that can be scheduled into an event's agenda. */
export interface Lecture extends StoredEntity {
	title: string;
	speaker: string;
	topic: string;
	time: string;
	description: string;
	content: string;
	/** Original name of the attached material (slides, PDF, etc.), if any. */
	fileName?: string;
	/** The attached file, inlined as a data URL (no backend to upload to). */
	fileDataUrl?: string;
	/** External link to the lecture itself (stream, meeting room, recording, etc.). */
	link?: string;
	/** The conference (e.g. `КПНУ 2026-2027`) this lecture is scheduled under. */
	conferenceId?: string;
}
