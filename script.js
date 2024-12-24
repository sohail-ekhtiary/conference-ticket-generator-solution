document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ticketForm');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('avatar');
    const previewImage = document.getElementById('previewImage');
    const uploadDefault = document.querySelector('.upload-default');
    const uploadPreview = document.querySelector('.upload-preview');
    const removeImageBtn = document.querySelector('.remove-image');
    const changeImageBtn = document.querySelector('.change-image');
    const liveRegion = document.getElementById('liveRegion');
    const ticket = document.getElementById('ticket');

    // Generate random ticket number
    const ticketNumber = '#' + Math.floor(Math.random() * 90000 + 10000);

    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // Handle click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target.closest('.preview-actions')) return;
        fileInput.click();
    });

    // Handle keyboard interaction
    uploadArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Handle remove and change image
    removeImageBtn.addEventListener('click', () => {
        resetUploadArea();
    });

    changeImageBtn.addEventListener('click', () => {
        fileInput.click();
    });

    function handleFile(file) {
        if (!file) return;

        // Reset error state
        uploadArea.classList.remove('error');
        const errorElement = uploadArea.parentElement.querySelector('.error-message');
        errorElement.textContent = '';

        if (!file.type.match('image/(jpeg|png)')) {
            showError(uploadArea, 'Please upload a JPG or PNG image');
            announceToScreenReader('Please upload a JPG or PNG image');
            return;
        }

        if (file.size > 500 * 1024) {
            showError(uploadArea, 'File size must be less than 500KB');
            announceToScreenReader('File size must be less than 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            uploadDefault.style.display = 'none';
            uploadPreview.style.display = 'flex';
            uploadArea.classList.add('has-image');
            announceToScreenReader('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
    }

    function resetUploadArea() {
        fileInput.value = '';
        uploadDefault.style.display = 'block';
        uploadPreview.style.display = 'none';
        uploadArea.classList.remove('has-image');
        const errorElement = uploadArea.parentElement.querySelector('.error-message');
        errorElement.textContent = '';
    }

    function showError(element, message) {
        const errorElement = element.parentElement.querySelector('.error-message');
        errorElement.textContent = message;
        announceToScreenReader(message);
    }

    // Form validation
    const validateField = (input) => {
        const value = input.value.trim();
        const errorElement = input.parentElement.querySelector('.error-message');

        if (!value) {
            errorElement.textContent = 'This field is required';
            return false;
        }

        if (input.type === 'email' && !isValidEmail(value)) {
            errorElement.textContent = 'Please enter a valid email address';
            return false;
        }

        if (input.id === 'github' && !isValidGithub(value)) {
            errorElement.textContent = 'Please enter a valid GitHub username';
            return false;
        }

        errorElement.textContent = '';
        return true;
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidGithub = (username) => {
        return /^@?[a-zA-Z0-9-]+$/.test(username);
    };

    function generateTicket(formData) {
        const ticketHtml = `
            <div id="ticket" class="ticket">
                <div class="ticket-header">
                    <h2>Congrats, ${formData.fullName}!</h2>
                    <p>Your ticket is ready.</p>
                    <p>We've emailed your ticket to ${formData.email} and will send updates in the run up to the event.</p>
                </div>
                
                <div class="ticket-card">
                    <div class="ticket-logo">
                        <img src="assets/images/logo-full.svg" alt="Coding Conf Logo">
                    </div>
                    
                    <div>Jan 31, 2025 / Austin, TX</div>
                    
                    <div class="ticket-info">
                        <div class="ticket-user">
                            <img src="${formData.avatar}" class="ticket-avatar" alt="User Avatar">
                            <div>
                                <div>${formData.fullName}</div>
                                <div class="ticket-username">@${formData.github.replace('@', '')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ticket-number">#${ticketNumber}</div>
                </div>
            </div>
        `;

        // Remove existing ticket if any
        const existingTicket = document.getElementById('ticket');
        if (existingTicket) {
            existingTicket.remove();
        }

        // Add new ticket after the form
        form.insertAdjacentHTML('afterend', ticketHtml);

        // Animate ticket entrance
        const ticket = document.getElementById('ticket');
        ticket.style.opacity = '0';
        ticket.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
            ticket.style.transition = 'all 0.5s ease-out';
            ticket.style.opacity = '1';
            ticket.style.transform = 'translateY(0)';
        });

        announceToScreenReader('Your ticket has been generated successfully');
    }

    // Announce messages to screen reader
    function announceToScreenReader(message) {
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;

        // Validate all required fields
        form.querySelectorAll('input[required]').forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        // Validate avatar upload
        if (!previewImage.src) {
            showError(uploadArea, 'Please upload an avatar');
            announceToScreenReader('Please upload an avatar');
            isValid = false;
        }

        if (!isValid) {
            announceToScreenReader('Please correct the errors in the form');
            return;
        }

        // Collect form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            github: document.getElementById('github').value.trim(),
            avatar: previewImage.src
        };

        // Generate ticket
        generateTicket(formData);

        // Scroll ticket into view
        const ticket = document.getElementById('ticket');
        if (ticket) {
            ticket.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Hide form and show ticket
        form.style.display = 'none';
        ticket.style.display = 'block';
    });

    // Live validation
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.required) {
                validateField(input);
            }
        });
    });
});