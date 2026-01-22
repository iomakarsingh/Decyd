// Action Buttons Component - Handles Order and Make button interactions

class ActionButtons {
    constructor(onOrder, onMake) {
        this.orderBtn = document.getElementById('order-btn');
        this.makeBtn = document.getElementById('make-btn');
        this.backupBtn = document.getElementById('show-backup-btn');

        this.onOrder = onOrder;
        this.onMake = onMake;

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for buttons
     */
    setupEventListeners() {
        this.orderBtn.addEventListener('click', (e) => {
            Animations.ripple(this.orderBtn, e);
            if (this.onOrder) this.onOrder();
        });

        this.makeBtn.addEventListener('click', (e) => {
            Animations.ripple(this.makeBtn, e);
            if (this.onMake) this.onMake();
        });
    }

    /**
     * Enable buttons
     */
    enable() {
        this.orderBtn.disabled = false;
        this.makeBtn.disabled = false;
        this.orderBtn.style.opacity = '1';
        this.makeBtn.style.opacity = '1';
    }

    /**
     * Disable buttons
     */
    disable() {
        this.orderBtn.disabled = true;
        this.makeBtn.disabled = true;
        this.orderBtn.style.opacity = '0.5';
        this.makeBtn.style.opacity = '0.5';
    }

    /**
     * Setup backup button handler
     */
    setupBackupHandler(onBackup) {
        this.backupBtn.addEventListener('click', () => {
            if (onBackup) onBackup();
        });
    }
}

// Export for use in other modules
window.ActionButtons = ActionButtons;
