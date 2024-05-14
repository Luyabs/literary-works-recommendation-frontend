import request from '@/utils/request'

export function predict(data) {
  return request({
    url: '/recommend/predict',
    method: 'post',
    data
  })
}

export function recall(data) {
  return request({
    url: '/recommend/recall',
    method: 'post',
    data
  })
}

export function getSimilarWork(data) {
  return request({
    url: '/recommend/similar',
    method: 'post',
    data
  })
}

