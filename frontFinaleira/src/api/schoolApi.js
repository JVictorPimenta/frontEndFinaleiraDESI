import { get, post, put, remove } from './http'

export function getUsers() {
  return get('/users')
}

export function updateUser(id, payload) {
  return put(`/users/${id}`, payload)
}

export function deleteUser(id) {
  return remove(`/users/${id}`)
}

export function getStudents() {
  return get('/students')
}

export function createStudentProfile(payload) {
  return post('/students', payload)
}

export function updateStudentProfile(id, payload) {
  return put(`/students/${id}`, payload)
}

export function deleteStudentProfile(id) {
  return remove(`/students/${id}`)
}

export function getClasses() {
  return get('/classes')
}

export function createClassroom(payload) {
  return post('/classes', payload)
}

export function updateClassroom(id, payload) {
  return put(`/classes/${id}`, payload)
}

export function deleteClassroom(id) {
  return remove(`/classes/${id}`)
}

export function getDisciplines() {
  return get('/disciplines')
}

export function createDiscipline(payload) {
  return post('/disciplines', payload)
}

export function updateDiscipline(id, payload) {
  return put(`/disciplines/${id}`, payload)
}

export function deleteDiscipline(id) {
  return remove(`/disciplines/${id}`)
}

export function getEnrollments() {
  return get('/enrollments')
}

export function createEnrollment(payload) {
  return post('/enrollments', payload)
}

export function updateEnrollment(id, payload) {
  return put(`/enrollments/${id}`, payload)
}

export function deleteEnrollment(id) {
  return remove(`/enrollments/${id}`)
}

export function getGrades() {
  return get('/grades')
}

export function createGrade(payload) {
  return post('/grades', payload)
}

export function updateGrade(id, payload) {
  return put(`/grades/${id}`, payload)
}

export function deleteGrade(id) {
  return remove(`/grades/${id}`)
}
