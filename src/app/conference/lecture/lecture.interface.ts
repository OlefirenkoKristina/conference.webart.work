import { StoredEntity } from '../local-store';

/** A single conference talk that can be scheduled into an event's agenda. */
export interface Lecture extends StoredEntity {
	title: string;
	speaker: string;
	topic: string;
	time: string;
	description: string;
	content: string;
}
