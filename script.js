// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
    APP_NAME: 'UbuShop',
    STAR_EMOJI: '⭐',
    MIN_PASSWORD_LENGTH: 6,
    DEFAULT_STARS: 1000,
    DEFAULT_ENERGY: 10,
    DEFAULT_LEVEL: 1,
    DEFAULT_RATING: 5.0
};

// ========== БАЗА ДАННЫХ ==========
class Database {
    constructor() {
        this.initDatabase();
        this.createSampleData();
    }

    initDatabase() {
        const defaultData = {
            users: [],
            listings: [],
            auctions: [],
            transactions: [],
            notifications: []
        };

        Object.keys(defaultData).forEach(key => {
            if (!localStorage.getItem(`ubushop_${key}`)) {
                localStorage.setItem(`ubushop_${key}`, JSON.stringify(defaultData[key]));
            }
        });

        // Инициализируем текущего пользователя
        if (!localStorage.getItem('ubushop_current_user')) {
            localStorage.setItem('ubushop_current_user', 'null');
        }
    }

    createSampleData() {
        const listings = this.getListings();
        if (listings.length > 0) return;

        const sampleListings = [
            {
                id: 'listing_1',
                title: 'NFT Cosmic Warrior',
                description: 'Уникальный NFT космического воина с анимацией и звуками',
                category: 'NFT',
                stars: 500,
                views: 128,
                interest: 24,
                sellerId: 'demo_seller_1',
                sellerName: 'CosmicTrader',
                createdAt: '2024-01-15T10:30:00Z',
                isActive: true,
                isSold: false
            },
            {
                id: 'listing_2',
                title: 'Premium Telegram Account',
                description: 'Аккаунт с премиум статусом, уникальным ID и историей',
                category: 'Аккаунт',
                stars: 350,
                views: 89,
                interest: 15,
                sellerId: 'demo_seller_2',
                sellerName: 'AccountMaster',
                createdAt: '2024-01-16T14:20:00Z',
                isActive: true,
                isSold: false
            },
            {
                id: 'listing_3',
                title: 'Private Crypto Chat',
                description: 'Закрытый чат для обсуждения криптовалют и инвестиций',
                category: 'Чат',
                stars: 200,
                views: 156,
                interest: 32,
                sellerId: 'demo_seller_3',
                sellerName: 'CryptoExpert',
                createdAt: '2024-01-17T09:15:00Z',
                isActive: true,
                isSold: false
            },
            {
                id: 'listing_4',
                title: 'Crypto News Channel',
                description: 'Канал с эксклюзивными новостями о криптовалютах',
                category: 'Канал',
                stars: 450,
                views: 210,
                interest: 42,
                sellerId: 'demo_seller_4',
                sellerName: 'NewsHunter',
                createdAt: '2024-01-18T11:45:00Z',
                isActive: true,
                isSold: false
            },
            {
                id: 'listing_5',
                title: 'Golden Phone Number',
                description: 'Красивый номер телефона с уникальной комбинацией',
                category: 'Номер',
                stars: 150,
                views: 67,
                interest: 18,
                sellerId: 'demo_seller_5',
                sellerName: 'NumberDealer',
                createdAt: '2024-01-19T16:30:00Z',
                isActive: true,
                isSold: false
            },
            {
                id: 'listing_6',
                title: 'Digital Space Art',
                description: 'Коллекционный цифровой арт в космическом стиле',
                category: 'Другое',
                stars: 100,
                views: 93,
                interest: 21,
                sellerId: 'demo_seller_6',
                sellerName: 'SpaceArtist',
                createdAt: '2024-01-20T13:10:00Z',
                isActive: true,
                isSold: false
            }
        ];

        localStorage.setItem('ubushop_listings', JSON.stringify(sampleListings));
    }

    // ========== ПОЛЬЗОВАТЕЛИ ==========
    createUser(userData) {
        const users = this.getUsers();
        
        // Проверка уникальности
        if (users.some(u => u.nickname === userData.nickname)) {
            throw new Error('Никнейм уже занят');
        }
        if (users.some(u => u.email === userData.email)) {
            throw new Error('Email уже используется');
        }
        
        const user = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...userData,
            stars: CONFIG.DEFAULT_STARS,
            energy: CONFIG.DEFAULT_ENERGY,
            level: CONFIG.DEFAULT_LEVEL,
            rating: CONFIG.DEFAULT_RATING,
            avatar: null,
            telegramId: null,
            telegramUsername: null,
            isTelegramUser: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastBonus: null,
            achievements: [],
            listings: [],
            purchases: [],
            isActive: true
        };
        
        users.push(user);
        localStorage.setItem('ubushop_users', JSON.stringify(users));
        
        this.setCurrentUser(user);
        return user;
    }

    authenticateUser(identifier, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            (u.email === identifier || u.nickname === identifier) && 
            u.password === password &&
            u.isActive === true
        );
        
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);
            this.setCurrentUser(user);
            return user;
        }
        
        return null;
    }

    getUser(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id) || null;
    }

    getUserByTelegramId(telegramId) {
        const users = this.getUsers();
        return users.find(u => u.telegramId === telegramId) || null;
    }

    updateUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('ubushop_users', JSON.stringify(users));
            
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === user.id) {
                this.setCurrentUser(user);
            }
            
            return true;
        }
        
        return false;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('ubushop_users')) || [];
    }

    setCurrentUser(user) {
        localStorage.setItem('ubushop_current_user', JSON.stringify(user));
    }

    getCurrentUser() {
        const user = localStorage.getItem('ubushop_current_user');
        return user && user !== 'null' ? JSON.parse(user) : null;
    }

    clearCurrentUser() {
        localStorage.setItem('ubushop_current_user', 'null');
    }

    // ========== ОБЪЯВЛЕНИЯ ==========
    createListing(listingData) {
        const listings = this.getListings();
        
        const listing = {
            id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...listingData,
            views: 0,
            interest: 0,
            isActive: true,
            isSold: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        listings.push(listing);
        localStorage.setItem('ubushop_listings', JSON.stringify(listings));
        
        return listing;
    }

    getListings(filters = {}) {
        let listings = JSON.parse(localStorage.getItem('ubushop_listings')) || [];
        
        // Фильтрация
        if (filters.category) {
            listings = listings.filter(l => l.category === filters.category);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            listings = listings.filter(l => 
                l.title.toLowerCase().includes(search) || 
                l.description.toLowerCase().includes(search)
            );
        }
        
        if (filters.sellerId) {
            listings = listings.filter(l => l.sellerId === filters.sellerId);
        }
        
        if (filters.minStars) {
            listings = listings.filter(l => l.stars >= filters.minStars);
        }
        
        if (filters.maxStars) {
            listings = listings.filter(l => l.stars <= filters.maxStars);
        }
        
        // Только активные
        listings = listings.filter(l => l.isActive && !l.isSold);
        
        // Сортировка
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'newest':
                    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'cheap':
                    listings.sort((a, b) => a.stars - b.stars);
                    break;
                case 'expensive':
                    listings.sort((a, b) => b.stars - a.stars);
                    break;
                case 'popular':
                    listings.sort((a, b) => b.views - a.views);
                    break;
            }
        }
        
        return listings;
    }

    incrementViews(listingId) {
        const listings = this.getListings();
        const listing = listings.find(l => l.id === listingId);
        
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            localStorage.setItem('ubushop_listings', JSON.stringify(listings));
            return listing.views;
        }
        
        return 0;
    }

    addInterest(listingId) {
        const listings = this.getListings();
        const listing = listings.find(l => l.id === listingId);
        
        if (listing) {
            listing.interest = (listing.interest || 0) + 1;
            localStorage.setItem('ubushop_listings', JSON.stringify(listings));
            return listing.interest;
        }
        
        return 0;
    }

    // ========== УВЕДОМЛЕНИЯ ==========
    createNotification(notificationData) {
        const notifications = JSON.parse(localStorage.getItem('ubushop_notifications')) || [];
        
        const notification = {
            id: `notif_${Date.now()}`,
            ...notificationData,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        notifications.push(notification);
        localStorage.setItem('ubushop_notifications', JSON.stringify(notifications));
        
        return notification;
    }

    getNotifications(userId) {
        const notifications = JSON.parse(localStorage.getItem('ubushop_notifications')) || [];
        return notifications.filter(n => n.userId === userId && !n.isRead);
    }

    markAsRead(notificationId) {
        const notifications = JSON.parse(localStorage.getItem('ubushop_notifications')) || [];
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.isRead = true;
            localStorage.setItem('ubushop_notifications', JSON.stringify(notifications));
            return true;
        }
        
        return false;
    }

    // ========== ТРАНЗАКЦИИ ==========
    createTransaction(transactionData) {
        const transactions = JSON.parse(localStorage.getItem('ubushop_transactions')) || [];
        
        const transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...transactionData,
            timestamp: new Date().toISOString()
        };
        
        transactions.push(transaction);
        localStorage.setItem('ubushop_transactions', JSON.stringify(transactions));
        
        return transaction;
    }

    getTransactions(userId) {
        const transactions = JSON.parse(localStorage.getItem('ubushop_transactions')) || [];
        return transactions.filter(t => t.userId === userId);
    }
}

// ========== TELEGRAM ИНТЕГРАЦИЯ ==========
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp || null;
        this.isTelegramApp = !!this.tg;
    }

    init() {
        if (!this.isTelegramApp) {
            console.log('Not in Telegram Web App');
            return null;
        }
        
        try {
            console.log('Initializing Telegram Web App');
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            this.setupTheme();
            
            const user = this.tg.initDataUnsafe?.user;
            if (user) {
                console.log('Telegram user detected:', user);
                return user;
            }
            
            return null;
        } catch (error) {
            console.error('Error initializing Telegram:', error);
            return null;
        }
    }

    setupTheme() {
        if (!this.isTelegramApp) return;
        
        if (this.tg.colorScheme === 'dark') {
            document.body.classList.add('telegram-dark');
            document.body.classList.remove('telegram-light');
        } else {
            document.body.classList.add('telegram-light');
            document.body.classList.remove('telegram-dark');
        }
        
        this.tg.setHeaderColor('secondary_bg_color');
        this.tg.setBackgroundColor('secondary_bg_color');
    }

    handleTelegramUser(telegramUser, db) {
        try {
            let user = db.getUserByTelegramId(telegramUser.id);
            
            if (user) {
                // Обновляем существующего пользователя
                user.telegramId = telegramUser.id;
                user.telegramUsername = telegramUser.username ? `@${telegramUser.username}` : null;
                user.firstName = telegramUser.first_name;
                user.lastName = telegramUser.last_name;
                user.avatar = telegramUser.photo_url || user.avatar;
                user.isTelegramUser = true;
                user.lastLogin = new Date().toISOString();
                
                db.updateUser(user);
                return user;
            } else {
                // Создаем нового пользователя
                const userData = {
                    telegramId: telegramUser.id,
                    telegramUsername: telegramUser.username ? `@${telegramUser.username}` : null,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name,
                    nickname: telegramUser.username || `user_${telegramUser.id}`,
                    email: `telegram_${telegramUser.id}@ubushop.com`,
                    password: Math.random().toString(36).slice(-12),
                    avatar: telegramUser.photo_url,
                    isTelegramUser: true
                };
                
                const newUser = db.createUser(userData);
                
                // Создаем приветственное уведомление
                db.createNotification({
                    userId: newUser.id,
                    type: 'welcome',
                    title: 'Добро пожаловать в UbuShop! 🚀',
                    message: 'Вы успешно вошли через Telegram. Начните исследовать космический маркетплейс!',
                    icon: 'fas fa-rocket'
                });
                
                return newUser;
            }
        } catch (error) {
            console.error('Error handling Telegram user:', error);
            return null;
        }
    }

    showAlert(message) {
        if (this.isTelegramApp) {
            try {
                this.tg.showAlert(message);
            } catch (error) {
                alert(message);
            }
        } else {
            alert(message);
        }
    }

    openTelegram() {
        if (this.isTelegramApp) {
            this.showAlert('Вы уже в Telegram Web App!');
            return false;
        }
        
        const telegramUrl = `https://t.me/ubushop_bot/app`;
        window.open(telegramUrl, '_blank');
        return true;
    }
}

// ========== ОСНОВНОЕ ПРИЛОЖЕНИЕ ==========
class UbuShopApp {
    constructor() {
        this.db = new Database();
        this.tg = new TelegramIntegration();
        this.currentUser = this.db.getCurrentUser();
        this.currentView = this.currentUser ? 'main' : 'auth';
        this.currentCategory = null;
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        console.log('Initializing UbuShop App');
        
        // Инициализируем частицы
        this.initParticles();
        
        // Начинаем загрузку
        this.startLoading();
        
        // Настраиваем глобальные события
        this.setupGlobalEvents();
        
        // Проверяем Telegram пользователя
        this.checkTelegramUser();
    }

    initParticles() {
        if (typeof particlesJS === 'undefined') {
            console.warn('Particles.js not loaded, retrying...');
            setTimeout(() => this.initParticles(), 100);
            return;
        }
        
        try {
            particlesJS('particles-js', {
                particles: {
                    number: { 
                        value: 60, 
                        density: { 
                            enable: true, 
                            value_area: 800 
                        } 
                    },
                    color: { 
                        value: "#00d4ff" 
                    },
                    shape: { 
                        type: "circle" 
                    },
                    opacity: { 
                        value: 0.2, 
                        random: true 
                    },
                    size: { 
                        value: 2.5, 
                        random: true 
                    },
                    line_linked: {
                        enable: true,
                        distance: 120,
                        color: "#9d4edd",
                        opacity: 0.1,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1.5,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { 
                            enable: true, 
                            mode: "repulse" 
                        },
                        onclick: { 
                            enable: true, 
                            mode: "push" 
                        }
                    }
                }
            });
            console.log('Particles initialized successfully');
        } catch (error) {
            console.error('Error initializing particles:', error);
        }
    }

    checkTelegramUser() {
        if (this.tg.isTelegramApp && !this.currentUser) {
            console.log('Checking Telegram user...');
            const tgUser = this.tg.init();
            if (tgUser) {
                console.log('Processing Telegram user...');
                const user = this.tg.handleTelegramUser(tgUser, this.db);
                if (user) {
                    this.currentUser = user;
                    this.currentView = 'main';
                    console.log('Telegram user logged in:', user.nickname);
                    
                    // Показываем уведомление после загрузки
                    setTimeout(() => {
                        this.showNotification(`Добро пожаловать в космос, ${user.nickname}! 🚀`, 'success');
                    }, 1000);
                }
            }
        }
    }

    startLoading() {
        console.log('Starting loading sequence...');
        
        // Быстрая загрузка - 2 секунды максимум
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                
                setTimeout(() => {
                    this.render();
                    
                    // Показываем кнопку Telegram если не в Telegram
                    if (!this.tg.isTelegramApp) {
                        const tgToggle = document.getElementById('telegram-toggle');
                        if (tgToggle) tgToggle.classList.remove('hidden');
                    }
                    
                    console.log('App rendered successfully');
                }, 300);
            }
        }, 1500);
    }

    setupGlobalEvents() {
        console.log('Setting up global events...');
        
        // Кнопка переключения в Telegram
        const tgBtn = document.getElementById('tg-btn');
        if (tgBtn) {
            tgBtn.addEventListener('click', () => {
                this.tg.openTelegram();
            });
        }
        
        // Глобальный обработчик кликов
        document.addEventListener('click', (e) => {
            // Кнопки навигации
            const navBtn = e.target.closest('.nav-btn');
            if (navBtn) {
                const action = navBtn.dataset.action;
                console.log('Navigation button clicked:', action);
                this.handleNavAction(action);
                return;
            }
            
            // Кнопки категорий
            const categoryBtn = e.target.closest('.category-btn');
            if (categoryBtn && categoryBtn.dataset.category) {
                const category = categoryBtn.dataset.category;
                console.log('Category button clicked:', category);
                this.setCategory(category);
                return;
            }
            
            // Вкладки аутентификации
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.dataset.tab) {
                const tab = tabBtn.dataset.tab;
                console.log('Tab button clicked:', tab);
                this.switchAuthTab(tab);
                return;
            }
            
            // Кнопки закрытия модалок
            const closeBtn = e.target.closest('.close-btn');
            if (closeBtn) {
                console.log('Close button clicked');
                this.closeModal();
                return;
            }
            
            // Кнопки покупки товаров
            const buyBtn = e.target.closest('[onclick*="showInterest"]');
            if (buyBtn) {
                const match = buyBtn.getAttribute('onclick').match(/showInterest\('([^']+)'\)/);
                if (match && match[1]) {
                    const listingId = match[1];
                    console.log('Buy button clicked for listing:', listingId);
                    this.showInterest(listingId);
                    return;
                }
            }
        });
        
        // Поиск по Enter
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'search-input' && e.key === 'Enter') {
                console.log('Search triggered by Enter');
                this.searchListings();
            }
        });
        
        // Глобальные функции
        window.switchToTelegram = () => this.tg.openTelegram();
        window.logout = () => this.logout();
        window.closeModal = () => this.closeModal();
        
        console.log('Global events setup complete');
    }

    // ========== РЕНДЕРИНГ ==========
    render() {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App container not found!');
            return;
        }
        
        console.log('Rendering view:', this.currentView);
        
        let html = '';
        switch (this.currentView) {
            case 'auth':
                html = this.renderAuthScreen();
                break;
            case 'main':
                html = this.renderMainInterface();
                break;
            case 'buy':
                html = this.renderMainInterface();
                break;
            case 'auction':
                html = this.renderMainInterface();
                break;
            case 'profile':
                html = this.renderMainInterface();
                break;
            default:
                html = this.renderAuthScreen();
        }
        
        app.innerHTML = html;
        
        // Рендерим контентную область для основных видов
        if (this.currentView !== 'auth') {
            this.renderContentArea();
        }
        
        // Обновляем активные вкладки
        this.updateActiveTabs();
    }

    renderAuthScreen() {
        return `
            <div class="auth-container animate__animated animate__fadeIn">
                <div class="brand-title">
                    <h1 class="nebula-text">UbuShop</h1>
                    <p class="powered-by">powered by <span class="ubuway-gradient">Ubuway</span></p>
                </div>
                
                <h2 class="auth-title">Космический Маркетплейс</h2>
                <p class="auth-subtitle">Покупайте и продавайте с помощью Telegram Stars ${CONFIG.STAR_EMOJI}</p>
                
                <div class="auth-tabs">
                    <button class="tab-btn active" data-tab="login">Вход</button>
                    <button class="tab-btn" data-tab="register">Регистрация</button>
                </div>
                
                <div id="auth-forms">
                    ${this.renderLoginForm()}
                </div>
                
                <div class="auth-divider">
                    <span>или</span>
                </div>
                
                <div class="telegram-auth">
                    <button class="btn btn-secondary" onclick="switchToTelegram()" style="width: 100%;">
                        <i class="fab fa-telegram"></i> Продолжить в Telegram
                    </button>
                    <p class="auth-hint">Рекомендуется для быстрого доступа и уведомлений</p>
                </div>
            </div>
        `;
    }

    renderLoginForm() {
        return `
            <div id="login-form" class="auth-form active">
                <div class="form-group">
                    <label>Email или Никнейм</label>
                    <input type="text" id="login-identifier" class="form-input" placeholder="Введите email или никнейм">
                </div>
                
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="login-password" class="form-input" placeholder="Введите пароль">
                    <div class="password-actions">
                        <button type="button" class="btn-text" onclick="app.togglePassword('login-password')">
                            <i class="fas fa-eye"></i> Показать
                        </button>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="app.login()" style="width: 100%; margin-top: 20px;">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </button>
            </div>
        `;
    }

    renderRegisterForm() {
        return `
            <div id="register-form" class="auth-form">
                <div class="form-group">
                    <label>Никнейм</label>
                    <input type="text" id="register-nickname" class="form-input" placeholder="Уникальный никнейм">
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="register-email" class="form-input" placeholder="Ваш email">
                </div>
                
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="register-password" class="form-input" placeholder="Минимум ${CONFIG.MIN_PASSWORD_LENGTH} символов">
                </div>
                
                <div class="form-group">
                    <label>Подтвердите пароль</label>
                    <input type="password" id="register-password-confirm" class="form-input" placeholder="Повторите пароль">
                </div>
                
                <button class="btn btn-primary" onclick="app.register()" style="width: 100%; margin-top: 20px;">
                    <i class="fas fa-user-plus"></i> Зарегистрироваться
                </button>
            </div>
        `;
    }

    renderMainInterface() {
        if (!this.currentUser) {
            console.log('No current user, redirecting to auth');
            return this.renderAuthScreen();
        }
        
        return `
            <div class="main-interface animate__animated animate__fadeIn">
                <div class="market-header">
                    <div class="header-content">
                        <div class="logo-section">
                            <div class="logo-main">UbuShop</div>
                            <div class="logo-sub">космический маркетплейс</div>
                        </div>
                        
                        <div class="user-info">
                            <div class="balance">
                                <div class="stars-count">
                                    <i class="fas fa-star"></i> ${this.currentUser.stars || 0}
                                </div>
                                <div class="energy-count">
                                    <i class="fas fa-bolt"></i> ${this.currentUser.energy || 0}
                                </div>
                            </div>
                            
                            <div class="user-profile" onclick="app.showProfile()">
                                <div class="user-avatar-small">
                                    ${this.currentUser.avatar ? 
                                        `<img src="${this.currentUser.avatar}" alt="${this.currentUser.nickname}" 
                                             onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user-astronaut\\'></i>';">` :
                                        `<i class="fas fa-user-astronaut"></i>`
                                    }
                                </div>
                                <div class="user-details">
                                    <div class="user-nickname">${this.currentUser.nickname}</div>
                                    <div class="user-level">Уровень ${this.currentUser.level || 1}</div>
                                </div>
                            </div>
                            
                            <button class="btn btn-outline btn-small" onclick="logout()">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="nav-container">
                    <button class="nav-btn" data-action="main">
                        <i class="fas fa-home nav-icon"></i>
                        <span class="nav-text">Главная</span>
                        <span class="nav-subtext">Обзор маркетплейса</span>
                    </button>
                    
                    <button class="nav-btn" data-action="buy">
                        <i class="fas fa-shopping-cart nav-icon"></i>
                        <span class="nav-text">Купить</span>
                        <span class="nav-subtext">Найдите нужный товар</span>
                    </button>
                    
                    <button class="nav-btn" data-action="sell">
                        <i class="fas fa-coins nav-icon"></i>
                        <span class="nav-text">Продать</span>
                        <span class="nav-subtext">Разместите объявление</span>
                    </button>
                    
                    <button class="nav-btn" data-action="profile">
                        <i class="fas fa-user-astronaut nav-icon"></i>
                        <span class="nav-text">Профиль</span>
                        <span class="nav-subtext">Ваш аккаунт</span>
                    </button>
                </div>
                
                <div id="content-area" class="content-area"></div>
            </div>
        `;
    }

    renderContentArea() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        let html = '';
        switch (this.currentView) {
            case 'main':
                html = this.renderHomeContent();
                break;
            case 'buy':
                html = this.renderBuyContent();
                break;
            case 'profile':
                html = this.renderProfileContent();
                break;
            default:
                html = this.renderHomeContent();
        }
        
        contentArea.innerHTML = html;
    }

    renderHomeContent() {
        const notifications = this.db.getNotifications(this.currentUser.id);
        const unreadCount = notifications.length;
        
        return `
            <div class="animate__animated animate__fadeIn">
                <div class="cosmic-card" style="margin-bottom: 30px;">
                    <h2 style="color: var(--neon-blue); margin-bottom: 20px; font-size: 2rem; display: flex; align-items: center; gap: 15px;">
                        Добро пожаловать в космос! 🚀
                        ${unreadCount > 0 ? `
                            <span style="background: var(--neon-pink); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.9rem;">
                                ${unreadCount} новое уведомление
                            </span>
                        ` : ''}
                    </h2>
                    <p style="color: var(--text-gray); font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
                        Здесь вы можете покупать и продавать товары с помощью Telegram Stars ${CONFIG.STAR_EMOJI}<br>
                        Выберите раздел в меню выше для начала работы.
                    </p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                        <div style="background: rgba(0, 212, 255, 0.1); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(0, 212, 255, 0.2);">
                            <i class="fas fa-shopping-cart" style="font-size: 2.5rem; color: var(--neon-blue); margin-bottom: 15px;"></i>
                            <h3 style="color: var(--text-white); margin-bottom: 10px;">Покупайте</h3>
                            <p style="color: var(--text-gray); font-size: 0.95rem;">Найдите нужный товар среди тысяч предложений</p>
                        </div>
                        
                        <div style="background: rgba(157, 78, 221, 0.1); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(157, 78, 221, 0.2);">
                            <i class="fas fa-coins" style="font-size: 2.5rem; color: var(--neon-purple); margin-bottom: 15px;"></i>
                            <h3 style="color: var(--text-white); margin-bottom: 10px;">Продавайте</h3>
                            <p style="color: var(--text-gray); font-size: 0.95rem;">Разместите свои товары и получайте Telegram Stars</p>
                        </div>
                        
                        <div style="background: rgba(255, 215, 0, 0.1); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-gavel" style="font-size: 2.5rem; color: var(--neon-gold); margin-bottom: 15px;"></i>
                            <h3 style="color: var(--text-white); margin-bottom: 10px;">Торгуйте</h3>
                            <p style="color: var(--text-gray); font-size: 0.95rem;">Участвуйте в аукционах и находите лучшие предложения</p>
                        </div>
                    </div>
                </div>
                
                <div class="cosmic-card">
                    <h3 style="color: var(--neon-blue); margin-bottom: 20px; font-size: 1.5rem;">Популярные товары</h3>
                    ${this.renderFeaturedListings()}
                </div>
            </div>
        `;
    }

    renderFeaturedListings() {
        const listings = this.db.getListings({ sortBy: 'popular' }).slice(0, 3);
        
        if (listings.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Пока нет товаров</h3>
                    <p>Будьте первым, кто разместит товар!</p>
                    <button class="btn btn-primary" onclick="app.showSellModal()">
                        <i class="fas fa-plus"></i> Разместить товар
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="items-grid">
                ${listings.map((listing, index) => `
                    <div class="item-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                        <div class="item-header">
                            <h3 class="item-title">${listing.title}</h3>
                            <span class="item-category">${listing.category}</span>
                        </div>
                        
                        <p class="item-description">${listing.description}</p>
                        
                        <div class="item-meta">
                            <div class="item-seller">
                                <i class="fas fa-user"></i>
                                ${listing.sellerName || 'Продавец'}
                            </div>
                            <div class="item-date">
                                <i class="far fa-clock"></i>
                                ${this.formatDate(listing.createdAt)}
                            </div>
                        </div>
                        
                        <div class="item-stats">
                            <div class="item-views">
                                <i class="fas fa-eye"></i> ${listing.views || 0}
                            </div>
                            <div class="item-interest">
                                <i class="fas fa-heart"></i> ${listing.interest || 0}
                            </div>
                        </div>
                        
                        <div class="item-footer">
                            <div class="stars-price">
                                <i class="fas fa-star"></i> ${listing.stars}
                            </div>
                            <button class="btn btn-primary" onclick="app.showInterest('${listing.id}')">
                                <i class="fas fa-shopping-cart"></i> Купить
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderBuyContent() {
        const categories = ['NFT', 'Аккаунт', 'Чат', 'Канал', 'Номер', 'Другое'];
        
        return `
            <div class="animate__animated animate__fadeIn">
                <div class="search-container">
                    <div class="search-box">
                        <input type="text" 
                               id="search-input" 
                               class="search-input" 
                               placeholder="Поиск товаров..."
                               value="${this.searchQuery}">
                        <button class="btn btn-primary" onclick="app.searchListings()">
                            <i class="fas fa-search"></i> Поиск
                        </button>
                        <button class="btn btn-outline" onclick="app.clearSearch()">
                            <i class="fas fa-times"></i> Очистить
                        </button>
                    </div>
                    
                    <div class="category-selector">
                        ${categories.map(cat => `
                            <button class="category-btn ${this.currentCategory === cat ? 'active' : ''}" 
                                    data-category="${cat}">
                                <i class="fas fa-${this.getCategoryIcon(cat)}"></i>
                                ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div id="listings-container">
                    ${this.renderListings()}
                </div>
            </div>
        `;
    }

    renderListings() {
        const filters = {};
        if (this.currentCategory) filters.category = this.currentCategory;
        if (this.searchQuery) filters.search = this.searchQuery;
        
        const listings = this.db.getListings(filters);
        
        if (listings.length === 0) {
            return `
                <div class="cosmic-card">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>Нет объявлений</h3>
                        <p>
                            ${this.currentCategory ? 
                                `В категории "${this.currentCategory}" пока нет объявлений` : 
                                this.searchQuery ? 
                                `Не найдено объявлений по запросу "${this.searchQuery}"` :
                                'Пока нет объявлений'
                            }
                        </p>
                        ${!this.currentCategory && !this.searchQuery ? `
                            <button class="btn btn-primary" onclick="app.showSellModal()">
                                <i class="fas fa-plus"></i> Создать первое объявление
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="items-grid">
                ${listings.map((listing, index) => `
                    <div class="item-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                        <div class="item-header">
                            <h3 class="item-title">${listing.title}</h3>
                            <span class="item-category">${listing.category}</span>
                        </div>
                        
                        <p class="item-description">${listing.description}</p>
                        
                        <div class="item-meta">
                            <div class="item-seller">
                                <i class="fas fa-user"></i>
                                ${listing.sellerName || 'Продавец'}
                            </div>
                            <div class="item-date">
                                <i class="far fa-clock"></i>
                                ${this.formatDate(listing.createdAt)}
                            </div>
                        </div>
                        
                        <div class="item-stats">
                            <div class="item-views">
                                <i class="fas fa-eye"></i> ${listing.views || 0}
                            </div>
                            <div class="item-interest">
                                <i class="fas fa-heart"></i> ${listing.interest || 0}
                            </div>
                        </div>
                        
                        <div class="item-footer">
                            <div class="stars-price">
                                <i class="fas fa-star"></i> ${listing.stars}
                            </div>
                            <button class="btn btn-primary" onclick="app.showInterest('${listing.id}')">
                                <i class="fas fa-shopping-cart"></i> Купить
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProfileContent() {
        const transactions = this.db.getTransactions(this.currentUser.id);
        const recentTransactions = transactions.slice(-5).reverse();
        
        return `
            <div class="animate__animated animate__fadeIn">
                <div class="cosmic-card" style="margin-bottom: 30px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div class="user-avatar-small" style="width: 100px; height: 100px; font-size: 2.5rem; margin: 0 auto 20px;">
                            ${this.currentUser.avatar ? 
                                `<img src="${this.currentUser.avatar}" alt="${this.currentUser.nickname}" 
                                     onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user-astronaut\\'></i>';">` :
                                `<i class="fas fa-user-astronaut"></i>`
                            }
                        </div>
                        <h2 style="color: var(--text-white); margin-bottom: 10px; font-size: 1.8rem;">${this.currentUser.nickname}</h2>
                        <p style="color: var(--text-gray);">${this.currentUser.email}</p>
                        ${this.currentUser.telegramUsername ? `
                            <p style="color: var(--neon-blue); margin-top: 10px;">
                                <i class="fab fa-telegram"></i> ${this.currentUser.telegramUsername}
                            </p>
                        ` : ''}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(255, 215, 0, 0.2);">
                            <div style="font-size: 2.5rem; font-weight: 800; color: var(--neon-gold); margin-bottom: 10px;">
                                ${this.currentUser.stars || 0}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.9rem;">Telegram Stars</div>
                        </div>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(0, 255, 170, 0.2);">
                            <div style="font-size: 2.5rem; font-weight: 800; color: var(--neon-green); margin-bottom: 10px;">
                                ${this.currentUser.energy || 0}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.9rem;">Энергия</div>
                        </div>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(0, 212, 255, 0.2);">
                            <div style="font-size: 2.5rem; font-weight: 800; color: var(--neon-blue); margin-bottom: 10px;">
                                ${this.currentUser.level || 1}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.9rem;">Уровень</div>
                        </div>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid rgba(157, 78, 221, 0.2);">
                            <div style="font-size: 2.5rem; font-weight: 800; color: var(--neon-purple); margin-bottom: 10px;">
                                ${this.currentUser.rating || 5.0}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.9rem;">Рейтинг</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="app.showEditProfileModal()">
                            <i class="fas fa-edit"></i> Редактировать профиль
                        </button>
                        <button class="btn btn-secondary" onclick="app.claimDailyBonus()">
                            <i class="fas fa-gift"></i> Получить бонус
                        </button>
                        <button class="btn btn-outline" onclick="app.showMyListings()">
                            <i class="fas fa-list"></i> Мои объявления
                        </button>
                    </div>
                </div>
                
                ${recentTransactions.length > 0 ? `
                    <div class="cosmic-card">
                        <h3 style="color: var(--neon-blue); margin-bottom: 20px; font-size: 1.5rem;">Последние транзакции</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; padding: 12px; color: var(--text-gray); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Тип</th>
                                        <th style="text-align: left; padding: 12px; color: var(--text-gray); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Описание</th>
                                        <th style="text-align: left; padding: 12px; color: var(--text-gray); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Сумма</th>
                                        <th style="text-align: left; padding: 12px; color: var(--text-gray); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentTransactions.map(tx => `
                                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                            <td style="padding: 12px; color: var(--text-white);">
                                                ${tx.type === 'purchase' ? '🛒 Покупка' : 
                                                  tx.type === 'sale' ? '💰 Продажа' : 
                                                  tx.type === 'bonus' ? '🎁 Бонус' : tx.type}
                                            </td>
                                            <td style="padding: 12px; color: var(--text-gray);">${tx.description || '-'}</td>
                                            <td style="padding: 12px; color: ${tx.amount > 0 ? 'var(--neon-green)' : 'var(--neon-pink)'}; font-weight: 600;">
                                                ${tx.amount > 0 ? '+' : ''}${tx.amount} ${CONFIG.STAR_EMOJI}
                                            </td>
                                            <td style="padding: 12px; color: var(--text-gray);">${this.formatDate(tx.timestamp)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    updateActiveTabs() {
        // Обновляем активные вкладки аутентификации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tab = btn.dataset.tab;
            btn.classList.toggle('active', 
                (tab === 'login' && document.getElementById('login-form')) || 
                (tab === 'register' && document.getElementById('register-form'))
            );
        });
        
        // Обновляем активные кнопки навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const action = btn.dataset.action;
            btn.style.borderColor = action === this.currentView ? 'var(--neon-blue)' : '';
        });
        
        // Обновляем активные категории
        document.querySelectorAll('.category-btn').forEach(btn => {
            const category = btn.dataset.category;
            btn.classList.toggle('active', category === this.currentCategory);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    getCategoryIcon(category) {
        const icons = {
            'NFT': 'gem',
            'Аккаунт': 'user-circle',
            'Чат': 'comments',
            'Канал': 'broadcast-tower',
            'Номер': 'phone',
            'Другое': 'cubes'
        };
        return icons[category] || 'cube';
    }

    // ========== ОСНОВНЫЕ МЕТОДЫ ==========
    handleNavAction(action) {
        console.log('Handling nav action:', action);
        
        if (action === 'sell') {
            this.showSellModal();
            return;
        }
        
        this.currentView = action;
        this.render();
    }

    switchAuthTab(tabName) {
        console.log('Switching auth tab to:', tabName);
        
        const formsContainer = document.getElementById('auth-forms');
        if (!formsContainer) return;
        
        if (tabName === 'login') {
            formsContainer.innerHTML = this.renderLoginForm();
        } else {
            formsContainer.innerHTML = this.renderRegisterForm();
        }
        
        this.updateActiveTabs();
    }

    login() {
        console.log('Login attempt');
        
        const identifier = document.getElementById('login-identifier')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        
        if (!identifier || !password) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }
        
        const user = this.db.authenticateUser(identifier, password);
        
        if (user) {
            this.currentUser = user;
            this.currentView = 'main';
            this.render();
            this.showNotification(`Добро пожаловать, ${user.nickname}! 🚀`, 'success');
        } else {
            this.showNotification('Неверный email/никнейм или пароль', 'error');
        }
    }

    register() {
        console.log('Register attempt');
        
        const nickname = document.getElementById('register-nickname')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const passwordConfirm = document.getElementById('register-password-confirm')?.value;
        
        if (!nickname || !email || !password || !passwordConfirm) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (password.length < CONFIG.MIN_PASSWORD_LENGTH) {
            this.showNotification(`Пароль должен быть не менее ${CONFIG.MIN_PASSWORD_LENGTH} символов`, 'error');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (!email.includes('@')) {
            this.showNotification('Введите корректный email', 'error');
            return;
        }
        
        try {
            const user = this.db.createUser({
                nickname,
                email,
                password
            });
            
            this.currentUser = user;
            this.currentView = 'main';
            this.render();
            this.showNotification(`Регистрация успешна! Добро пожаловать, ${nickname}! 🎉`, 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    logout() {
        console.log('Logging out');
        
        this.db.clearCurrentUser();
        this.currentUser = null;
        this.currentView = 'auth';
        this.currentCategory = null;
        this.searchQuery = '';
        
        this.render();
        this.showNotification('Вы успешно вышли из системы', 'info');
    }

    setCategory(category) {
        console.log('Setting category:', category);
        
        this.currentCategory = this.currentCategory === category ? null : category;
        this.renderContentArea();
    }

    searchListings() {
        console.log('Searching listings');
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
            this.renderContentArea();
        }
    }

    clearSearch() {
        console.log('Clearing search');
        
        this.searchQuery = '';
        this.currentCategory = null;
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        this.renderContentArea();
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    }

    // ========== МОДАЛЬНЫЕ ОКНА ==========
    showSellModal() {
        if (!this.currentUser) {
            this.showNotification('Войдите в аккаунт чтобы продавать товары', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Создать объявление</h2>
                    <button class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="form-group">
                    <label>Название товара *</label>
                    <input type="text" id="listing-title" class="form-input" placeholder="Краткое и понятное название">
                </div>
                
                <div class="form-group">
                    <label>Описание *</label>
                    <textarea id="listing-description" class="form-input" rows="4" placeholder="Подробное описание товара"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Категория *</label>
                    <select id="listing-category" class="form-input">
                        <option value="">Выберите категорию</option>
                        <option value="NFT">NFT</option>
                        <option value="Аккаунт">Аккаунт</option>
                        <option value="Чат">Чат</option>
                        <option value="Канал">Канал</option>
                        <option value="Номер">Номер</option>
                        <option value="Другое">Другое</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Цена в Telegram Stars *</label>
                    <div style="position: relative;">
                        <input type="number" id="listing-stars" class="form-input" placeholder="0" min="1" value="100">
                        <span style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: var(--neon-gold); font-weight: 600;">
                            ${CONFIG.STAR_EMOJI}
                        </span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Контакты для связи *</label>
                    <input type="text" id="listing-contact" class="form-input" 
                           placeholder="Telegram, WhatsApp, Email" 
                           value="${this.currentUser.telegramUsername || ''}">
                </div>
                
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="app.publishListing()">
                        <i class="fas fa-paper-plane"></i> Опубликовать
                    </button>
                    <button class="btn btn-outline" onclick="app.closeModal()">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Добавляем обработчик закрытия
        modal.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
    }

    publishListing() {
        const title = document.getElementById('listing-title')?.value.trim();
        const description = document.getElementById('listing-description')?.value.trim();
        const category = document.getElementById('listing-category')?.value;
        const stars = parseInt(document.getElementById('listing-stars')?.value) || 0;
        const contact = document.getElementById('listing-contact')?.value.trim();
        
        if (!title || !description || !category || !stars || !contact) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (stars < 1) {
            this.showNotification('Цена должна быть больше 0', 'error');
            return;
        }
        
        if (stars > (this.currentUser.stars || 0) * 10) {
            this.showNotification('Цена слишком высокая для вашего уровня', 'warning');
            return;
        }
        
        try {
            const listing = this.db.createListing({
                title,
                description,
                category,
                stars,
                contact,
                sellerId: this.currentUser.id,
                sellerName: this.currentUser.nickname
            });
            
            this.closeModal();
            this.showNotification('Объявление успешно опубликовано! 🚀', 'success');
            
            // Переходим в категорию с новым объявлением
            this.currentCategory = category;
            this.currentView = 'buy';
            this.render();
            
            // Создаем транзакцию
            this.db.createTransaction({
                userId: this.currentUser.id,
                type: 'listing_created',
                description: `Создание объявления "${title}"`,
                amount: 0,
                listingId: listing.id
            });
        } catch (error) {
            this.showNotification('Ошибка при создании объявления: ' + error.message, 'error');
        }
    }

    showInterest(listingId) {
        if (!this.currentUser) {
            this.showNotification('Войдите в аккаунт чтобы купить товар', 'error');
            return;
        }
        
        const listings = this.db.getListings();
        const listing = listings.find(l => l.id === listingId);
        
        if (!listing) {
            this.showNotification('Объявление не найдено', 'error');
            return;
        }
        
        if (listing.sellerId === this.currentUser.id) {
            this.showNotification('Это ваше собственное объявление', 'info');
            return;
        }
        
        // Увеличиваем просмотры и интерес
        this.db.incrementViews(listingId);
        this.db.addInterest(listingId);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Покупка товара</h2>
                    <button class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="text-align: center; padding: 20px 0 30px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--neon-green), var(--neon-cyan)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                        <i class="fas fa-shopping-cart" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h3 style="color: var(--text-white); margin-bottom: 15px; font-size: 1.5rem;">${listing.title}</h3>
                    <div style="color: var(--neon-gold); font-size: 2rem; font-weight: 800; margin-bottom: 25px;">
                        ${listing.stars} ${CONFIG.STAR_EMOJI}
                    </div>
                    
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 30px;">
                        <h4 style="color: var(--neon-blue); margin-bottom: 10px; font-size: 1.1rem;">Следующие шаги:</h4>
                        <ol style="color: var(--text-gray); text-align: left; padding-left: 20px; font-size: 0.95rem; line-height: 1.6;">
                            <li>Свяжитесь с продавцом через указанные контакты</li>
                            <li>Обсудите детали покупки и доставки</li>
                            <li>Оплатите через Telegram Stars ${CONFIG.STAR_EMOJI}</li>
                            <li>Получите товар и подтвердите получение</li>
                            <li>Оставьте отзыв о продавце</li>
                        </ol>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h4 style="color: var(--neon-blue); margin-bottom: 10px; font-size: 1.1rem;">Контакты продавца:</h4>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: var(--radius-md); color: var(--text-white); font-size: 1.1rem;">
                            ${listing.contact || 'Контакты не указаны'}
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="app.copyToClipboard('${listing.contact || ''}')">
                            <i class="fas fa-copy"></i> Скопировать контакты
                        </button>
                        <button class="btn btn-outline" onclick="app.closeModal()">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Добавляем обработчик закрытия
        modal.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        
        // Создаем уведомление для продавца
        this.db.createNotification({
            userId: listing.sellerId,
            type: 'interest',
            title: 'Новый интерес к вашему товару!',
            message: `Пользователь ${this.currentUser.nickname} заинтересовался вашим товаром "${listing.title}"`,
            icon: 'fas fa-heart'
        });
    }

    copyToClipboard(text) {
        if (!text || text === 'Контакты не указаны') {
            this.showNotification('Нет контактов для копирования', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Контакты скопированы в буфер обмена!', 'success');
        }).catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Контакты скопированы!', 'success');
        });
    }

    showProfile() {
        this.currentView = 'profile';
        this.render();
    }

    showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Редактировать профиль</h2>
                    <button class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div class="user-avatar-small" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 15px; cursor: pointer;" onclick="app.changeAvatar()">
                        ${this.currentUser.avatar ? 
                            `<img src="${this.currentUser.avatar}" alt="${this.currentUser.nickname}" 
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user-astronaut\\'></i>';">` :
                            `<i class="fas fa-user-astronaut"></i>`
                        }
                    </div>
                    <button type="button" class="btn-text" onclick="app.changeAvatar()" style="color: var(--neon-blue);">
                        <i class="fas fa-camera"></i> Изменить аватар
                    </button>
                </div>
                
                <div class="form-group">
                    <label>Никнейм</label>
                    <input type="text" id="edit-nickname" class="form-input" value="${this.currentUser.nickname}">
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="edit-email" class="form-input" value="${this.currentUser.email}">
                </div>
                
                <div class="form-group">
                    <label>Telegram @username</label>
                    <input type="text" id="edit-telegram" class="form-input" value="${this.currentUser.telegramUsername || ''}" placeholder="@username">
                </div>
                
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="app.saveProfile()">
                        <i class="fas fa-save"></i> Сохранить
                    </button>
                    <button class="btn btn-outline" onclick="app.closeModal()">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Добавляем обработчик закрытия
        modal.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
    }

    saveProfile() {
        const nickname = document.getElementById('edit-nickname')?.value.trim();
        const email = document.getElementById('edit-email')?.value.trim();
        const telegram = document.getElementById('edit-telegram')?.value.trim();
        
        if (!nickname || !email) {
            this.showNotification('Заполните обязательные поля', 'error');
            return;
        }
        
        if (!email.includes('@')) {
            this.showNotification('Введите корректный email', 'error');
            return;
        }
        
        this.currentUser.nickname = nickname;
        this.currentUser.email = email;
        this.currentUser.telegramUsername = telegram || null;
        
        this.db.updateUser(this.currentUser);
        this.closeModal();
        this.render();
        this.showNotification('Профиль успешно обновлен!', 'success');
    }

    changeAvatar() {
        this.showNotification('В будущих версиях можно будет загружать аватары', 'info');
    }

    claimDailyBonus() {
        const now = new Date();
        const lastBonus = this.currentUser.lastBonus ? new Date(this.currentUser.lastBonus) : null;
        
        if (lastBonus && (now - lastBonus) < 24 * 60 * 60 * 1000) {
            const nextBonus = new Date(lastBonus.getTime() + 24 * 60 * 60 * 1000);
            const hoursLeft = Math.ceil((nextBonus - now) / (60 * 60 * 1000));
            this.showNotification(`Вы уже получали бонус сегодня. Следующий бонус через ${hoursLeft} часов`, 'info');
            return;
        }
        
        const bonusStars = 50;
        const bonusEnergy = 2;
        
        this.currentUser.stars = (this.currentUser.stars || 0) + bonusStars;
        this.currentUser.energy = (this.currentUser.energy || 0) + bonusEnergy;
        this.currentUser.lastBonus = now.toISOString();
        
        this.db.updateUser(this.currentUser);
        
        // Создаем транзакцию
        this.db.createTransaction({
            userId: this.currentUser.id,
            type: 'daily_bonus',
            description: 'Ежедневный бонус',
            amount: bonusStars
        });
        
        this.render();
        this.showNotification(`🎁 Ежедневный бонус получен! +${bonusStars} ${CONFIG.STAR_EMOJI} и +${bonusEnergy} энергии`, 'success');
    }

    showMyListings() {
        this.currentView = 'buy';
        this.currentCategory = null;
        this.searchQuery = '';
        
        const userListings = this.db.getListings({ sellerId: this.currentUser.id });
        
        if (userListings.length === 0) {
            this.showNotification('У вас пока нет объявлений', 'info');
        }
        
        this.render();
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.animation = 'modalFadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ========== УВЕДОМЛЕНИЯ ==========
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.log('Notification container not found, showing alert:', message);
            alert(message);
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        const colors = {
            success: 'var(--neon-green)',
            error: '#ff4757',
            info: 'var(--neon-blue)',
            warning: 'var(--neon-gold)'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icons[type] || icons.info} notification-icon"></i>
                <div style="flex: 1;">${message}</div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Добавляем обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Показываем с анимацией
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        console.log(`Notification (${type}):`, message);
    }
}

// ========== ЗАПУСК ПРИЛОЖЕНИЯ ==========
// Добавляем анимацию исчезновения модалки
const modalAnimation = document.createElement('style');
modalAnimation.textContent = `
    @keyframes modalFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(modalAnimation);

// Создаем глобальный объект приложения
window.app = new UbuShopApp();

// Глобальные вспомогательные функции
window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = input.nextElementSibling?.querySelector('i');
        if (icon) {
            icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    }
};