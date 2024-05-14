import request from '@/utils/request'

export function getHistory(params) {
  return request({
    url: '/history/page',
    method: 'get',
    params
  })
}

export function addHistory(workId) {
  return request({
    url: `/history/${workId}`,
    method: 'post'
  })
}
