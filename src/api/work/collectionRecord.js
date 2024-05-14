import request from '@/utils/request'

export function getPageCollectionRecord(params) {
  return request({
    url: `/record_collection/${params.collectionId}`,
    method: 'get',
    params
  })
}

export function getMyAllCollectionWithCheckingWork(workId) {
  return request({
    url: `/record_collection/with_work/${workId}`,
    method: 'get'
  })
}

export function postNewRecord(collectionId, workId) {
  return request({
    url: `/record_collection/${collectionId}/${workId}`,
    method: 'post'
  })
}

export function postNewRecordIntoDefault(workId) {
  return request({
    url: `/record_collection/default/${workId}`,
    method: 'post'
  })
}

export function dropRecord(collectionId, workId) {
  return request({
    url: `/record_collection/${collectionId}/${workId}`,
    method: 'delete'
  })
}
