import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/lectures` — public listing of all conference lectures. */
@Component({
	selector: 'app-lectures',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CardModule, TranslateDirective, RouterLink],
	templateUrl: './lectures.component.html',
	styleUrl: './lectures.component.scss',
})
export class LecturesComponent {
	private readonly _lectureService = inject(LectureService);

	readonly lectures = this._lectureService.items;
}
