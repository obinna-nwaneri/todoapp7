import axios from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message
    return typeof message === 'string' ? message : fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
