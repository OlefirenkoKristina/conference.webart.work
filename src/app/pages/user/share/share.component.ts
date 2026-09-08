import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserService } from '@wawjs/ngx-bos';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { MessageService } from '@wawjs/ngx-prime/api';
import { TranslateService } from '@wawjs/ngx-translate';
import { QrCodeComponent } from '../../../shared/qr-code/qr-code.component';
import { companyProfile } from '../../../company/company.data';
import { EventService } from '../../../conference/event/event.service';
import { ConferenceService } from '../../../conference/conference.service';

export type ShareKind = 'app' | 'profile' | 'conference';

@Component({
	selector: 'app-share',
	imports: [ButtonModule, QrCodeComponent, RouterLink],
	templateUrl: './share.component.html',
	styleUrl: './share.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharePageComponent {
	private readonly _messageService = inject(MessageService);
	private readonly _activatedRoute = inject(ActivatedRoute);
	private readonly _userService = inject(UserService);
	private readonly _eventService = inject(EventService);
	private readonly _conferenceService = inject(ConferenceService);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	readonly translateService = inject(TranslateService);

	/**
	 * The events/lectures domain has no backend — every event only exists in the
	 * `localStorage` of the browser/origin that created it. Building the link from
	 * the current origin (instead of the canonical production URL) means it always
	 * points somewhere that actually has this event, whether that's a local dev
	 * server or production.
	 */
	private readonly _origin = this._isBrowser ? window.location.origin : companyProfile.siteUrl;

	readonly kind = toSignal(
		this._activatedRoute.data.pipe(map((data) => (data['shareKind'] as ShareKind) ?? 'app')),
		{
			initialValue: (this._activatedRoute.snapshot.data['shareKind'] as ShareKind) ?? 'app',
		},
	);

	/** `:conferenceId` is declared on the parent route (`/conferences/:conferenceId/share`), not this one. */
	readonly conferenceId = toSignal(
		(this._activatedRoute.parent?.paramMap ?? this._activatedRoute.paramMap).pipe(
			map((params) => params.get('conferenceId')),
		),
		{ initialValue: null },
	);

	readonly conference = computed(() => this._conferenceService.byId(this.conferenceId() ?? ''));

	/** The organizer's own event that's currently running — the one a scanned QR should drop attendees into. */
	readonly liveEvent = computed(() => {
		const ownerId = this._userService.user()?._id;
		if (!ownerId) {
			return undefined;
		}
		return this._eventService.all().find((event) => event.owner === ownerId && event.state === 'live');
	});

	readonly shareUrl = computed(() => {
		if (this.kind() === 'profile') {
			return `${this._origin}/profile`;
		}

		if (this.kind() === 'conference') {
			return `${this._origin}/conf?id=${this.conferenceId() ?? ''}`;
		}

		const liveEvent = this.liveEvent();
		if (liveEvent) {
			return `${this._origin}/event/${liveEvent.slug}`;
		}

		return `${this._origin}/sign`;
	});

	readonly title = computed(() => {
		if (this.kind() === 'profile') {
			return this.translateService.translate('Поділитися профілем')();
		}

		if (this.kind() === 'conference') {
			return this.translateService.translate('Поділитися конференцією')();
		}

		return this.translateService.translate('Поділитися Conference')();
	});

	readonly description = computed(() => {
		if (this.kind() === 'profile') {
			return this.translateService.translate(
				'Дайте людям відсканувати цей код, щоб відкрити мій профіль Conference.',
			)();
		}

		if (this.kind() === 'conference') {
			const title = this.conference()?.title;
			return title
				? this.translateService.interpolate(
						this.translateService.translate('Відскануйте код, щоб переглянути програму конференції «{{title}}».')(),
						{ title },
					)
				: this.translateService.translate('Відскануйте код, щоб переглянути програму конференції.')();
		}

		return this.liveEvent()
			? this.translateService.translate('Відскануйте код, щоб приєднатися до лекції, яка триває зараз.')()
			: this.translateService.translate('Відскануйте код, щоб приєднатися до Conference за кілька секунд.')();
	});

	copyLink(): void {
		navigator.clipboard
			?.writeText(this.shareUrl())
			.then(() => {
				this._messageService.add({
					severity: 'success',
					detail: this.translateService.translate('Посилання скопійовано')(),
				});
			})
			.catch(() => {
				this._messageService.add({
					severity: 'error',
					detail: this.translateService.translate('Не вдалося скопіювати посилання')(),
				});
			});
	}
}
