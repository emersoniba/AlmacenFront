import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import LoginComponent from "./modules/authentication/login/login.component";
import { AdminComponent } from "./theme/layouts/admin/admin.component";
import { ProveedorComponent } from "./modules/almacen/parametrizacion/proveedor/proveedor.component";
import { AlmacenComponent } from './modules/almacen/parametrizacion/almacen/almacen.component';
import { SolicitanteComponent } from './modules/almacen/bandejas/solicitante/solicitante.component';
import { CatalogoComponent } from './modules/almacen/parametrizacion/catalogo/catalogo.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { ResponsableComponent } from './modules/almacen/parametrizacion/responsable/responsable.component';
import { AuthGuard } from './modules/authentication/guard/auth.guard';
import { IngresoComponent } from './modules/almacen/parametrizacion/ingreso/ingreso.component';
import { AprobadorComponent } from './modules/almacen/bandejas/aprobador/aprobador.component';
import { RecepcionadorComponent } from './modules/almacen/bandejas/recepcionador/recepcionador.component';
import { EntregaProductosComponent } from './modules/almacen/bandejas/recepcionador/entrega-productos/entrega-productos.component';
import { AtendidasComponent } from './modules/almacen/bandejas/atendidas/atendidas.component';
import { ReportesComponent } from './modules/almacen/reportes/reportes.component';


const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: '',
                redirectTo: '/dashboard/default',
                pathMatch: 'full'
            },
            {
                path: 'dashboard/default',
                loadComponent: () => import('./modules/dashboard/dashboard.component'),
                canActivate: [AuthGuard,]
            },
            {
                path: 'catalogo',
                component: CatalogoComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['administrador', 'responsable'] }
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['responsable'] }
            },
            {
                path: 'almacen',
                component: AlmacenComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['administrador',] }
            },
            {
                path: 'responsable',
                component: ResponsableComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['administrador',] }
            },
            {
                path: 'material',
                component: MaterialComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['responsable',] }
            },
            {
                path: 'ingreso',
                component: IngresoComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['responsable',] }
            },
            {
                path: 'solicitud',
                component: SolicitanteComponent
            }, {
                path: 'aprobar',
                component: AprobadorComponent
            },
            {
                path: 'recepcionar',
                component: RecepcionadorComponent
            },
            {
                path: 'entrega-productos/:id',
                component: EntregaProductosComponent
            },
            {
                path: 'atender',
                component: AtendidasComponent
            },
            {
                path:'reporte',
                component:ReportesComponent
            }
        ]
    },
    {
        path: 'login',
        component: LoginComponent,
        // loadComponent: () => import('./modules/dashboard/dashboard.component'),

    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
