import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ToastrModule } from "ngx-toastr";
import { AppMaterialModule } from './app.material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './theme/shared/shared.module';

import { NgIf } from '@angular/common';
import { AppThemeConfig } from './app.theme';
import { AppAlmacenConfig } from './app.almacen';

import { AgGridAngular } from "ag-grid-angular";
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AuthInterceptor } from './modules/authentication/interceptor/auth.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
    declarations: [
        AppComponent,
        ...AppThemeConfig,
        ...AppAlmacenConfig,
    ],
    imports: [
        //NgModule,
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        NgbModule,
        ToastrModule.forRoot({
            timeOut: 5000,
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            progressBar: true
        }),
        ...AppMaterialModule,
        AgGridAngular,
        SharedModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SweetAlert2Module,
        NgIf,
    ],
    bootstrap: [AppComponent],
    providers: [
        provideAnimationsAsync(),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ]
})
export class AppModule { }
