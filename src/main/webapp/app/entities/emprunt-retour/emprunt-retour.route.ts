import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Classification } from 'app/shared/model/classification.model';
import { ListeLocalisationService } from './liste-localisation.service';
import { EmpruntRetourComponent } from './emprunt-retour.component';
import { IClassification } from 'app/shared/model/classification.model';

@Injectable({ providedIn: 'root' })
export class ClassificationResolve implements Resolve<IClassification> {
    constructor(private service: ListeLocalisationService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Classification> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<Classification>) => response.ok),
                map((classification: HttpResponse<Classification>) => classification.body)
            );
        }
        return of(new Classification());
    }
}

export const empruntRetourRoute: Routes = [
    {
        path: 'emprunt-retour',
        component: EmpruntRetourComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'projetChimieApp.classification.home.title'
        },
        canActivate: [UserRouteAccessService]
    }
];
