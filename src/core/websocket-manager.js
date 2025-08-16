/**
 * WebSocket Connection Manager
 * Handles WebSocket connections, reconnection logic, and message handling for Upstox API
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Logger = require('../utils/logger');
const config = require('../config/config');
const { MESSAGE_TYPES } = require('../config/constants');

class WebSocketManager {
    constructor(accessToken, instrumentKey) {
        this.logger = new Logger('WEBSOCKET');
        this.accessToken = accessToken;
        this.instrumentKey = instrumentKey;
        this.ws = null;
        this.isConnected = false;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.pingTimer = null;
        this.connectionTimeout = null;
        
        // Configuration
        this.wsConfig = config.getWebSocketConfig();
        this.maxReconnectAttempts = this.wsConfig.maxReconnectAttempts;
        this.reconnectInterval = this.wsConfig.reconnectInterval;
        
        // Event handlers
        this.messageHandler = null;
        this.connectionHandler = null;
        this.errorHandler = null;
        this.closeHandler = null;
        
        // Bind methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onError = this.onError.bind(this);
        this.onClose = this.onClose.bind(this);
        this.send = this.send.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }

    /**
     * Set event handlers
     */
    setEventHandlers({ onMessage, onConnection, onError, onClose }) {
        this.messageHandler = onMessage;
        this.connectionHandler = onConnection;
        this.errorHandler = onError;
        this.closeHandler = onClose;
    }

    /**
     * Connect to WebSocket
     */
    connect() {
        if (this.isConnected || this.isReconnecting) {
            this.logger.warn('Connection already active or in progress');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.logger.connect('Establishing WebSocket connection...');
                
                // Clear any existing connection timeout
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                }

                // Create WebSocket connection
                this.ws = new WebSocket(this.wsConfig.url, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Api-Version': this.wsConfig.apiVersion || '3.0',
                        'Accept': 'application/json'
                    }
                });

                // Set connection timeout
                this.connectionTimeout = setTimeout(() => {
                    this.logger.error('Connection timeout');
                    if (this.ws.readyState === WebSocket.CONNECTING) {
                        this.ws.terminate();
                        reject(new Error('Connection timeout'));
                    }
                }, this.wsConfig.connectionTimeout);

                // Set up event listeners
                this.ws.once('open', () => {
                    clearTimeout(this.connectionTimeout);
                    this.onOpen();
                    resolve();
                });

                this.ws.once('error', (error) => {
                    clearTimeout(this.connectionTimeout);
                    this.onError(error);
                    reject(error);
                });

                this.ws.on('message', this.onMessage);
                this.ws.on('close', this.onClose);

            } catch (error) {
                this.logger.error('Error creating WebSocket connection', error);
                reject(error);
            }
        });
    }

    /**
     * Handle connection open
     */
    onOpen() {
        this.logger.success('WebSocket connection established');
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        
        // Clear any reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Start ping/pong to keep connection alive
        this.startHeartbeat();

        // Subscribe to instrument
        this.subscribe(this.instrumentKey);

        // Call external connection handler
        if (this.connectionHandler) {
            try {
                this.connectionHandler(true);
            } catch (error) {
                this.logger.error('Error in connection handler', error);
            }
        }
    }

    /**
     * Handle incoming messages
     */
    onMessage(data) {
        try {
            // Handle binary data if needed
            let messageStr;
            if (Buffer.isBuffer(data)) {
                messageStr = data.toString('utf8');
            } else {
                messageStr = data;
            }

            // Skip empty messages
            if (!messageStr.trim()) {
                return;
            }

            // Parse JSON message
            let message;
            try {
                message = JSON.parse(messageStr);
            } catch (parseError) {
                this.logger.warn(`Invalid JSON message: ${messageStr.substring(0, 100)}...`);
                return;
            }

            // Log debug info
            this.logger.debug(`Received message type: ${message.type || 'unknown'}`);

            // Call external message handler
            if (this.messageHandler) {
                try {
                    this.messageHandler(message);
                } catch (error) {
                    this.logger.error('Error in message handler', error);
                }
            }

        } catch (error) {
            this.logger.error('Error processing WebSocket message', error);
        }
    }

    /**
     * Handle connection errors
     */
    onError(error) {
        this.logger.error(`WebSocket error: ${error.message}`, error);
        this.isConnected = false;

        // Call external error handler
        if (this.errorHandler) {
            try {
                this.errorHandler(error);
            } catch (handlerError) {
                this.logger.error('Error in error handler', handlerError);
            }
        }
    }

    /**
     * Handle connection close
     */
    onClose(code, reason) {
        this.logger.disconnect(`WebSocket closed. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
        this.isConnected = false;
        this.stopHeartbeat();

        // Clear connection timeout
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }

        // Call external close handler
        if (this.closeHandler) {
            try {
                this.closeHandler(code, reason);
            } catch (error) {
                this.logger.error('Error in close handler', error);
            }
        }

        // Attempt reconnection if not manually closed
        if (code !== 1000 && !this.isReconnecting) {
            this.scheduleReconnect();
        }
    }

    /**
     * Send message to WebSocket
     */
    send(message) {
        if (!this.isConnected || !this.ws) {
            this.logger.warn('Cannot send message - WebSocket not connected');
            return false;
        }

        try {
            const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
            this.ws.send(messageStr);
            this.logger.debug(`Sent message: ${messageStr.substring(0, 100)}...`);
            return true;
        } catch (error) {
            this.logger.error('Error sending WebSocket message', error);
            return false;
        }
    }

    /**
     * Subscribe to instrument
     */
    subscribe(instrumentKey, mode = MESSAGE_TYPES.FULL_MODE) {
        const subscriptionMessage = {
            guid: uuidv4(),
            method: MESSAGE_TYPES.SUBSCRIPTION,
            data: {
                mode: mode,
                instrumentKeys: Array.isArray(instrumentKey) ? instrumentKey : [instrumentKey]
            }
        };

        this.logger.data(`Subscribing to: ${Array.isArray(instrumentKey) ? instrumentKey.join(', ') : instrumentKey}`);
        return this.send(subscriptionMessage);
    }

    /**
     * Unsubscribe from instrument
     */
    unsubscribe(instrumentKey) {
        const unsubscriptionMessage = {
            guid: uuidv4(),
            method: MESSAGE_TYPES.UNSUBSCRIPTION,
            data: {
                instrumentKeys: Array.isArray(instrumentKey) ? instrumentKey : [instrumentKey]
            }
        };

        this.logger.data(`Unsubscribing from: ${Array.isArray(instrumentKey) ? instrumentKey.join(', ') : instrumentKey}`);
        return this.send(unsubscriptionMessage);
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
            return;
        }

        if (this.isReconnecting) {
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;

        const delay = this.reconnectInterval * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5)); // Exponential backoff with cap
        
        this.logger.warn(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect().catch(error => {
                this.logger.error('Reconnection failed', error);
                this.isReconnecting = false;
                // Schedule next attempt
                this.scheduleReconnect();
            });
        }, delay);
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        // Clear existing timer
        this.stopHeartbeat();

        // Send ping every 30 seconds
        this.pingTimer = setInterval(() => {
            if (this.isConnected && this.ws) {
                try {
                    this.ws.ping();
                    this.logger.debug('Sent ping');
                } catch (error) {
                    this.logger.warn('Failed to send ping', error);
                }
            }
        }, 30000);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(code = 1000, reason = 'Manual disconnect') {
        this.logger.disconnect('Disconnecting WebSocket...');
        
        // Clear timers
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }

        // Reset state
        this.isReconnecting = false;
        this.reconnectAttempts = 0;

        // Close WebSocket
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close(code, reason);
            } else {
                this.ws.terminate();
            }
            this.ws = null;
        }

        this.isConnected = false;
        this.logger.success('WebSocket disconnected');
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            reconnecting: this.isReconnecting,
            attempts: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts,
            readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED
        };
    }

    /**
     * Reset connection state
     */
    reset() {
        this.disconnect();
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
    }
}

module.exports = WebSocketManager;
