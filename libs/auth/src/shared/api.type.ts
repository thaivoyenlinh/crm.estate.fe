export interface ErrorResponse {
  code: string
  status: number
  title: string
  type: string
  errors?: ErrorFieldResponse[]
}

export interface ErrorFieldResponse {
  field: string
  message: string
}
