import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./lectures.component').then((m) => m.LecturesComponent),
	},
	{
		path: ':id',
		loadComponent: () =>
			import('./lecture-detail.component').then((m) => m.LectureDetailComponent),
	},
];
