import { Route } from '@angular/router';

import { HomeComponent } from './';
import { EmpruntRetourComponent } from '../emprunt-retour/emprunt-retour.component';

export const HOME_ROUTE: Route = {
    path: '',
    component: HomeComponent,
    data: {
        authorities: [],
        pageTitle: 'home.title'
    }
};

export const EMPRUNTPRODUIT: Route = {
    path: 'emprunt-produit',
    component: EmpruntRetourComponent,
    data: {
        authorities: [],
        pageTitle: 'home.title'
    }
};
