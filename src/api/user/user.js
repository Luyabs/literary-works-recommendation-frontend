import request from '@/utils/request'
import md5 from 'md5'

export function login(data) {
  data.password = md5(data.password)
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function register(data) {
  data.password = md5(data.password)
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function changeInformation(data) {
  if (data.password !== '') {
    data.password = md5(data.password)
  }
  return request({
    url: '/user/information',
    method: 'put',
    data
  })
}

export function changePrivacy(data) {
  return request({
    url: '/user/privacy',
    method: 'put',
    data
  })
}

export function reverseBannedStatus(userId) {
  return request({
    url: `/user/ban/${userId}`,
    method: 'post'
  })
}

