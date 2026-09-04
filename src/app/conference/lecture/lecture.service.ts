import { Injectable } from '@angular/core';
import { SEED_LECTURES } from '../../../data/conference/seed';
import { LocalStoreService } from '../local-store';
import { Lecture } from './lecture.interface';

@Injectable({ providedIn: 'root' })
export class LectureService extends LocalStoreService<Lecture> {
	constructor() {
		super('conference:lectures', SEED_LECTURES);
	}
}
