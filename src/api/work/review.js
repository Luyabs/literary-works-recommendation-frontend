import request from '@/utils/request'

export function getReviewPage(params) {
  return request({
    url: `/review/${params.workId}`,
    method: 'get',
    params
  })
}

export function getMyPageAllReview(params) {
  return request({
    url: '/review/my',
    method: 'get',
    params
  })
}

export function getMyReview(workId) {
  return request({
    url: `/review/my/${workId}`,
    method: 'get'
  })
}

export function updateMyReview(data) {
  return request({
    url: '/review',
    method: 'post',
    data
  })
}
