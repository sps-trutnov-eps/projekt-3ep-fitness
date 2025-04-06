console.log('Script loaded!');

/**
 * Messaging system for handling notifications
 */
const MessageSystem = {
  // Types of messages with their styling
  types: {
    success: { icon: '✓', color: '#4CAF50', background: '#E8F5E9' },
    error: { icon: '✕', color: '#F44336', background: '#FFEBEE' },
    info: { icon: 'ℹ', color: '#2196F3', background: '#E3F2FD' },
    warning: { icon: '⚠', color: '#FF9800', background: '#FFF3E0' }
  },

  // Show a notification message
  show: function(message, type = 'info', duration = 5000) {
    const typeConfig = this.types[type] || this.types.info;
    
    // Create or get container
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        maxWidth: '90%'
      });
      document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    Object.assign(notification.style, {
      padding: '12px 16px',
      marginBottom: '10px',
      backgroundColor: typeConfig.background,
      color: typeConfig.color,
      borderLeft: `4px solid ${typeConfig.color}`,
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      opacity: '0',
      transform: 'translateX(20px)',
      maxWidth: '300px',
      wordBreak: 'break-word'
    });
    
    // Add icon
    const icon = document.createElement('span');
    icon.textContent = typeConfig.icon;
    Object.assign(icon.style, {
      marginRight: '12px',
      fontSize: '20px',
      fontWeight: 'bold'
    });
    
    // Add message
    const text = document.createElement('span');
    text.textContent = message;
    Object.assign(text.style, {
      flex: '1'
    });
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: typeConfig.color,
      marginLeft: '8px'
    });
    
    closeBtn.onclick = () => this.dismiss(notification);
    
    // Assemble notification
    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(closeBtn);
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification);
      }, duration);
    }
    
    return notification;
  },
  
  // Dismiss a notification
  dismiss: function(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  },
  
  // Handle ajax form submissions
  handleForm: function(form, options = {}) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      
      try {
        const formData = new FormData(form);
        
        // For file uploads, use FormData directly
        // For regular forms, use URLSearchParams
        const body = form.enctype === 'multipart/form-data' ? 
          formData : 
          new URLSearchParams(formData);
        
        const headers = form.enctype !== 'multipart/form-data' ? 
          { 'Content-Type': 'application/x-www-form-urlencoded' } : 
          {};
        
        // Let fetch follow redirects naturally
        const response = await fetch(form.action, {
          method: form.method,
          body: body,
          headers: headers
        });
        
        // First check if response is ok (status 200-299)
        if (!response.ok) {
          // Try to parse as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            if (result.message) {
              this.show(result.message, 'error');
            } else {
              this.show('Form submission failed', 'error');
            }
          } else {
            this.show('Server error: ' + response.status, 'error');
          }
          return;
        }
        
        // Handle based on content type
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // It's JSON - just display the message, don't reload
          const result = await response.json();
          
          if (!result.success) {
            this.show(result.message || 'Error occurred', 'error');
          } else {
            this.show(result.message || 'Success', 'success');
            
            // Reset form if option is true
            if (options.resetForm) {
              form.reset();
            }
          }
        } else {
          // It's HTML or a redirect we've already followed
          // Check if we were redirected
          if (response.redirected) {
            // Go to the redirect URL
            window.location.href = response.url;
          } else {
            // For HTML responses (like direct page renders)
            // This would be unusual in an AJAX context, but handle it anyway
            console.log('Received HTML response');
            // You could parse and handle the HTML here if needed
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.show('Error: ' + error.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
};