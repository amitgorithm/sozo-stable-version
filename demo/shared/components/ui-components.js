/**
 * SHARED UI COMPONENTS
 * Reusable components for all modules
 */

export function createCard(title, content, className = '') {
  return `
    <div class="card ${className}">
      ${title ? `<h3>${title}</h3>` : ''}
      ${content}
    </div>
  `;
}

export function createButton(text, className = 'btn', onClick = null) {
  const id = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  setTimeout(() => {
    if (onClick) {
      document.getElementById(id)?.addEventListener('click', onClick);
    }
  }, 0);
  
  return `<button id="${id}" class="${className}">${text}</button>`;
}

export function createForm(fields, onSubmit = null) {
  const formId = `form_${Date.now()}`;
  
  const formHTML = `
    <form id="${formId}" class="form-grid">
      ${fields.map(field => createFormField(field)).join('')}
      ${onSubmit ? `<button type="submit" class="btn btn-primary">Submit</button>` : ''}
    </form>
  `;
  
  if (onSubmit) {
    setTimeout(() => {
      document.getElementById(formId)?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSubmit(Object.fromEntries(formData));
      });
    }, 0);
  }
  
  return formHTML;
}

export function createFormField(field) {
  const { type, label, name, placeholder, required, options } = field;
  
  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
      return `
        <div class="form-group">
          <label>${label}${required ? ' *' : ''}</label>
          <input type="${type}" name="${name}" placeholder="${placeholder || ''}" ${required ? 'required' : ''}>
        </div>
      `;
    
    case 'select':
      return `
        <div class="form-group">
          <label>${label}${required ? ' *' : ''}</label>
          <select name="${name}" ${required ? 'required' : ''}>
            ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>
      `;
    
    case 'textarea':
      return `
        <div class="form-group">
          <label>${label}${required ? ' *' : ''}</label>
          <textarea name="${name}" placeholder="${placeholder || ''}" ${required ? 'required' : ''}></textarea>
        </div>
      `;
    
    case 'checkbox':
      return `
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="${name}" ${required ? 'required' : ''}>
            ${label}${required ? ' *' : ''}
          </label>
        </div>
      `;
    
    default:
      return '';
  }
}

export function createStatusBadge(status, text = null) {
  const statusMap = {
    success: { icon: '✓', class: 'success' },
    warning: { icon: '⚠', class: 'warning' },
    error: { icon: '✗', class: 'error' },
    pending: { icon: '○', class: 'pending' },
    info: { icon: 'ℹ', class: 'info' }
  };
  
  const config = statusMap[status] || statusMap.info;
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);
  
  return `<span class="status-badge ${config.class}">${config.icon} ${displayText}</span>`;
}

export function createProgressBar(current, total, showText = true) {
  const percentage = Math.round((current / total) * 100);
  
  return `
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      ${showText ? `<div class="progress-text">${current}/${total} (${percentage}%)</div>` : ''}
    </div>
  `;
}

export function createModal(title, content, actions = []) {
  const modalId = `modal_${Date.now()}`;
  
  return `
    <div id="${modalId}" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${actions.length > 0 ? `
          <div class="modal-footer">
            ${actions.map(action => `<button class="${action.class || 'btn'}" onclick="${action.onClick}">${action.text}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}