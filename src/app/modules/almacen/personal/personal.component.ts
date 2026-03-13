import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, GridApi, GridOptions, GridReadyEvent, PaginationNumberFormatterParams } from "ag-grid-community";
import { localeEs } from "src/app/app.locale.es.grid";
import { RendererComponent } from '../bandejas/abrenderer/renderer.component';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from 'src/app/utils/util.swal';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Usuario } from 'src/app/models/usuario.models';
import Swal from 'sweetalert2';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { PersonalFormComponent } from './personal-form/personal-form.component';


@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.scss'
})
export class PersonalComponent {
  public dataUsuario: Usuario[] = [] as Usuario[];
  private gridApi!: GridApi<Usuario>;
  private gridColumnApi: any;
  public gridOptions: GridOptions = <GridOptions>{
    reactiveCustomComponents: true,
    components: {
      actionCellRenderer: RendererComponent
    },
    context: { componentParent: this },
    //opcional al agrid
    suppressScrollOnNewData: true,
    alwaysShowHorizontalScroll: true, // Siempre mostrar scroll horizontal
    alwaysShowVerticalScroll: true,    // Siempre mostrar scroll vertical
    enableCellTextSelection: true,
    ensureDomOrder: true
    //
  };
  private formSubscription: Subscription | undefined;
  public rowSelection: 'single' = 'single';
  public localEs = localeEs;
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  public paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string = (params: PaginationNumberFormatterParams) => {
    return params.value.toLocaleString();
  };

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'Opciones', filter: false, minWidth: 115, maxWidth: 115, cellRenderer: RendererComponent, pinned: true },
    { field: 'username', headerName: 'Usuario', filter: true, minWidth: 150, floatingFilter: true }, // Ajustado
    { field: 'email', headerName: 'Correo', filter: true, minWidth: 200, floatingFilter: true }, // Ajustado
    { field: 'persona.ci', headerName: 'CI', filter: true, minWidth: 120, floatingFilter: true, valueGetter: (params) => params.data?.persona?.ci || 'N/A' },
    {
      headerName: 'Nombre Completo',
      minWidth: 250,
      floatingFilter: true,
      valueGetter: (params) => params.data?.persona?.nombre_completo ||
        `${params.data?.persona?.nombres || ''} ${params.data?.persona?.apellido_paterno || ''} ${params.data?.persona?.apellido_materno || ''}`.trim() ||
        params.data?.username || 'Sin nombre'
    },
    { field: 'persona.cargo', headerName: 'Cargo', filter: true, minWidth: 180, floatingFilter: true, valueGetter: (params) => params.data?.persona?.cargo || 'Sin cargo' },
    { field: 'persona.telefono', headerName: 'Teléfono', filter: true, minWidth: 130, floatingFilter: true, valueGetter: (params) => params.data?.persona?.telefono || 'N/A' },
    { field: 'persona.unidad', headerName: 'Unidad', filter: true, minWidth: 180, floatingFilter: true, valueGetter: (params) => params.data?.persona?.unidad || 'N/A' },
    { field: 'persona.direccion', headerName: 'Dirección', filter: true, minWidth: 250, floatingFilter: true, valueGetter: (params) => params.data?.persona?.direccion || 'N/A' },
    { field: 'username', headerName: 'Username', filter: true, minWidth: 130, floatingFilter: true },
    {
      headerName: 'Roles',
      filter: true,
      minWidth: 200,
      floatingFilter: true,
      valueGetter: (params) => params.data?.roles?.map(r => r.nombre).join(', ') || 'Sin roles',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const roles = params.value.split(', ');
        return roles.map((rol: string) =>
          `<span class="badge bg-light-primary text-primary me-1">${rol}</span>`
        ).join('');
      }
    },
    {
      headerName: 'Estado',
      field: 'is_active',
      filter: true,
      minWidth: 100,
      floatingFilter: true,
      valueGetter: (params) => params.data?.is_active ? 'Activo' : 'Inactivo',
      cellRenderer: (params: any) => {
        const isActive = params.data?.is_active;
        return isActive
          ? '<span class="badge bg-success">Activo</span>'
          : '<span class="badge bg-danger">Inactivo</span>';
      }
    },

  ];

  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog,
    private alertService: SwalAlertService,
    private usuariosService: UsuariosService
  ) {
  }

  ngOnInit(): void {
    this.getAllUsuarios();
  }

  public getAllUsuarios() {
    this.formSubscription = this.usuariosService.getUsuarios().subscribe({
      next: (response) => {
        this.dataUsuario = response;
        console.log(this.dataUsuario);
        //console.log('aaaaaaa'+response);
      }, error: (err) => {
        this.dataUsuario = [] as Usuario[];
        this.toastr.error(HandleErrorMessage(err), 'Error');
      },
    });
  }

  public accionNuevo() {
    const dialogRef = this.dialog.open(PersonalFormComponent, {
      width: '770px',
      height: '430px',
      minWidth: '770wv',
      minHeight: '450hv',
      disableClose: true,
      hasBackdrop: false,
      data: {}
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.getAllUsuarios();
        }
      }
    );
  }

  public OnActionClick(event: any) {
    const { action, rowId, data } = event;
    if (action.toLowerCase() === 'edit') {
      this.onActionEditar(rowId, data);
    }
    if (action.toLowerCase() === 'delete') {
      this.onActionEliminar(rowId, data);
    }
  }

  public onActionEditar(pk: string, data: Usuario) {
    const dialogRef = this.dialog.open(PersonalFormComponent, {
      width: '770px',
      height: '430px',
      minWidth: '770wv',
      minHeight: '450hv',
      disableClose: true,
      hasBackdrop: false,
      data: data
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result !== null) {
          this.getAllUsuarios();
        }
      }
    );
  }

  /* public onActionEliminar(pk: string, data: Usuario) {
     this.alertService.showConfirmationDialog('Eliminar registro', 'Esta usted seguro de realizar esta acción?')
       .then((result) => {
         if (result.isConfirmed) {
           Swal.fire({
             title: 'Espere un momento . .  .',
             didOpen: () => {
               Swal.showLoading()
             }
           });
           this.usuariosService.deleteUsuario(pk).subscribe({
             next: (response) => {
               this.toastr.success('Acción realizada de manera correcta', 'Registro eliminado');
               this.getAllUsuarios();
               Swal.close();
             }, error: (err) => {
               this.toastr.error(HandleErrorMessage(err), 'Error');
               Swal.close();
             }
           });
         }
       });
   }
 
 */
  public onActionEliminar(pk: string, data: Usuario) {
    // Primero verificamos si el usuario tiene roles asignados
    const tieneRoles = data.roles && data.roles.length > 0;
    let mensajeAdvertencia = '¿Está seguro de eliminar este usuario?';

    if (tieneRoles) {
      mensajeAdvertencia = 'Este usuario tiene roles asignados. Al eliminarlo, también se eliminarán sus asignaciones de roles. ¿Desea continuar?';
    }

    this.alertService.showConfirmationDialog('Eliminar Usuario', mensajeAdvertencia)
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Eliminando usuario...',
            html: 'Por favor espere',
            didOpen: () => {
              Swal.showLoading();
            },
            allowOutsideClick: false,
            allowEscapeKey: false
          });

          // Convertir pk a número (ya que tu servicio espera number)
          const usuarioId = parseInt(pk, 10);

          if (isNaN(usuarioId)) {
            Swal.close();
            this.toastr.error('ID de usuario inválido', 'Error');
            return;
          }

          this.usuariosService.deleteUsuario(usuarioId).subscribe({
            next: (response) => {
              Swal.close();
              this.toastr.success('Usuario eliminado correctamente', 'Éxito');
              this.getAllUsuarios(); // Recargar la lista
            },
            error: (err) => {
              Swal.close();
              console.error('Error al eliminar:', err);

              // Mensaje de error más específico
              let errorMsg = HandleErrorMessage(err);
              if (err.status === 404) {
                errorMsg = 'El usuario no existe o ya fue eliminado';
              } else if (err.status === 403) {
                errorMsg = 'No tiene permisos para eliminar este usuario';
              } else if (err.status === 400) {
                errorMsg = err.error?.message || 'No se puede eliminar el usuario';
              }

              this.toastr.error(errorMsg, 'Error al eliminar');
            }
          });
        }
      });
  }
  onGridReady(params: GridReadyEvent<Usuario>) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    //this.gridApi.sizeColumnsToFit();

  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
    this.dialog.closeAll();

  }
}
