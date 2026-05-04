import { post } from './http'

export function loginRequest(payload) {
  return post('/auth/login', payload)
}

export function registerStudentUser(payload) {
  return post('/auth/register', payload)
}

export function registerProfessorUser(payload) {
  return post('/auth/register-professor', payload)
}
