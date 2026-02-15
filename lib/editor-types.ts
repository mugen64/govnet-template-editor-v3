export type EditorType = 'notification' | 'pdf'
export type SyncMode = 'local' | 'online'
export type CredentialLocation = 'header' | 'query'

export interface Credential {
  key: string
  value: string
}

export interface EditorConfig {
  id: string
  name: string
  type: EditorType
  syncMode: SyncMode
  apiUrl: string
  credentialLocation: CredentialLocation
  credentials: Credential[]
  createdAt: string
  updatedAt: string
}

export interface Editor {
  id: string
  name: string
  type: EditorType
}
