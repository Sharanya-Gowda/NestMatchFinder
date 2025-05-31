// Simple auth hook for now
export function useAuth() {
  return {
    user: null as any,
    login: async (data?: any) => {},
    signup: async (data?: any) => {},
    logout: () => {},
    loading: false,
  };
}

export function AuthProvider({ children }: { children: any }) {
  return children;
}