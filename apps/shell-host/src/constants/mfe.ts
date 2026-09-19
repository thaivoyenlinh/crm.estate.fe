export const MFE_APPS = {
  LEADS: {
    path: "leads", // Dùng để cấu hình cho Vue Router URL
    module: "@recrm/leads", // Dùng cho Single-spa và import() động
  },
} as const
