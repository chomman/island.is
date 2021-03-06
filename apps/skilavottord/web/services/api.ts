import { AUTH_URL } from '../auth/utils'

export const logout = () =>
  fetch(`${AUTH_URL['citizen']}/logout`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
