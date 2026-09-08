import { StoredEntity } from './local-store';

/** A named conference (e.g. a yearly event) that groups a set of lectures. */
export interface Conference extends StoredEntity {
	title: string;
}
