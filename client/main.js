document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('status-message');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

   
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }


   
    const SPECIAL_USERNAME = "admin";
    const SPECIAL_PASSWORD = "admin123";

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

       
        statusMessage.className = "status-message hidden";

        if (usernameInput === SPECIAL_USERNAME && passwordInput === SPECIAL_PASSWORD) {
           
            const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({user: usernameInput, exp: Date.now() + 3600000}))}.signature_hash`;
            
      
            console.log("🔑 [System Auth] Token Generated successfully:");
            console.log(mockToken);
       statusMessage.textContent = "AccessGranted";
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('success');
            
           
            loginForm.reset();
        } else {
           
            statusMessage.textContent = "Invalid username or password.";
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('error');
        }
    });
});