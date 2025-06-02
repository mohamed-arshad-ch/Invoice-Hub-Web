export interface StoredUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  companyName: string
  isFirstLogin: boolean
}

export function setUserData(user: StoredUser): void {
  try {
    localStorage.setItem('user', JSON.stringify(user))
  } catch (error) {
    console.error('Failed to store user data:', error)
  }
}

export function getUserData(): StoredUser | null {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Failed to retrieve user data:', error)
    return null
  }
}

export function clearUserData(): void {
  try {
    localStorage.removeItem('user')
  } catch (error) {
    console.error('Failed to clear user data:', error)
  }
}

export function isUserLoggedIn(): boolean {
  return getUserData() !== null
} 