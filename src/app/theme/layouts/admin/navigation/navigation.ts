export interface NavigationItem {
    id: string;
    title: string;
    type: 'item' | 'collapse' | 'group';
    translate?: string;
    icon?: string;
    hidden?: boolean;
    url?: string;
    classes?: string;
    groupClasses?: string;
    exactMatch?: boolean;
    external?: boolean;
    target?: boolean;
    breadcrumbs?: boolean;
    children?: NavigationItem[];
    link?: string;
    description?: string;
}

export const NavigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'group',
        icon: 'icon-navigation',
        children: [
            {
                id: 'default',
                title: 'Default',
                type: 'item',
                classes: 'nav-item',
                url: '/dashboard/default',
                icon: 'ti ti-dashboard',
                breadcrumbs: false
            }
        ]
    },
    {
        id: 'personal',
        title: 'Personal',
        type: 'group',
        icon: 'icon-navigation',
        children: [
            {
                id: 'usuario',
                title: 'Usuarios',
                type: 'item',
                classes: 'nav-item',
                url: '/usuario',
                icon: 'ti ti-user',
                target: false,
                breadcrumbs: true
            }
        ]
    },
    {
        id: 'parametrizacion',
        title: 'Parametrizaciones',
        type: 'group',
        icon: 'icon-navigation',
        children: [
            {
                id: 'catalogo',
                title: 'Catálogos',
                type: 'item',
                classes: 'nav-item',
                url: '/catalogo',
                icon: 'ti ti-package',
                target: false,
                breadcrumbs: true
            },
            {
                id: 'proveedor',
                title: 'Proveedores',
                type: 'item',
                classes: 'nav-item',
                url: '/proveedor',
                icon: 'ti ti-user',
                target: false,
                breadcrumbs: true
            },
            {
                id: 'almacen',
                title: 'Almacenes',
                type: 'item',
                classes: 'nav-item',
                url: '/almacen',
                icon: 'ti ti-truck',
                target: false,
                breadcrumbs: true
            },
            {
                id: 'material',
                title: 'Materiales',
                type: 'item',
                classes: 'nav-item',
                url: '/material',
                icon: 'ti ti-template',
                target: false,
                breadcrumbs: true
            },
            {
                id: 'responsable',
                title: 'Responsables',
                type: 'item',
                classes: 'nav-item',
                url: '/responsable',
                icon: 'ti ti-users',
                target: false,
                breadcrumbs: true
            },
            {
                id: 'ingreso',
                title: 'Ingresos',
                type: 'item',
                classes: 'nav-item',
                url: '/ingreso',
                icon: 'ti ti-table-import',
                target: false,
                breadcrumbs: true
            },
        ]
    },
    {
        id: 'bandeja',
        title: 'Bandeja de Solicitudes',
        type: 'group',
        icon: 'icon-navigation',
        children: [
            {
                id: 'solicitud',
                title: 'Solicitudes',
                type: 'item',
                classes: 'nav-item',
                url: '/solicitud',
                icon: 'ti ti-shopping-cart'
            },
            {
                id: 'aprobar',
                title: 'Aprobar Sol.',
                type: 'item',
                classes: 'nav-item',
                url: '/aprobar',
                icon: 'ti ti-list-check'
            },
            {
                id: 'recepcionar',
                title: 'Recepcionar Sol.',
                type: 'item',
                classes: 'nav-item',
                url: '/recepcionar',
                icon: 'ti ti-download'
            },
            {
                id: 'atender',
                title: 'Solicitudes Atendidas',
                type: 'item',
                classes: 'nav-item',
                url: '/atender',
                icon: 'ti ti-checks'
            },
            {
                id: 'reporte',
                title: 'Reportes',
                type: 'item',
                classes: 'nav-item',
                url: '/reporte',
                icon: 'ti ti-file-text'
            },
        ]
    },
];
