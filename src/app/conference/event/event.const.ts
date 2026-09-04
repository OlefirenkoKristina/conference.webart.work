import { Event } from './event.interface';

export const NEW_EVENT: Event = {
	_id: '',
	slug: '',
	owner: '',
	title: '',
	speaker: '',
	description: '',
	state: 'draft',
	date: '',
	startTime: '',
	endTime: '',
	lectureId: '',
};

/** Generates a public slug in the `1234-5678` format. */
export function generateEventSlug(): string {
	const group = () => Math.floor(1000 + Math.random() * 9000);
	return `${group()}-${group()}`;
}
