import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Usuario, Persona, RolInfo } from 'src/app/models/usuario.models';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HandleErrorMessage } from 'src/app/utils/handle.errors';
import { SwalAlertService } from 'src/app/utils/util.swal';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-personal-form',
    templateUrl: './personal-form.component.html',
    styleUrl: './personal-form.component.scss'
})
export class PersonalFormComponent implements OnInit, OnDestroy {
    public labelForm: string = 'Registrar';
    public formRegistro: FormGroup;
    public modoEdicion: boolean = false;
    public cargando: boolean = false;
    public listaRoles: RolInfo[] = [];
    public rolesActuales: RolInfo[] = [];

    private formSubscription: Subscription | undefined;
    private rolesSubscription: Subscription | undefined;
    private personaEncontrada: Persona | null = null;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private usuariosService: UsuariosService,
        private alertService: SwalAlertService,
        @Inject(MAT_DIALOG_DATA) public data: Usuario,
        public dialogRef: MatDialogRef<PersonalFormComponent>
    ) {
        this.modoEdicion = !!data?.id;
        this.labelForm = this.modoEdicion ? 'Actualizar' : 'Registrar';
        
        this.formRegistro = this.fb.group({
            // Datos de Persona
            ci: ['', [Validators.required, Validators.minLength(5)]],
            nombres: ['', Validators.required],
            apellido_paterno: [''],
            apellido_materno: [''],
            cargo: ['', Validators.required],
            telefono: [''],
            correo: ['', [Validators.email]],
            unidad: [''],
            direccion: [''],

            // Datos de Usuario
            username: ['', [Validators.required, Validators.minLength(5)]],
            password: ['', this.modoEdicion ? [] : [Validators.required, Validators.minLength(6)]],
            password2: [''],
            email: [{ value: '', disabled: true }],

            // Roles
            rolesSeleccionados: [[]]
        }, { validator: this.checkPasswords });
    }

    ngOnInit(): void {
        this.cargarRoles();

        if (this.modoEdicion && this.data) {
            this.cargarDatosUsuario(this.data);
        }
    }

    // Validador de contraseñas
    checkPasswords(group: FormGroup) {
        const password = group.get('password')?.value;
        const password2 = group.get('password2')?.value;

        if (password || password2) {
            return password === password2 ? null : { notSame: true };
        }
        return null;
    }

    // Cargar lista de roles
    cargarRoles() {
        this.rolesSubscription = this.usuariosService.getRoles().subscribe({
            next: (roles) => {
                this.listaRoles = roles;
            },
            error: (err) => {
                this.toastr.error('Error al cargar roles', 'Error');
            }
        });
    }

    // Cargar datos del usuario en modo edición
    cargarDatosUsuario(usuario: Usuario) {
        this.formRegistro.patchValue({
            ci: usuario.persona?.ci || '',
            nombres: usuario.persona?.nombres || '',
            apellido_paterno: usuario.persona?.apellido_paterno || '',
            apellido_materno: usuario.persona?.apellido_materno || '',
            cargo: usuario.persona?.cargo || '',
            telefono: usuario.persona?.telefono || '',
            correo: usuario.persona?.correo || '',
            unidad: usuario.persona?.unidad || '',
            direccion: usuario.persona?.direccion || '',
            username: usuario.username,
            email: usuario.email,
            rolesSeleccionados: usuario.roles?.map(r => r.id) || []
        });

        this.rolesActuales = usuario.roles || [];
        this.personaEncontrada = usuario.persona;
    }

    // Buscar persona por CI
    buscarPersonaPorCI() {
        const ci = this.formRegistro.get('ci')?.value;
        if (!ci) {
            this.toastr.warning('Ingrese un CI para buscar', 'Validación');
            return;
        }

        this.cargando = true;
        this.usuariosService.getPersonaByCi(ci).subscribe({
            next: (persona) => {
                this.cargando = false;
                this.personaEncontrada = persona;

                this.formRegistro.patchValue({
                    nombres: persona.nombres || '',
                    apellido_paterno: persona.apellido_paterno || '',
                    apellido_materno: persona.apellido_materno || '',
                    cargo: persona.cargo || '',
                    telefono: persona.telefono || '',
                    correo: persona.correo || '',
                    unidad: persona.unidad || '',
                    direccion: persona.direccion || '',
                    email: persona.correo || '' // El email del usuario será el de la persona
                });

                this.toastr.success('Persona encontrada', 'Éxito');
            },
            error: (err) => {
                this.cargando = false;
                if (err.status === 404) {
                    this.toastr.info('Persona no encontrada. Complete los datos para crearla.', 'Información');
                } else {
                    this.toastr.error(HandleErrorMessage(err), 'Error');
                }
            }
        });
    }

    // Registrar o actualizar
    accionRegistrar() {
        if (this.formRegistro.invalid) {
            this.toastr.warning('Verificar los campos del formulario', this.labelForm);
            return;
        }

        this.alertService.showConfirmationDialog(this.labelForm, '¿Está seguro de realizar esta acción?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Espere un momento . . .',
                        didOpen: () => Swal.showLoading()
                    });
                    this.cargando = true;

                    if (this.modoEdicion) {
                        this.actualizarUsuario();
                    } else {
                        this.crearUsuario();
                    }
                }
            });
    }

    // Crear nuevo usuario y persona
    crearUsuario() {
        // Primero crear o actualizar persona
        const datosPersona = {
            ci: this.formRegistro.get('ci')?.value,
            nombres: this.formRegistro.get('nombres')?.value,
            apellido_paterno: this.formRegistro.get('apellido_paterno')?.value,
            apellido_materno: this.formRegistro.get('apellido_materno')?.value,
            cargo: this.formRegistro.get('cargo')?.value,
            telefono: this.formRegistro.get('telefono')?.value,
            correo: this.formRegistro.get('correo')?.value,
            unidad: this.formRegistro.get('unidad')?.value,
            direccion: this.formRegistro.get('direccion')?.value
        };

        const observablePersona = this.personaEncontrada
            ? this.usuariosService.putPersona(datosPersona, datosPersona.ci)
            : this.usuariosService.postPersona(datosPersona);

        observablePersona.subscribe({
            next: (persona) => {
                // Crear usuario
                const datosUsuario = {
                    username: this.formRegistro.get('username')?.value,
                    password: this.formRegistro.get('password')?.value,
                    persona_ci: persona.ci
                };

                this.formSubscription = this.usuariosService.postUsuario(datosUsuario).subscribe({
                    next: (usuario) => {
                        // Asignar roles seleccionados
                        const rolesSeleccionados = this.formRegistro.get('rolesSeleccionados')?.value || [];
                        this.asignarRolesSecuencialmente(usuario.id, rolesSeleccionados, 0, usuario);
                    },
                    error: (err) => this.manejarError(err)
                });
            },
            error: (err) => this.manejarError(err)
        });
    }

    // Actualizar usuario existente
    actualizarUsuario() {
        // Actualizar persona
        const datosPersona = {
            nombres: this.formRegistro.get('nombres')?.value,
            apellido_paterno: this.formRegistro.get('apellido_paterno')?.value,
            apellido_materno: this.formRegistro.get('apellido_materno')?.value,
            cargo: this.formRegistro.get('cargo')?.value,
            telefono: this.formRegistro.get('telefono')?.value,
            correo: this.formRegistro.get('correo')?.value,
            unidad: this.formRegistro.get('unidad')?.value,
            direccion: this.formRegistro.get('direccion')?.value
        };

        this.usuariosService.putPersona(datosPersona, this.data.persona!.ci).subscribe({
            next: () => {
                // Actualizar usuario si hay cambios
                const datosUsuario: any = {};
                if (this.formRegistro.get('password')?.value) {
                    datosUsuario.password = this.formRegistro.get('password')?.value;
                }

                if (Object.keys(datosUsuario).length > 0) {
                    this.usuariosService.putUsuario(datosUsuario, this.data.id).subscribe({
                        next: () => {
                            this.actualizarRoles();
                        },
                        error: (err) => this.manejarError(err)
                    });
                } else {
                    this.actualizarRoles();
                }
            },
            error: (err) => this.manejarError(err)
        });
    }

    // Actualizar roles
    actualizarRoles() {
        const rolesSeleccionados = this.formRegistro.get('rolesSeleccionados')?.value || [];
        const rolesActualesIds = this.rolesActuales.map(r => r.id);
        const rolesAEliminar = rolesActualesIds.filter(id => !rolesSeleccionados.includes(id));
        const rolesAAgregar = rolesSeleccionados.filter((id: number) => !rolesActualesIds.includes(id));

        let operaciones = 0;
        const totalOperaciones = rolesAEliminar.length + rolesAAgregar.length;

        if (totalOperaciones === 0) {
            this.finalizarActualizacion(this.data);
            return;
        }

        // Eliminar roles
        rolesAEliminar.forEach((rolId: number) => {
            this.usuariosService.quitarRol(this.data.id, rolId).subscribe({
                next: () => {
                    operaciones++;
                    if (operaciones === totalOperaciones) {
                        this.finalizarActualizacion(this.data);
                    }
                },
                error: (err) => console.error('Error al quitar rol:', err)
            });
        });

        // Agregar nuevos roles
        rolesAAgregar.forEach((rolId: number) => {
            this.usuariosService.asignarRol(this.data.id, rolId).subscribe({
                next: () => {
                    operaciones++;
                    if (operaciones === totalOperaciones) {
                        this.finalizarActualizacion(this.data);
                    }
                },
                error: (err) => console.error('Error al asignar rol:', err)
            });
        });
    }

    // Asignar roles secuencialmente (para creación)
    asignarRolesSecuencialmente(usuarioId: number, roles: number[], index: number, usuario: Usuario) {
        if (index >= roles.length) {
            Swal.close();
            this.cargando = false;
            this.toastr.success('Usuario creado correctamente', 'Éxito');
            this.dialogRef.close(usuario);
            return;
        }

        this.usuariosService.asignarRol(usuarioId, roles[index]).subscribe({
            next: () => {
                this.asignarRolesSecuencialmente(usuarioId, roles, index + 1, usuario);
            },
            error: (err) => {
                console.error('Error al asignar rol:', err);
                this.asignarRolesSecuencialmente(usuarioId, roles, index + 1, usuario);
            }
        });
    }

    // Finalizar actualización
    finalizarActualizacion(usuario: Usuario) {
        this.usuariosService.getUsuarioById(usuario.id).subscribe({
            next: (usuarioActualizado) => {
                Swal.close();
                this.cargando = false;
                this.toastr.success('Usuario actualizado correctamente', 'Éxito');
                this.dialogRef.close(usuarioActualizado);
            },
            error: (err) => this.manejarError(err)
        });
    }

    // Manejar errores
    manejarError(err: any) {
        Swal.close();
        this.cargando = false;
        console.error('Error:', err);
        this.toastr.error(HandleErrorMessage(err), 'Error');
    }

    // Quitar rol (desde el badge)
    quitarRol(rolId: number) {
        this.alertService.showConfirmationDialog('Quitar Rol', '¿Está seguro de quitar este rol?')
            .then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });

                    this.usuariosService.quitarRol(this.data.id, rolId).subscribe({
                        next: () => {
                            this.rolesActuales = this.rolesActuales.filter(r => r.id !== rolId);
                            const rolesIds = this.rolesActuales.map(r => r.id);
                            this.formRegistro.get('rolesSeleccionados')?.setValue(rolesIds);
                            Swal.close();
                            this.toastr.success('Rol quitado correctamente', 'Éxito');
                        },
                        error: (err) => this.manejarError(err)
                    });
                }
            });
    }

    // Cancelar
    accionCancel() {
        this.dialogRef.close(null);
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
        this.rolesSubscription?.unsubscribe();
    }
}