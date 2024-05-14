import request from '@/utils/request'

export function getHighestRating(params) {
  return request({
    url: '/work/highest_rating',
    method: 'get',
    params
  })
}

export function getMostRating(params) {
  return request({
    url: '/work/most_rating',
    method: 'get',
    params
  })
}

export function getMostVisit(params) {
  return request({
    url: '/work/most_visit',
    method: 'get',
    params
  })
}

export function getMostCollect(params) {
  return request({
    url: '/work/most_collect',
    method: 'get',
    params
  })
}
