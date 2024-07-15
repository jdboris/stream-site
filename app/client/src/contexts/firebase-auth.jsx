import { getIdToken } from "firebase/auth";
import { createContext, useCallback, useContext, useState } from "react";

const FirebaseAuthContext = createContext(null);

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  const shouldReauthenticate = useCallback(
    (userData) => {
      return (
        userData &&
        (user.isAdmin !== userData.isAdmin ||
          user.isModerator !== userData.isModerator ||
          user.isBanned !== userData.isBanned)
      );
    },
    [user?.isAdmin, user?.isBanned, user?.isModerator]
  );

  const login = useCallback(async (authUser) => {
    const token = await getIdToken(authUser, true);

    return await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        idToken: token,
      }),
      credentials: "include",
    });
  }, []);

  async function logout() {
    return await fetch("/api/auth/logout", {
      method: "GET",
      credentials: "include",
    });
  }

  const reauthenticate = useCallback(
    /**
     * @param {import("firebase/auth").User} newAuthUser
     * @param {object} newUser
     */
    async (newAuthUser = null) => {
      if (!newAuthUser && !authUser) {
        return null;
      }

      const response = await login(newAuthUser || authUser);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAuthUser(newAuthUser);
      setUser(data);
      return data;
    },
    [login, authUser]
  );

  const updateAuth = useCallback(
    async (newAuthUser, userData) => {
      // If there was NOT a user logged in, but there IS now,
      // OR if the change warrants reauthenticating
      if ((!authUser && newAuthUser) || shouldReauthenticate(userData)) {
        return await reauthenticate(newAuthUser, userData);
      }

      // If there was a user logged in, but not anymore
      if (authUser && !newAuthUser) {
        setAuthUser(null);
        setUser(null);
        await logout();
      }
    },
    [authUser, reauthenticate, shouldReauthenticate]
  );

  return (
    <FirebaseAuthContext.Provider
      value={{
        updateAuth,
        user,
        reauthenticate,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}
