import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth.service';

export const ROLES = {
  ADMIN: 1,
  EMPLEADO: 2,
  VETERINARIO: 3,
  CLIENTE: 4
};

export const ROLE_NAMES = {
  1: 'Administrador',
  2: 'Empleado',
  3: 'Veterinario',
  4: 'Cliente'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar estado desde localStorage al montar la app
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sigepor_token');
      const storedUser = localStorage.getItem('usuario_sigepor');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error restaurando sesión:', e);
      localStorage.removeItem('sigepor_token');
      localStorage.removeItem('usuario_sigepor');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (identificador, contraseña) => {
    const response = await authService.login(identificador, contraseña);
    
    // Extracción flexible y robusta del token JWT sin importar la estructura de envoltura
    const jwtToken = 
      response?.token || 
      response?.data?.token || 
      response?.user?.token || 
      (typeof response === 'string' ? response : null);

    if (!jwtToken) {
      throw new Error('La respuesta del servidor no incluyó un token válido');
    }

    // Extracción del usuario
    const userData = 
      response?.usuario || 
      response?.user || 
      response?.data || 
      response;

    const roleId = Number(userData.idRol || userData.rol || 2);

    const normalizedUser = {
      id: userData.id,
      nombre: userData.nombre || identificador,
      email: userData.email || userData.correo,
      idRol: roleId,
      rolNombre: ROLE_NAMES[roleId] || userData.rolNombre || 'Empleado'
    };

    // Guardado estricto en localStorage usando la clave estándar del proyecto
    localStorage.setItem('sigepor_token', jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('usuario_sigepor', JSON.stringify(normalizedUser));
    localStorage.setItem('usuarioSesion', JSON.stringify(normalizedUser));

    setToken(jwtToken);
    setUser(normalizedUser);

    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem('sigepor_token');
    localStorage.removeItem('usuario_sigepor');
    setToken(null);
    setUser(null);
  };

  /**
   * Comprueba si el usuario actual posee alguno de los roles solicitados
   * @param {Array<number|string>} allowedRoles Lista de IDs o nombres de roles permitidos
   */
  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    return allowedRoles.some((role) => {
      if (typeof role === 'number') {
        return Number(user.idRol) === role;
      }
      if (typeof role === 'string') {
        return (
          user.rolNombre?.toLowerCase() === role.toLowerCase() ||
          ROLE_NAMES[user.idRol]?.toLowerCase() === role.toLowerCase()
        );
      }
      return false;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
    ROLES,
    ROLE_NAMES
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
