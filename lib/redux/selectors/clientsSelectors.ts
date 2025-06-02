// This is a placeholder for actual client selectors.
// In a real app, you might use reselect for memoized selectors.
import type { RootState } from "../store"

export const clientsSelector = (state: RootState) => state.clients.clients
export const selectClientById = (clientId: string) => (state: RootState) =>
  state.clients.clients.find((client) => client.id === clientId)
