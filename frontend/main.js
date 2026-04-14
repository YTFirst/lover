/**
 * Vite Entry Point
 * This file imports all modules in the correct order for Vite bundling
 * while maintaining backward compatibility with the IIFE module pattern
 */

// Import backend services
import '../backend/llm-service.js';

// Import security utilities
import './security-utils.js';

// Import configuration
import '../config/character-config.js';

// Import core modules (order matters!)
import './modules/state.js';
import './modules/constants.js';
import './modules/storage.js';
import './modules/ui.js';
import './modules/agent.js';
import './modules/session.js';
import './modules/chat.js';
import './modules/memory.js';
import './modules/settings.js';
import './modules/character.js';
import './modules/theme.js';
import './modules/guide.js';
import './modules/export.js';
import './modules/emotion.js';
import './modules/quality.js';
import './modules/tutorial.js';
import './modules/care.js';
import './modules/reminder.js';

// Import main app initialization
import './app.js';

window.__moduleLoaded = true;
console.log('[Vite] All modules loaded successfully');
