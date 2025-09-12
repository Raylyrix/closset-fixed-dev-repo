/**
 * ♿ Accessibility Manager - Production Accessibility Features
 *
 * Comprehensive accessibility support for production:
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - ARIA attributes
 * - High contrast mode
 * - Reduced motion support
 */
export class AccessibilityManager {
    constructor() {
        this.config = {
            enableKeyboardNavigation: true,
            enableScreenReaderSupport: true,
            enableFocusManagement: true,
            enableHighContrast: false,
            enableReducedMotion: false,
            announceChanges: true,
            focusRingVisible: true,
            skipLinks: true
        };
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.announcementContainer = null;
        this.focusTrapStack = [];
        // Event listeners
        this.eventListeners = new Map();
        this.initialize();
    }
    static getInstance() {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }
    /**
     * Configure accessibility features
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        this.applyConfiguration();
    }
    /**
     * Initialize accessibility features
     */
    initialize() {
        this.createAnnouncementContainer();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupMediaQueryListeners();
        this.setupSkipLinks();
    }
    /**
     * Create announcement container for screen readers
     */
    createAnnouncementContainer() {
        if (typeof document === 'undefined')
            return;
        this.announcementContainer = document.createElement('div');
        this.announcementContainer.setAttribute('aria-live', 'polite');
        this.announcementContainer.setAttribute('aria-atomic', 'true');
        this.announcementContainer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
        document.body.appendChild(this.announcementContainer);
    }
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.config.enableKeyboardNavigation)
            return;
        const handleKeyDown = (event) => {
            // Skip if user is typing in an input
            if (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement) {
                return;
            }
            switch (event.key) {
                case 'Tab':
                    this.handleTabNavigation(event);
                    break;
                case 'Escape':
                    this.handleEscapeKey(event);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivationKey(event);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowKeys(event);
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        this.eventListeners.set('keydown', () => {
            document.removeEventListener('keydown', handleKeyDown);
        });
    }
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        if (!this.config.enableFocusManagement)
            return;
        const handleFocusIn = (event) => {
            const target = event.target;
            this.updateFocusRing(target);
            this.announceFocus(target);
        };
        const handleFocusOut = (event) => {
            const target = event.target;
            this.removeFocusRing(target);
        };
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
        this.eventListeners.set('focusin', () => {
            document.removeEventListener('focusin', handleFocusIn);
        });
        this.eventListeners.set('focusout', () => {
            document.removeEventListener('focusout', handleFocusOut);
        });
    }
    /**
     * Setup media query listeners
     */
    setupMediaQueryListeners() {
        if (typeof window === 'undefined')
            return;
        // High contrast mode
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        const handleHighContrastChange = (e) => {
            this.config.enableHighContrast = e.matches;
            this.applyHighContrastMode();
        };
        highContrastQuery.addEventListener('change', handleHighContrastChange);
        this.config.enableHighContrast = highContrastQuery.matches;
        // Reduced motion
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleReducedMotionChange = (e) => {
            this.config.enableReducedMotion = e.matches;
            this.applyReducedMotionMode();
        };
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
        this.config.enableReducedMotion = reducedMotionQuery.matches;
        this.eventListeners.set('highContrast', () => {
            highContrastQuery.removeEventListener('change', handleHighContrastChange);
        });
        this.eventListeners.set('reducedMotion', () => {
            reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        });
    }
    /**
     * Setup skip links
     */
    setupSkipLinks() {
        if (!this.config.skipLinks)
            return;
        const skipLinks = document.querySelectorAll('[data-skip-link]');
        skipLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                if (targetId) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.focus();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
    /**
     * Handle Tab navigation
     */
    handleTabNavigation(event) {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0)
            return;
        event.preventDefault();
        if (event.shiftKey) {
            // Shift + Tab: Move backward
            this.currentFocusIndex = this.currentFocusIndex <= 0
                ? focusableElements.length - 1
                : this.currentFocusIndex - 1;
        }
        else {
            // Tab: Move forward
            this.currentFocusIndex = this.currentFocusIndex >= focusableElements.length - 1
                ? 0
                : this.currentFocusIndex + 1;
        }
        const targetElement = focusableElements[this.currentFocusIndex];
        if (targetElement) {
            targetElement.focus();
        }
    }
    /**
     * Handle Escape key
     */
    handleEscapeKey(event) {
        // Close any open modals, dropdowns, etc.
        const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
        modals.forEach(modal => {
            const closeButton = modal.querySelector('[data-close-button]');
            if (closeButton) {
                closeButton.click();
            }
        });
    }
    /**
     * Handle activation keys (Enter, Space)
     */
    handleActivationKey(event) {
        const target = event.target;
        // Check if element is focusable and has click handler
        if (target.getAttribute('tabindex') !== null ||
            target.tagName === 'BUTTON' ||
            target.tagName === 'A') {
            event.preventDefault();
            target.click();
        }
    }
    /**
     * Handle arrow key navigation
     */
    handleArrowKeys(event) {
        const target = event.target;
        const role = target.getAttribute('role');
        // Only handle arrow keys for specific roles
        if (!['menuitem', 'tab', 'option', 'gridcell'].includes(role || '')) {
            return;
        }
        event.preventDefault();
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(target);
        if (currentIndex === -1)
            return;
        let nextIndex = currentIndex;
        switch (event.key) {
            case 'ArrowUp':
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
                break;
            case 'ArrowLeft':
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
                break;
        }
        if (nextIndex !== currentIndex) {
            focusableElements[nextIndex].focus();
        }
    }
    /**
     * Get all focusable elements
     */
    getFocusableElements() {
        const selector = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="menuitem"]',
            '[role="tab"]',
            '[role="option"]'
        ].join(', ');
        return Array.from(document.querySelectorAll(selector));
    }
    /**
     * Update focus ring visibility
     */
    updateFocusRing(element) {
        if (!this.config.focusRingVisible)
            return;
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';
    }
    /**
     * Remove focus ring
     */
    removeFocusRing(element) {
        element.style.outline = '';
        element.style.outlineOffset = '';
    }
    /**
     * Announce focus change to screen readers
     */
    announceFocus(element) {
        if (!this.config.announceChanges || !this.announcementContainer)
            return;
        const label = element.getAttribute('aria-label') ||
            element.textContent?.trim() ||
            element.getAttribute('alt') ||
            'Focusable element';
        this.announce({
            message: `Focused on ${label}`,
            priority: 'polite'
        });
    }
    /**
     * Announce message to screen readers
     */
    announce(announcement) {
        if (!this.announcementContainer)
            return;
        this.announcementContainer.setAttribute('aria-live', announcement.priority);
        this.announcementContainer.textContent = announcement.message;
        if (announcement.timeout) {
            setTimeout(() => {
                if (this.announcementContainer) {
                    this.announcementContainer.textContent = '';
                }
            }, announcement.timeout);
        }
    }
    /**
     * Apply high contrast mode
     */
    applyHighContrastMode() {
        const root = document.documentElement;
        if (this.config.enableHighContrast) {
            root.classList.add('high-contrast');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--background-color', '#000000');
            root.style.setProperty('--border-color', '#ffffff');
        }
        else {
            root.classList.remove('high-contrast');
            root.style.removeProperty('--text-color');
            root.style.removeProperty('--background-color');
            root.style.removeProperty('--border-color');
        }
    }
    /**
     * Apply reduced motion mode
     */
    applyReducedMotionMode() {
        const root = document.documentElement;
        if (this.config.enableReducedMotion) {
            root.classList.add('reduced-motion');
            root.style.setProperty('--animation-duration', '0.01ms');
            root.style.setProperty('--transition-duration', '0.01ms');
        }
        else {
            root.classList.remove('reduced-motion');
            root.style.removeProperty('--animation-duration');
            root.style.removeProperty('--transition-duration');
        }
    }
    /**
     * Apply configuration
     */
    applyConfiguration() {
        this.applyHighContrastMode();
        this.applyReducedMotionMode();
    }
    /**
     * Set focus trap
     */
    setFocusTrap(container) {
        this.focusTrapStack.push(container);
        const focusableElements = container.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    /**
     * Remove focus trap
     */
    removeFocusTrap() {
        this.focusTrapStack.pop();
    }
    /**
     * Make element accessible
     */
    makeAccessible(element, options = {}) {
        if (options.role) {
            element.setAttribute('role', options.role);
        }
        if (options.label) {
            element.setAttribute('aria-label', options.label);
        }
        if (options.description) {
            element.setAttribute('aria-describedby', options.description);
        }
        if (options.tabIndex !== undefined) {
            element.setAttribute('tabindex', options.tabIndex.toString());
        }
        if (options.expanded !== undefined) {
            element.setAttribute('aria-expanded', options.expanded.toString());
        }
        if (options.selected !== undefined) {
            element.setAttribute('aria-selected', options.selected.toString());
        }
        if (options.checked !== undefined) {
            element.setAttribute('aria-checked', options.checked.toString());
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.eventListeners.forEach(cleanup => cleanup());
        this.eventListeners.clear();
        if (this.announcementContainer) {
            this.announcementContainer.remove();
            this.announcementContainer = null;
        }
        this.focusableElements = [];
        this.focusTrapStack = [];
    }
}
// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();
// React hook for easy integration
export const useAccessibility = () => {
    const manager = accessibilityManager;
    return {
        announce: manager.announce.bind(manager),
        makeAccessible: manager.makeAccessible.bind(manager),
        setFocusTrap: manager.setFocusTrap.bind(manager),
        removeFocusTrap: manager.removeFocusTrap.bind(manager),
        configure: manager.configure.bind(manager)
    };
};
export default AccessibilityManager;
