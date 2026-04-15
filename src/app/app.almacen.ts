import LoginComponent from './modules/authentication/login/login.component';

import { ProveedorComponent } from './modules/almacen/parametrizacion/proveedor/proveedor.component';
import { ProveedorFormComponent } from './modules/almacen/parametrizacion/proveedor/proveedor-form/proveedor-form.component';
import { AlmacenComponent } from './modules/almacen/parametrizacion/almacen/almacen.component';
import { AlmacenFormComponent } from './modules/almacen/parametrizacion/almacen/almacen-form/almacen-form.component';
import { SubAlmacenFormComponent } from './modules/almacen/parametrizacion/almacen/subalmacen-form/subalmacen-form.component';
import { SolicitanteComponent } from './modules/almacen/bandejas/solicitante/solicitante.component';
import { SolicitanteFormComponent } from './modules/almacen/bandejas/solicitante/solicitante-form/solicitante-form.component';
import { DetalleSolicitudModalComponent } from './modules/almacen/bandejas/solicitante/detalle-solicitud-modal/detalle-solicitud-modal.component';
import { AprobadorComponent } from './modules/almacen/bandejas/aprobador/aprobador.component';
import { RecepcionadorComponent } from './modules/almacen/bandejas/recepcionador/recepcionador.component';
import { RendererComponent } from './modules/almacen/bandejas/abrenderer/renderer.component';
import { CategoriaComponent } from './modules/almacen/parametrizacion/categoria/categoria.component';
import { CategoriaFormComponent } from './modules/almacen/parametrizacion/categoria/categoria-form/categoria-form.component';
import { MaterialComponent } from './modules/almacen/parametrizacion/material/material.component';
import { MaterialFormComponent } from './modules/almacen/parametrizacion/material/material-form/material-form.component';
import { ResponsableComponent } from './modules/almacen/parametrizacion/responsable/responsable.component';
import { ResponsableFormComponent } from './modules/almacen/parametrizacion/responsable/responsable-form/responsable-form.component';
import { IngresoComponent } from './modules/almacen/parametrizacion/ingreso/ingreso.component';
import { IngresoFormComponent } from './modules/almacen/parametrizacion/ingreso/ingreso-form/ingreso-form.component';
import { ReportesComponent } from './modules/almacen/reportes/reportes.component';
import { PerfilModalComponent } from './modules/perfil-modal/perfil-modal.component';
import { PersonalComponent } from './modules/almacen/personal/personal.component';
import { PersonalFormComponent } from './modules/almacen/personal/personal-form/personal-form.component';
import { CompletarIngresoModalComponent } from './modules/almacen/parametrizacion/ingreso/completar-ingreso-modal/completar-ingreso-modal.component';
import { RendererComponent2 } from './modules/almacen/bandejas/solicitante/abrenderer2/renderer2.component';

export const AppAlmacenConfig = [
    LoginComponent,
    ProveedorComponent,
    ProveedorFormComponent,
    CategoriaComponent,
    CategoriaFormComponent,
    AlmacenComponent,
    AlmacenFormComponent,
    SubAlmacenFormComponent,
    MaterialComponent,
    MaterialFormComponent,
    ResponsableComponent,
    ResponsableFormComponent,
    IngresoComponent,
    IngresoFormComponent,
    SolicitanteComponent,
    SolicitanteFormComponent,
    DetalleSolicitudModalComponent,
    AprobadorComponent,
    RecepcionadorComponent,
    RendererComponent,
    RendererComponent2,
    ReportesComponent,
    PerfilModalComponent,
    //nuevos components
    PersonalComponent,
    PersonalFormComponent,
    CompletarIngresoModalComponent
]
