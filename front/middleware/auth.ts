// middleware/auth.ts

import { Context } from '@nuxt/types';

export default async function authMiddleware({ route, redirect }: Context) {
  // Aquí puedes verificar si el usuario está autenticado usando tu tienda de Pinia o cualquier otra lógica de autenticación
  const userLoggedIn = true; // Aquí deberías implementar la lógica real de autenticación

  // Si el usuario no está autenticado y no está en la página de inicio de sesión, redirigirlo a la página de inicio de sesión
  if (!userLoggedIn && route.path !== '/') {
    return redirect('/');
  }
}
