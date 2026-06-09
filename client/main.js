const BASE_API = "http://localhost:5000";
const LOGIN = "/api/auth/login";

document.addEventListener('DOMContentLoaded', () => {
    const elForm = document.querySelector(".js-form");
    const elLogin = document.querySelector(".js-login");
    const elPassword = document.querySelector(".js-password");
    const elLogOut = document.querySelector(".js-logout");
    const statusMessage = document.getElementById('status-message');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const isLoginPage = window.location.pathname.includes('login.html');
    const token = localStorage.getItem('token');

    if (!isLoginPage && !token) {
        window.location.href = "http://127.0.0.1:5500/client/login.html";
        return;
    }

    if (isLoginPage && token) {
        window.location.href = "http://127.0.0.1:5500/client/index.html";
        return;
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    async function fetchLogin(username, password) {
        try {
            const res = await fetch(`${BASE_API}${LOGIN}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Invalid username or password.");
            }

            const data = await res.json();
            
            console.log("🔑 [Backend Auth Success] Token received:");
            console.log(data.token);

            localStorage.setItem('token', data.token);

            if (statusMessage) {
                statusMessage.textContent = "AccessGranted";
                statusMessage.className = "status-message success";
            }

            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5500/client/index.html";
            }, 1000);

        } catch (err) {
            console.error("❌ Login Error:", err);
            if (statusMessage) {
                statusMessage.textContent = err.message || "Error connecting to backend.";
                statusMessage.className = "status-message error";
            }
        }
    }

    if (elForm) {
        elForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetchLogin(elLogin.value.trim(), elPassword.value);
        });
    }

    if (elLogOut) {
        elLogOut.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = "http://127.0.0.1:5500/client/login.html";
        });
    }
});