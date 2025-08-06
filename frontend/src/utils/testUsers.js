// src/utils/testUsers.js
// Este archivo es solo para propósitos de testing
// En producción, los roles vendrían del backend

export const testUsers = {
  admin: {
    usuario: 'admin',
    clave: 'admin123',
    userData: {
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@healthstate.com',
      rol: 'admin'
    }
  },
  operador: {
    usuario: 'operador',
    clave: 'operador123',
    userData: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'operador@healthstate.com',
      rol: 'operador'
    }
  }
};

// Función para simular login para testing
export const simulateLogin = (username, password) => {
  const users = Object.values(testUsers);
  const user = users.find(u => u.usuario === username && u.clave === password);
  
  if (user) {
    return {
      isSuccess: true,
      token: 'fake-jwt-token-' + Date.now(),
      userName: user.userData.nombre,
      lastName: user.userData.apellido,
      email: user.userData.email,
      role: user.userData.rol
    };
  }
  
  return {
    isSuccess: false,
    message: 'Credenciales incorrectas'
  };
};
