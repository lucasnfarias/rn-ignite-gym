import { UserDTO } from "@/dtos/UserDTO";
import { api } from "@/services/api";
import {
  storageAuthTokenGet,
  storageAuthTokenRemove,
  storageAuthTokenSave,
} from "@/storage/storageAuthToken";
import {
  storageUserGet,
  storageUserRemove,
  storageUserSave,
} from "@/storage/storageUser";
import { createContext, ReactNode, useEffect, useState } from "react";

export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  isLoadingUserStorageData: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);

  function updateUserAndToken(data: { user: UserDTO; token: string }) {
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    setUser(data.user);
  }

  async function storageUserAndTokenSave(data: {
    user: UserDTO;
    token: string;
  }) {
    try {
      setIsLoadingUserStorageData(true);

      await storageUserSave(data.user);
      await storageAuthTokenSave(data.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post("/session", { email, password });

      if (data.user && data.token) {
        await storageUserAndTokenSave(data);
        updateUserAndToken(data);
      }
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);

      setUser({} as UserDTO);

      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser(userUpdated);
      await storageUserSave(userUpdated);

    } catch (error) {
      throw error;
    }
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if (token && userLogged.id) {
        updateUserAndToken({ user: userLogged, token });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUserStorageData,
        signIn,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
