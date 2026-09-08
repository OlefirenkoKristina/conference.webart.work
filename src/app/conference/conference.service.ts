import { Injectable } from '@angular/core';
import { SEED_CONFERENCES } from '../../data/conference/seed';
import { LocalStoreService } from './local-store';
import { Conference } from './conference.interface';

@Injectable({ providedIn: 'root' })
export class ConferenceService extends LocalStoreService<Conference> {
	constructor() {
		super('conference:conferences', SEED_CONFERENCES);
	}
}
