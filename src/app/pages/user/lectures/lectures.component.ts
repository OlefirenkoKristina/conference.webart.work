import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { CardModule } from '@wawjs/ngx-prime/card';
import { TagModule } from '@wawjs/ngx-prime/tag';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { LectureService } from '../../../conference/lecture/lecture.service';

/** `/lectures` — public listing of all conference lectures. */
@Component({
	selector: 'app-lectures',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonModule, CardModule, TagModule, TranslateDirective, RouterLink],
	templateUrl: './lectures.component.html',
	styleUrl: './lectures.component.scss',
})
export class LecturesComponent {
	private readonly _lectureService = inject(LectureService);

	readonly lectures = this._lectureService.items;
}
