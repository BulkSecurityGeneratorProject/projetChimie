import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DisponibliteArticle, FicheArticle, IFicheArticle } from 'app/shared/model/fiche-article.model';
import { FicheArticleService } from '../fiche-article';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { Observable, Subscription } from 'rxjs';
import { FicheEmpruntProduitService } from '../fiche-emprunt-produit';
import { FicheEmpruntProduit, IFicheEmpruntProduit } from 'app/shared/model/fiche-emprunt-produit.model';
import { FicheRetourProduit, IFicheRetourProduit } from 'app/shared/model/fiche-retour-produit.model';
import { FicheRetourProduitService } from '../fiche-retour-produit';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountService, IUser, User } from 'app/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'jhi-emprunt-retour',
    templateUrl: './emprunt-retour.component.html',
    styles: [],
    providers: [MessageService]
})
export class EmpruntRetourComponent implements OnInit {
    @ViewChild('menuItems') menu: MenuItem[];
    activeItem: any;
    currentAccount: any;
    eventSubscriber: Subscription;
    ficheArticles: IFicheArticle[];
    account: any;
    ficheArticle: IFicheArticle = new FicheArticle();
    ficheEmpruntProduit: IFicheEmpruntProduit = new FicheEmpruntProduit();
    empruntRetour: MenuItem[];
    choix = false;
    user: IUser = new User();
    ficheRetourProduit: IFicheRetourProduit = new FicheRetourProduit();
    articleOption: SelectItem[] = [];
    unite: String = 'Article non choisi';
    dispo: boolean = true;
    commande: boolean = false;
    labelString: string;
    quantite: number;
    numberUser: any;

    constructor(
        protected ficheArticleService: FicheArticleService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService,
        protected ficheEmpruntProduitService: FicheEmpruntProduitService,
        protected ficheRetourProduitService: FicheRetourProduitService,
        private messageService: MessageService,
        protected activatedRoute: ActivatedRoute
    ) {}

    loadAll() {
        this.ficheArticleService.query().subscribe(
            (res: HttpResponse<IFicheArticle[]>) => {
                this.ficheArticles = res.body;
                for (let value of this.ficheArticles) {
                    this.labelString = '';
                    if (value !== undefined && value.ficheProduitChimiques !== undefined) {
                        if (value.codeBarre !== undefined) {
                            this.labelString = this.labelString + value.codeBarre;
                        }
                        this.articleOption.push({
                            label: this.labelString,
                            value: value
                        });
                    }
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.accountService.identity().then(account => {
            this.account = account;
        });
        this.loadAll();
        this.empruntRetour = [
            {
                label: 'Emprunt',
                icon: 'fa fa-fw fa-bar-chart',
                command: event => {
                    event.choix = false;
                    this.choix = false;
                }
            },
            {
                label: 'Retour',
                icon: 'fa fa-fw fa-calendar',
                command: event => {
                    event.choix = true;
                    this.choix = true;
                }
            }
        ];
        this.activeItem = this.empruntRetour[0];
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInFicheArticles();
        this.activatedRoute.data.subscribe(({ ficheArticle }) => {
            this.ficheArticle = ficheArticle;
        });
    }

    registerChangeInFicheArticles() {
        this.eventSubscriber = this.eventManager.subscribe('ficheArticleListModification', response => this.loadAll());
    }

    onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    save() {
        this.account = null;

        if (this.account === undefined) {
            this.ficheArticleService.findUser(this.numberUser).subscribe(
                (res: HttpResponse<IUser>) => {
                    this.account = res.body;
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
        }
        this.show();
        if (this.ficheArticle.refArticle !== undefined) {
            if (!this.choix) {
                this.ficheEmpruntProduit.ficheArticle = this.ficheArticle;
                this.user = this.currentAccount;
                this.ficheEmpruntProduit.user = this.user;
                this.ficheEmpruntProduit.dateEmprunt = moment(new Date(Date.now()));
                this.ficheEmpruntProduit.quantite = this.quantite;
                this.ficheArticle.disponibliteArticle = DisponibliteArticle.INDISPONIBLE;
                this.ficheEmpruntProduitService.create(this.ficheEmpruntProduit).subscribe(result => {
                    this.subscribeToSaveResponseArticle(this.ficheArticleService.update(this.ficheArticle));
                });
            } else {
                this.ficheRetourProduit.ficheArticle = this.ficheArticle;
                this.user = this.currentAccount;
                this.ficheRetourProduit.user = this.user;
                this.ficheRetourProduit.dateRetour = moment(new Date(Date.now()));
                this.ficheRetourProduit.quantite = this.quantite;
                this.ficheArticle.disponibliteArticle = DisponibliteArticle.DISPONIBLE;
                this.ficheRetourProduitService.create(this.ficheRetourProduit).subscribe(result => {
                    this.subscribeToSaveResponseArticle(this.ficheArticleService.update(this.ficheArticle));
                });
            }
        }
    }

    protected subscribeToSaveResponseArticle(result: Observable<HttpResponse<IFicheArticle>>) {
        result.subscribe((res: HttpResponse<IFicheArticle>) => console.log(this.ficheArticle));
    }

    actuUnite() {
        if (this.ficheArticle.unites.length !== 0) {
            this.unite = this.ficheArticle.unites[0].libelleUnite;
        }
    }

    show() {
        if (this.ficheArticle.refArticle !== undefined) {
            this.messageService.add({
                severity: 'success',
                summary: "L'article est emprunté",
                detail: 'Order submitted'
            });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur' });
        }
    }

    actuDispon() {
        this.dispo = true;
        this.commande = false;
        if (this.ficheArticle.disponibliteArticle === DisponibliteArticle.INDISPONIBLE.toString()) {
            if (!this.choix) {
                this.dispo = false;
                this.messageService.add({
                    severity: 'error',
                    summary: "L'article n'est pas disponible",
                    detail: 'erreur'
                });
            } else {
                this.dispo = true;
            }
        }
        if (this.ficheArticle.disponibliteArticle === DisponibliteArticle.ENCOMMANDE.toString()) {
            this.dispo = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Commande article en cours de traitement',
                detail: 'erreur'
            });
        }
        if (this.ficheArticle.disponibliteArticle === DisponibliteArticle.FINDESTOCK.toString()) {
            this.dispo = false;
            this.commande = true;
            this.messageService.add({
                severity: 'error',
                summary: 'Article en fin de stock veuillez lancer la commande',
                detail: 'erreur'
            });
        }
        if (this.ficheArticle.quantite === 0) {
            this.dispo = false;
            this.commande = true;
            this.messageService.add({
                severity: 'error',
                summary: 'Article en fin de stock veuillez lancer la commande',
                detail: 'erreur'
            });
        }
    }
}
