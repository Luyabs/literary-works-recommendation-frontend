import request from '@/utils/request'

export function getUserIdByUsername(username) {
  return request({
    url: `/user/visit/get_id/${username}`,
    method: 'get'
  })
}

export function getOtherPrivacySetting(userId) {
  return request({
    url: `/user/visit/privacy/${userId}`,
    method: 'get'
  })
}

export function getOtherInfo(userId) {
  return request({
    url: `/user/visit/info/${userId}`,
    method: 'get'
  })
}

export function getOtherReview(params) {
  return request({
    url: `/review/visit/${params.userId}`,
    method: 'get',
    params
  })
}

export function getOtherCollections(userId) {
  return request({
    url: `/collection/visit/${userId}`,
    method: 'get'
  })
}

export function getOtherCollectionRecord(params) {
  return request({
    url: `/record_collection/visit/${params.collectionId}`,
    method: 'get',
    params
  })
}
