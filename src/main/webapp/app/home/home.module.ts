import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetChimieSharedModule } from 'app/shared';
import { HOME_ROUTE, EMPRUNTPRODUIT, HomeComponent } from './';

@NgModule({
    imports: [ProjetChimieSharedModule, RouterModule.forChild([HOME_ROUTE, EMPRUNTPRODUIT])],
    declarations: [HomeComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjetChimieHomeModule {}
