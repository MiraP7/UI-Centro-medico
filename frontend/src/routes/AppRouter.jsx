import { ROLES } from './roles';

export const routes = [
  {
    path: '/home',
    roles: [ROLES.ADMIN, ROLES.ASSISTANT]
  },
  {
    path: '/pacientes',
    roles: [ROLES.ADMIN, ROLES.ASSISTANT]
  },
  {
    path: '/medicos',
    roles: [ROLES.ADMIN]
  },
  {
    path: '/aseguradoras', 
    roles: [ROLES.ADMIN]
  },
  {
    path: '/facturacion',
    roles: [ROLES.ADMIN, ROLES.ASSISTANT]
  },
  {
    path: '/autorizacion',
    roles: [ROLES.ADMIN, ROLES.ASSISTANT]
  }
];