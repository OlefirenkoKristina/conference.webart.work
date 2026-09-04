import { StoredEntity } from '../local-store';

export type EventState = 'draft' | 'live' | 'ended';

/** The main container of the app: an owner-managed conference/talk/event. */
export interface Event extends StoredEntity {
	slug: string;
	owner: string;
	title: string;
	speaker: string;
	description: string;
	state: EventState;
	createdAt?: string;
	/** Day the lecture takes place, `YYYY-MM-DD`. */
	date?: string;
	/** Lecture start time, `HH:mm`. */
	startTime?: string;
	/** Lecture end time, `HH:mm`. */
	endTime?: string;
	/** Scheduled lecture (`Lecture._id`), if this event is built around one. */
	lectureId?: string;
}
