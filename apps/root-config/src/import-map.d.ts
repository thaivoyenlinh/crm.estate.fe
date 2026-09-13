declare module "@recrm/shell-host" {
  export function bootstrap(props: Record<string, unknown>): Promise<void>
  export function mount(props: Record<string, unknown>): Promise<void>
  export function unmount(props: Record<string, unknown>): Promise<void>
}
declare module "@recrm/leads" {
  export function bootstrap(props: Record<string, unknown>): Promise<void>
  export function mount(props: Record<string, unknown>): Promise<void>
  export function unmount(props: Record<string, unknown>): Promise<void>
}
