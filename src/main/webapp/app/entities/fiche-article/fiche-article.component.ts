import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { IFicheArticle } from 'app/shared/model/fiche-article.model';
import { AccountService, User } from 'app/core';
import { FicheArticleService } from './fiche-article.service';
import { SelectItem } from 'primeng/api';
import { ClassificationService } from 'app/entities/classification';
import { IClassification } from 'app/shared/model/classification.model';

@Component({
    selector: 'jhi-fiche-article',
    templateUrl: './fiche-article.component.html'
})
export class FicheArticleComponent implements OnInit, OnDestroy {
    users: User[];
    cols: any[];
    ficheArticles: IFicheArticle[];
    currentAccount: any;
    eventSubscriber: Subscription;
    classifi: IClassification[];

    refArticleO: SelectItem[] = [];
    casO: SelectItem[] = [];
    acronymeO: SelectItem[] = [];
    quantiteO: SelectItem[] = [];
    disponibliteArticleO: SelectItem[] = [];
    nomO: SelectItem[] = [];
    classificationO: SelectItem[] = [];
    classification: any;
    disponibliteArticle: any;
    nom: any;
    acronyme: any;
    cas: any;
    refArticle: any;
    private attente: IFicheArticle[];
    private ficheArticlesCopy: IFicheArticle[];

    constructor(
        protected classificationService: ClassificationService,
        protected ficheArticleService: FicheArticleService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {
        this.ficheArticles[0].typeDeStockage.localisation.adresse;
    }

    loadAll() {
        this.ficheArticleService.query().subscribe(
            (res: HttpResponse<IFicheArticle[]>) => {
                this.ficheArticlesCopy = res.body;
                for (let value of res.body) {
                    if (value !== undefined) {
                        if (
                            value.refArticle !== undefined &&
                            this.refArticleO.indexOf({
                                label: value.refArticle,
                                value: value.refArticle
                            }) === -1
                        ) {
                            this.refArticleO.push({ label: value.refArticle, value: value.refArticle });
                        }

                        if (
                            value.ficheProduitChimiques[0].cas !== undefined &&
                            this.casO.indexOf({
                                label: value.ficheProduitChimiques[0].cas,
                                value: value.ficheProduitChimiques[0].cas
                            }) === -1
                        ) {
                            this.casO.push({ label: value.ficheProduitChimiques[0].cas, value: value.ficheProduitChimiques[0].cas });
                        }
                        if (
                            value.ficheProduitChimiques[0].acronyme !== undefined &&
                            !this.acronymeO.includes({
                                label: value.ficheProduitChimiques[0].acronyme,
                                value: value.ficheProduitChimiques[0].acronyme
                            })
                        ) {
                            this.acronymeO.push({
                                label: value.ficheProduitChimiques[0].acronyme,
                                value: value.ficheProduitChimiques[0].acronyme
                            });
                        }
                        if (
                            value.quantite !== undefined &&
                            this.quantiteO.indexOf({
                                label: value.quantite.toString(),
                                value: value.quantite
                            }) === -1
                        ) {
                            this.quantiteO.push({ label: value.quantite.toString(), value: value.quantite });
                        }
                        if (
                            value.disponibliteArticle !== undefined &&
                            this.disponibliteArticleO.indexOf({
                                label: value.disponibliteArticle,
                                value: value.disponibliteArticle
                            }) === -1
                        ) {
                            this.disponibliteArticleO.push({ label: value.disponibliteArticle, value: value.disponibliteArticle });
                        }
                        if (
                            value.ficheProduitChimiques[0].nom !== undefined &&
                            this.nomO.indexOf({
                                label: value.ficheProduitChimiques[0].nom,
                                value: value.ficheProduitChimiques[0].nom
                            }) === -1
                        ) {
                            this.nomO.push({ label: value.ficheProduitChimiques[0].nom, value: value.ficheProduitChimiques[0].nom });
                        }
                    }
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    loadAllClassi() {
        this.classificationService.query().subscribe(
            (res: HttpResponse<IClassification[]>) => {
                for (let value of res.body) {
                    this.classificationO.push({ label: value.nomClassification, value: value.nomClassification });
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInFicheArticles();
        this.cols = [
            { field: 'refArticle', header: 'Référence' },
            { field: 'cas', header: 'CAS' },
            { field: 'nom', header: 'Nom' },
            { field: 'acronyme', header: 'Acronyme' },
            { field: 'quantite', header: 'Quantite' },
            { field: 'classification', header: 'Classification' },
            { field: 'disponibliteArticle', header: 'DisponibliteArticle' },
            { field: 'adresse', header: 'adresse' }
        ];

        this.disponibliteArticleO = [
            { label: 'DISPONIBLE', value: 'DISPONIBLE' },
            { label: 'INDISPONIBLE', value: 'INDISPONIBLE' },
            { label: 'FINDESTOCK', value: 'FINDESTOCK' },
            { label: 'ENCOMMANDE', value: 'ENCOMMANDE' }
        ];
        this.loadAllClassi();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInFicheArticles() {
        this.eventSubscriber = this.eventManager.subscribe('ficheArticleListModification', response => this.loadAll());
    }

    onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    filtre(value, field, test) {
        this.attente = [];
        for (let value of this.ficheArticlesCopy) {
            let classificationBoolean = false;
            let disponibliteArticleBoolean = false;
            let nomBoolean = false;
            let acronymeBoolean = false;
            let casBoolean = false;
            let refArticleBoolean = false;
            if (this.classification.length === 0) {
                classificationBoolean = true;
            }
            for (let classi of value.classifications) {
                if (this.classification.includes(classi)) {
                    classificationBoolean = true;
                }
            }

            if (this.nom.includes(value.ficheProduitChimiques[0].nom) || this.nom.length === 0) {
                nomBoolean = true;
            }

            if (this.acronyme.includes(value.ficheProduitChimiques[0].acronyme) || this.acronyme.length === 0) {
                acronymeBoolean = true;
            }

            if (this.cas.includes(value.ficheProduitChimiques[0].cas) || this.cas.length === 0) {
                casBoolean = true;
            }

            if (this.disponibliteArticle.includes(value.disponibliteArticle) || this.disponibliteArticle.length === 0) {
                refArticleBoolean = true;
            }

            if (this.refArticle.includes(value.refArticle) || this.refArticle.length === 0) {
                disponibliteArticleBoolean = true;
            }

            if (
                casBoolean &&
                nomBoolean &&
                acronymeBoolean &&
                disponibliteArticleBoolean &&
                refArticleBoolean /*&& classificationBoolean*/
            ) {
                this.attente.push(value);
            }
        }
        if (
            this.cas.length === 0 &&
            this.acronyme.length === 0 &&
            this.nom.length === 0 &&
            this.disponibliteArticle.length === 0 &&
            this.refArticle.length === 0 &&
            this.classification.length === 0
        ) {
            this.ficheArticles = this.ficheArticlesCopy;
        } else {
            this.ficheArticles = this.attente;
        }
    }
}
