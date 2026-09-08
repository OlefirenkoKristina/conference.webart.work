import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/conferences/:conferenceId` — listing of lectures scheduled under one conference. */
@Component({
	selector: 'app-lectures',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, TranslateDirective, RouterLink],
	templateUrl: './lectures.component.html',
	styleUrl: './lectures.component.scss',
})
export class LecturesComponent {
	private readonly _lectureService = inject(LectureService);
	private readonly _route = inject(ActivatedRoute);

	/** `:conferenceId` is declared on the parent route (`/conferences/:conferenceId`), not this one. */
	private readonly _conferenceId = toSignal(
		(this._route.parent?.paramMap ?? this._route.paramMap).pipe(map((params) => params.get('conferenceId'))),
		{ initialValue: null },
	);

	readonly lectures = computed(() =>
		this._lectureService.all().filter((lecture) => lecture.conferenceId === this._conferenceId()),
	);
}
