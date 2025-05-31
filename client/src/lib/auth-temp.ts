// Temporary simple auth to get app running
export function useAuth() {
  return {
    user: null,
    login: async () => {},
    signup: async () => {},
    logout: () => {},
    loading: false,
  };
}

export function AuthProvider({ children }: { children: any }) {
  return children;
}