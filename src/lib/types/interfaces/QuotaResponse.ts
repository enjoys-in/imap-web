export interface QuotaResponse {
    path: string
    quotaRoot: string
    storage: Storage
  }
  
  export interface Storage {
    usage: number
    limit: number
    status: string
  }

  