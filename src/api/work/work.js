import request from '@/utils/request'

export function getPage(params) {
  return request({
    url: '/work/page',
    method: 'get',
    params
  })
}

export function getById(id) {
  return request({
    url: `/work/${id}`,
    method: 'get'
  })
}

export function existWork(id) {
  return request({
    url: `/work/exist/${id}`,
    method: 'get'
  })
}

export function addWork(data) {
  return request({
    url: '/work',
    method: 'post',
    data
  })
}

export function editWork(data) {
  return request({
    url: '/work',
    method: 'put',
    data
  })
}

export function deleteWork(id) {
  return request({
    url: `/work/${id}`,
    method: 'delete'
  })
}
