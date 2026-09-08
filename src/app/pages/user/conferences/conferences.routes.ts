import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./conferences.component').then((m) => m.ConferencesComponent),
	},
	{
		path: ':conferenceId/share',
		data: {
			shareKind: 'conference',
		},
		loadChildren: () =>
			import('../share/share.routes').then((m) => m.routes),
	},
	{
		path: ':conferenceId',
		loadChildren: () =>
			import('../lectures/lectures.routes').then((m) => m.routes),
	},
];
