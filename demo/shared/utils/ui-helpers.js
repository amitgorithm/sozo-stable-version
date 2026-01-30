/**
 * UI HELPER UTILITIES
 * Common utility functions for UI operations
 */

export function createNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after duration
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, duration);
  
  // Manual close
  notification.querySelector('.notification-close').onclick = () => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  };
  
  return notification;
}

export function showModal(title, content, actions = []) {
  // Remove existing modals
  document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
  
  const modalId = `modal_${Date.now()}`;
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${actions.length > 0 ? `
        <div class="modal-footer">
          ${actions.map(action => `<button class="${action.class || 'btn'}" data-action="${action.id || ''}">${action.text}</button>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  // Close handlers
  const closeModal = () => {
    modal.classList.add('fade-out');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  // Action handlers
  actions.forEach(action => {
    if (action.onClick) {
      modal.querySelector(`[data-action="${action.id}"]`)?.addEventListener('click', (e) => {
        action.onClick(e);
        if (action.closeOnClick !== false) closeModal();
      });
    }
  });
  
  document.body.appendChild(modal);
  return modal;
}

export function confirmDialog(message, onConfirm, onCancel = null) {
  return showModal('Confirm Action', `<p>${message}</p>`, [
    {
      id: 'cancel',
      text: 'Cancel',
      class: 'btn btn-ghost',
      onClick: onCancel || (() => {})
    },
    {
      id: 'confirm',
      text: 'Confirm',
      class: 'btn btn-primary',
      onClick: onConfirm
    }
  ]);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function validateForm(formElement) {
  const errors = [];
  const formData = new FormData(formElement);
  
  // Get all form controls
  const controls = formElement.querySelectorAll('input, select, textarea');
  
  controls.forEach(control => {
    if (control.required && !control.value.trim()) {
      errors.push(`${control.name || control.id} is required`);
    }
    
    // Email validation
    if (control.type === 'email' && control.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(control.value)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    // Phone validation
    if (control.type === 'tel' && control.value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(control.value.replace(/[-\s\(\)]/g, ''))) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    // Number validation
    if (control.type === 'number' && control.value) {
      const min = parseInt(control.min);
      const max = parseInt(control.max);
      const value = parseInt(control.value);
      
      if (!isNaN(min) && value < min) {
        errors.push(`${control.name || control.id} must be at least ${min}`);
      }
      if (!isNaN(max) && value > max) {
        errors.push(`${control.name || control.id} must be at most ${max}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    data: Object.fromEntries(formData)
  };
}

export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}