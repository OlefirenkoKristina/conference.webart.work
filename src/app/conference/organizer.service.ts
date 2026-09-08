import { Injectable, computed, inject } from '@angular/core';
import { UserService } from '@wawjs/ngx-bos';

/** Only this account gets organizer tools — everyone else is a plain attendee. */
const CEO_EMAIL = 'ceo@webart.work';

@Injectable({ providedIn: 'root' })
export class OrganizerService {
	private readonly _userService = inject(UserService);

	readonly isOrganizer = computed(
		() => (this._userService.user()?.email || '').trim().toLowerCase() === CEO_EMAIL,
	);
}
