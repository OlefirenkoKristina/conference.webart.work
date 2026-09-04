import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./lectures-manage.component').then((m) => m.LecturesManageComponent),
	},
];
