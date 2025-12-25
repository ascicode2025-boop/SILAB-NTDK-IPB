const TOKEN_KEY = 'token'; 
const USER_KEY = 'user';
const USER_NAME_KEY = 'user_name';

export const setSession = (token, user) => {
    if (!token) {
        console.error("AuthService Error: Mencoba menyimpan token kosong");
        return;
    }

    
    token = token.replace(/"/g, "");

    // Simpan token & user
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (user && user.name) {
        localStorage.setItem(USER_NAME_KEY, user.name);
    }
    
    if (user && user.role) {
        localStorage.setItem("role", user.role);
    }
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Gagal parsing data user:", e);
            return null;
        }
    }
    return null;
};

export const getUserRole = () => {
    const user = getUser();
    return user ? user.role : null;
};

export const isLoggedIn = () => {
    return !!getToken();
};

export const getAuthHeader = () => {
    const token = getToken();
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem("role");
};
