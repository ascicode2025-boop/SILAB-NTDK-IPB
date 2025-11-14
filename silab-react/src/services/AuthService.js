// --- PENGELOLAAN SESI DI LOCAL STORAGE ---
// Digunakan untuk menyimpan data user dan token setelah login/register

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

// Menyimpan token dan data user
export const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Mengambil data user yang sedang login
export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Mengambil token untuk digunakan pada panggilan API terproteksi
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

// Menghapus sesi saat logout
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};