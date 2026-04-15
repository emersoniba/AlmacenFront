import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import LoginComponent from "./modules/authentication/login/login.component";
import { AdminComponent } from "./theme/layouts/admin/admin.component";
import { ProveedorComponent } from "./modules/almacen/parametrizacion/proveedor/proveedor.component";
import { AlmacenComponent } from './modules/almacen/parametrizacion/almacen/almacen.component';
import { SolicitanteComponent } from './modules/almacen/bandejas/solicitante/solicitante.component';
import { CategoriaComponent } from './modules/almacen/parametrizacion/categoria/categoria.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { ResponsableComponent } from './modules/almacen/parametrizacion/responsable/responsable.component';
import { AuthGuard } from './modules/authentication/guard/auth.guard';
import { IngresoComponent } from './modules/almacen/parametrizacion/ingreso/ingreso.component';
import { AprobadorComponent } from './modules/almacen/bandejas/aprobador/aprobador.component';
import { RecepcionadorComponent } from './modules/almacen/bandejas/recepcionador/recepcionador.component';
import { EntregaProductosComponent } from './modules/almacen/bandejas/recepcionador/entrega-productos/entrega-productos.component';
import { AtendidasComponent } from './modules/almacen/bandejas/atendidas/atendidas.component';
import { ReportesComponent } from './modules/almacen/reportes/reportes.component';
import { PersonalComponent } from './modules/almacen/personal/personal.component';

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
                path: 'usuario',
                component: PersonalComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin'] }
            },
            {
                path: 'categorias-producto',
                component: CategoriaComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                //canActivate: [AuthGuard, ],
                data: { roles: ['Almacenero'] }
            },
            {
                path: 'almacen',
                component: AlmacenComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero',] }
            },
            {
                path: 'responsable',
                component: ResponsableComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'material',
                component: MaterialComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'ingreso',
                component: IngresoComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'solicitud',
                component: SolicitanteComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Solicitante'] }
            },
            {
                path: 'aprobar',
                component: AprobadorComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Aprobador'] }
            },
            {
                path: 'recepcionar',
                component: RecepcionadorComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'entrega-productos/:id',
                component: EntregaProductosComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'atender',
                component: AtendidasComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }
            },
            {
                path: 'reporte',
                component: ReportesComponent,
                canActivate: [AuthGuard,],
                data: { roles: ['Admin', 'Almacenero'] }

            }
        ]
    },
    {
        path: 'login',
        component: LoginComponent,
        //  loadComponent: () => import('./modules/dashboard/dashboard.component'),

    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
