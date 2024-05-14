import request from '@/utils/request'

export function getMyAllCollection() {
  return request({
    url: '/collection/my',
    method: 'get'
  })
}

export function postNewCollection(data) {
  return request({
    url: '/collection/my',
    method: 'post',
    data
  })
}

export function updateCollection(data) {
  return request({
    url: '/collection/my',
    method: 'put',
    data
  })
}

export function dropCollection(collectionId) {
  return request({
    url: `/collection/my/${collectionId}`,
    method: 'delete'
  })
}
