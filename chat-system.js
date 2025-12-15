/**
 * chat-system.js
 * Real-time chat system for requesters and volunteers
 * Includes XSS protection, auto-polling, and message history
 */

class ChatSystem {
    /**
     * Initialize the chat system
     * @param {string} modalId - ID of the chat modal element
     * @param {object} options - Configuration options
     */
    constructor(modalId, options = {}) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        this.offerId = null;
        this.currentUser = null;
        this.messages = [];
        this.pollingInterval = null;
        
        // Configuration
        this.options = {
            apiUrl: options.apiUrl || 'http://localhost:3000/api',
            pollInterval: options.pollInterval || 3000, // 3 seconds
            maxMessageLength: options.maxMessageLength || 1000,
            ...options
        };
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    /**
     * Initialize DOM elements
     */
    initializeElements() {
        if (!this.modal) {
            console.error(`Chat modal with ID "${this.modalId}" not found`);
            return;
        }
        
        this.messagesContainer = this.modal.querySelector('.chat-messages');
        this.messageInput = this.modal.querySelector('.chat-input');
        this.sendButton = this.modal.querySelector('.chat-send-btn');
        this.closeButton = this.modal.querySelector('.chat-close-btn');
        this.chatTitle = this.modal.querySelector('.chat-title');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.sendButton || !this.messageInput || !this.closeButton) return;
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close modal
        this.closeButton.addEventListener('click', () => this.close());
        
        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }
    
    /**
     * Open chat modal for a specific offer
     * @param {number} offerId - The offer ID
     * @param {object} currentUser - Current logged in user
     * @param {string} chatTitle - Title for the chat
     */
    async open(offerId, currentUser, chatTitle = 'Chat') {
        this.offerId = offerId;
        this.currentUser = currentUser;
        
        if (this.chatTitle) {
            this.chatTitle.textContent = chatTitle;
        }
        
        // Show modal
        this.modal.style.display = 'flex';
        
        // Load messages
        await this.loadMessages();
        
        // Start polling for new messages
        this.startPolling();
        
        // Focus input
        if (this.messageInput) {
            this.messageInput.focus();
        }
    }
    
    /**
     * Close chat modal
     */
    close() {
        this.modal.style.display = 'none';
        this.stopPolling();
        this.offerId = null;
        
        // Clear input
        if (this.messageInput) {
            this.messageInput.value = '';
        }
    }
    
    /**
     * Load message history
     */
    async loadMessages() {
        try {
            const response = await fetch(
                `${this.options.apiUrl}/messages?offer_id=${this.offerId}`,
                { credentials: 'include' }
            );
            
            if (!response.ok) {
                throw new Error('Failed to load messages');
            }
            
            const data = await response.json();
            this.messages = data.messages || [];
            this.renderMessages();
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showError('Failed to load messages. Please try again.');
        }
    }
    
    /**
     * Send a message
     */
    async sendMessage() {
        const messageText = this.messageInput.value.trim();
        
        if (!messageText) return;
        
        if (messageText.length > this.options.maxMessageLength) {
            this.showError(`Message is too long. Maximum ${this.options.maxMessageLength} characters.`);
            return;
        }
        
        // Disable input while sending
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        
        try {
            const response = await fetch(`${this.options.apiUrl}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    offer_id: this.offerId,
                    message_text: messageText
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            // Clear input
            this.messageInput.value = '';
            
            // Reload messages
            await this.loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            // Re-enable input
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }
    
    /**
     * Render messages in the chat container
     */
    renderMessages() {
        if (!this.messagesContainer) return;
        
        if (this.messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="chat-empty">
                    <i class="fas fa-comments"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        this.messagesContainer.innerHTML = this.messages.map(msg => {
            const isCurrentUser = msg.sender_id === this.currentUser.id;
            const messageClass = isCurrentUser ? 'chat-message-sent' : 'chat-message-received';
            
            return `
                <div class="chat-message ${messageClass}">
                    <div class="chat-message-header">
                        <span class="chat-message-sender">${this.escapeHtml(msg.sender_name)}</span>
                        <span class="chat-message-time">${this.formatTime(msg.sent_at)}</span>
                    </div>
                    <div class="chat-message-content">
                        ${msg.message_text}
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString();
    }
    
    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    
    /**
     * Start polling for new messages
     */
    startPolling() {
        this.stopPolling(); // Clear any existing interval
        
        this.pollingInterval = setInterval(() => {
            this.loadMessages();
        }, this.options.pollInterval);
    }
    
    /**
     * Stop polling for new messages
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create temporary error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }
    
    /**
     * Destroy the chat system and clean up
     */
    destroy() {
        this.stopPolling();
        this.close();
    }
}

// Export for use in modules or as global variable
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatSystem;
}
