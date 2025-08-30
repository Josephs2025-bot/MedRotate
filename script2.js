// MedRotate - Clinical Notes Application
document.addEventListener('DOMContentLoaded', function() {
    // State management
    const state = {
        currentUser: null,
        rotations: [],
        currentRotation: null,
        notes: [],
        offlineMode: false,
        syncQueue: []
    };

    // DOM Elements
    const elements = {
        loginBtn: document.querySelector('.btn-primary'),
        signupBtn: document.querySelector('.btn-outline'),
        rotationsList: document.querySelector('.rotations-list'),
        currentRotation: document.querySelector('.current-rotation'),
        notesGrid: document.querySelector('.notes-grid'),
        addNoteBtn: document.querySelector('.add-note-btn'),
        noteModal: document.getElementById('note-modal'),
        rotationModal: document.getElementById('rotation-modal'),
        offlineStatus: document.querySelector('.offline-status')
    };

    // Initialize the application
    function init() {
        checkAuthStatus();
        loadRotations();
        setupEventListeners();
        updateDateDisplay();
        checkOnlineStatus();
        
        // Simulate initial load from server
        simulateInitialSync();
    }

    // Check if user is authenticated
    function checkAuthStatus() {
        const user = localStorage.getItem('medrotate_user');
        if (user) {
            state.currentUser = JSON.parse(user);
            updateUIForAuthenticated();
        } else {
            updateUIForUnauthenticated();
        }
    }

    // Load rotations from local storage
    function loadRotations() {
        const storedRotations = localStorage.getItem('medrotate_rotations');
        if (storedRotations) {
            state.rotations = JSON.parse(storedRotations);
            renderRotations();
            
            // Set the first rotation as active if none is set
            if (state.rotations.length > 0 && !state.currentRotation) {
                setActiveRotation(state.rotations[0].id);
            }
        } else {
            // Create default rotations if none exist
            createDefaultRotations();
        }
    }

    // Create default rotations for new users
    function createDefaultRotations() {
        const defaultRotations = [
            { id: generateId(), name: 'Cardiology', icon: 'heart-pulse' },
            { id: generateId(), name: 'Neurology', icon: 'brain' },
            { id: generateId(), name: 'Pediatrics', icon: 'baby' },
            { id: generateId(), name: 'Surgery', icon: 'scalpel' },
            { id: generateId(), name: 'Emergency Medicine', icon: 'truck-medical' }
        ];
        
        state.rotations = defaultRotations;
        localStorage.setItem('medrotate_rotations', JSON.stringify(state.rotations));
        renderRotations();
        setActiveRotation(defaultRotations[0].id);
    }

    // Set active rotation and load its notes
    function setActiveRotation(rotationId) {
        state.currentRotation = state.rotations.find(r => r.id === rotationId);
        elements.currentRotation.textContent = `${state.currentRotation.name} Rotation`;
        
        // Update active class in UI
        document.querySelectorAll('.rotation-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === rotationId) {
                item.classList.add('active');
            }
        });
        
        loadNotes();
    }

    // Load notes for current rotation
    function loadNotes() {
        if (!state.currentRotation) return;
        
        const allNotes = JSON.parse(localStorage.getItem('medrotate_notes') || '[]');
        state.notes = allNotes.filter(note => note.rotationId === state.currentRotation.id);
        renderNotes();
    }

    // Render rotations in the sidebar
    function renderRotations() {
        elements.rotationsList.innerHTML = '';
        
        state.rotations.forEach(rotation => {
            const rotationEl = document.createElement('div');
            rotationEl.className = `rotation-item ${rotation.id === state.currentRotation?.id ? 'active' : ''}`;
            rotationEl.dataset.id = rotation.id;
            rotationEl.innerHTML = `
                <i class="fas fa-${rotation.icon}"></i>
                <span>${rotation.name}</span>
            `;
            
            rotationEl.addEventListener('click', () => setActiveRotation(rotation.id));
            elements.rotationsList.appendChild(rotationEl);
        });
    }

    // Render notes in the main content area
    function renderNotes() {
        elements.notesGrid.innerHTML = '';
        
        if (state.notes.length === 0) {
            elements.notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No notes yet</h3>
                    <p>Create your first note to get started</p>
                </div>
            `;
            return;
        }
        
        // Sort notes by date (newest first)
        const sortedNotes = [...state.notes].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        sortedNotes.forEach(note => {
            const noteDate = new Date(note.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const noteEl = document.createElement('article');
            noteEl.className = 'note-card';
            noteEl.innerHTML = `
                <div class="note-date">${noteDate}</div>
                <h3 class="note-title">${note.title}</h3>
                <div class="note-content">${formatNoteContent(note.content)}</div>
                <div class="note-actions">
                    <button class="icon-btn edit-note" data-id="${note.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-note" data-id="${note.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            elements.notesGrid.appendChild(noteEl);
        });
        
        // Add event listeners to note action buttons
        document.querySelectorAll('.edit-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.currentTarget.dataset.id;
                editNote(noteId);
            });
        });
        
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.currentTarget.dataset.id;
                deleteNote(noteId);
            });
        });
    }

    // Format note content with paragraphs
    function formatNoteContent(content) {
        return content.split('\n').map(paragraph => {
            return paragraph.trim() ? `<p>${paragraph}</p>` : '';
        }).join('');
    }

    // Create a new note
    function createNote(title, content) {
        const newNote = {
            id: generateId(),
            rotationId: state.currentRotation.id,
            title: title,
            content: content,
            date: new Date().toISOString(),
            synced: !state.offlineMode
        };
        
        // Add to state
        state.notes.push(newNote);
        
        // Update local storage
        const allNotes = JSON.parse(localStorage.getItem('medrotate_notes') || '[]');
        allNotes.push(newNote);
        localStorage.setItem('medrotate_notes', JSON.stringify(allNotes));
        
        // Add to sync queue if offline
        if (state.offlineMode) {
            state.syncQueue.push({
                type: 'create',
                data: newNote
            });
            localStorage.setItem('medrotate_sync_queue', JSON.stringify(state.syncQueue));
        }
        
        // Re-render notes
        renderNotes();
        
        // Simulate sync to server
        if (!state.offlineMode) {
            simulateSync('create', newNote);
        }
        
        return newNote;
    }

    // Edit an existing note
    function editNote(noteId) {
        const note = state.notes.find(n => n.id === noteId);
        if (!note) return;
        
        // Open modal with note data
        openNoteModal(note);
    }

    // Update an existing note
    function updateNote(noteId, title, content) {
        const noteIndex = state.notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) return;
        
        // Update note
        state.notes[noteIndex] = {
            ...state.notes[noteIndex],
            title: title,
            content: content,
            date: new Date().toISOString(),
            synced: !state.offlineMode
        };
        
        // Update local storage
        const allNotes = JSON.parse(localStorage.getItem('medrotate_notes') || '[]');
        const allNoteIndex = allNotes.findIndex(n => n.id === noteId);
        if (allNoteIndex !== -1) {
            allNotes[allNoteIndex] = state.notes[noteIndex];
            localStorage.setItem('medrotate_notes', JSON.stringify(allNotes));
        }
        
        // Add to sync queue if offline
        if (state.offlineMode) {
            state.syncQueue.push({
                type: 'update',
                data: state.notes[noteIndex]
            });
            localStorage.setItem('medrotate_sync_queue', JSON.stringify(state.syncQueue));
        }
        
        // Re-render notes
        renderNotes();
        
        // Simulate sync to server
        if (!state.offlineMode) {
            simulateSync('update', state.notes[noteIndex]);
        }
    }

    // Delete a note
    function deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        // Remove from state
        state.notes = state.notes.filter(n => n.id !== noteId);
        
        // Update local storage
        const allNotes = JSON.parse(localStorage.getItem('medrotate_notes') || '[]');
        const updatedNotes = allNotes.filter(n => n.id !== noteId);
        localStorage.setItem('medrotate_notes', JSON.stringify(updatedNotes));
        
        // Add to sync queue if offline
        if (state.offlineMode) {
            state.syncQueue.push({
                type: 'delete',
                data: { id: noteId }
            });
            localStorage.setItem('medrotate_sync_queue', JSON.stringify(state.syncQueue));
        }
        
        // Re-render notes
        renderNotes();
        
        // Simulate sync to server
        if (!state.offlineMode) {
            simulateSync('delete', { id: noteId });
        }
    }

    // Create a new rotation
    function createRotation(name, icon) {
        const newRotation = {
            id: generateId(),
            name: name,
            icon: icon,
            synced: !state.offlineMode
        };
        
        // Add to state
        state.rotations.push(newRotation);
        
        // Update local storage
        localStorage.setItem('medrotate_rotations', JSON.stringify(state.rotations));
        
        // Add to sync queue if offline
        if (state.offlineMode) {
            state.syncQueue.push({
                type: 'create_rotation',
                data: newRotation
            });
            localStorage.setItem('medrotate_sync_queue', JSON.stringify(state.syncQueue));
        }
        
        // Re-render rotations
        renderRotations();
        
        // Set as active
        setActiveRotation(newRotation.id);
        
        // Simulate sync to server
        if (!state.offlineMode) {
            simulateSync('create_rotation', newRotation);
        }
        
        return newRotation;
    }

    // Open note modal for creating/editing
    function openNoteModal(note = null) {
        const modal = elements.noteModal;
        const titleInput = modal.querySelector('#note-title');
        const contentInput = modal.querySelector('#note-content');
        const submitBtn = modal.querySelector('.btn-primary');
        
        if (note) {
            // Editing existing note
            modal.dataset.mode = 'edit';
            modal.dataset.noteId = note.id;
            titleInput.value = note.title;
            contentInput.value = note.content;
            submitBtn.textContent = 'Update Note';
        } else {
            // Creating new note
            modal.dataset.mode = 'create';
            titleInput.value = '';
            contentInput.value = '';
            submitBtn.textContent = 'Save Note';
        }
        
        // Show modal
        modal.classList.add('active');
    }

    // Open rotation modal for creating new rotation
    function openRotationModal() {
        const modal = elements.rotationModal;
        const nameInput = modal.querySelector('#rotation-name');
        const iconSelect = modal.querySelector('#rotation-icon');
        
        // Reset form
        nameInput.value = '';
        iconSelect.value = 'heart';
        
        // Show modal
        modal.classList.add('active');
    }

    // Close modal
    function closeModal(modal) {
        modal.classList.remove('active');
    }

    // Update UI for authenticated user
    function updateUIForAuthenticated() {
        if (elements.loginBtn) elements.loginBtn.textContent = 'Logout';
        if (elements.signupBtn) elements.signupBtn.style.display = 'none';
        
        // Show all app functionality
        document.querySelectorAll('.user-only').forEach(el => {
            el.style.display = 'block';
        });
    }

    // Update UI for unauthenticated user
    function updateUIForUnauthenticated() {
        if (elements.loginBtn) elements.loginBtn.textContent = 'Login';
        if (elements.signupBtn) elements.signupBtn.style.display = 'block';
        
        // Hide app functionality
        document.querySelectorAll('.user-only').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show login prompt
        elements.notesGrid.innerHTML = `
            <div class="auth-prompt">
                <i class="fas fa-user-lock"></i>
                <h3>Please log in to access your notes</h3>
                <p>Use the login button in the top right corner to get started</p>
            </div>
        `;
    }

    // Handle login
    function handleLogin() {
        if (state.currentUser) {
            // Logout
            localStorage.removeItem('medrotate_user');
            state.currentUser = null;
            updateUIForUnauthenticated();
        } else {
            // Simulate login - in a real app, this would show a login form
            const email = prompt('Enter your email:');
            if (email) {
                const user = { email: email, name: email.split('@')[0] };
                state.currentUser = user;
                localStorage.setItem('medrotate_user', JSON.stringify(user));
                updateUIForAuthenticated();
                loadRotations();
            }
        }
    }

    // Handle signup
    function handleSignup() {
        // Simulate signup - in a real app, this would show a signup form
        const email = prompt('Enter your email for registration:');
        if (email) {
            const user = { email: email, name: email.split('@')[0] };
            state.currentUser = user;
            localStorage.setItem('medrotate_user', JSON.stringify(user));
            updateUIForAuthenticated();
            loadRotations();
            alert('Account created successfully!');
        }
    }

    // Update date display
    function updateDateDisplay() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            dateElement.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Check online status
    function checkOnlineStatus() {
        state.offlineMode = !navigator.onLine;
        
        if (state.offlineMode) {
            elements.offlineStatus.style.display = 'flex';
        } else {
            elements.offlineStatus.style.display = 'none';
            
            // Try to sync if coming back online
            if (state.syncQueue.length > 0) {
                processSyncQueue();
            }
        }
    }

    // Process sync queue when coming back online
    function processSyncQueue() {
        // Simulate syncing each item in the queue
        state.syncQueue.forEach(item => {
            simulateSync(item.type, item.data);
        });
        
        // Clear sync queue
        state.syncQueue = [];
        localStorage.removeItem('medrotate_sync_queue');
        
        // Update synced status for all notes and rotations
        const allNotes = JSON.parse(localStorage.getItem('medrotate_notes') || '[]');
        allNotes.forEach(note => {
            note.synced = true;
        });
        localStorage.setItem('medrotate_notes', JSON.stringify(allNotes));
        
        state.rotations.forEach(rotation => {
            rotation.synced = true;
        });
        localStorage.setItem('medrotate_rotations', JSON.stringify(state.rotations));
    }

    // Simulate sync to server
    function simulateSync(action, data) {
        console.log(`Syncing ${action} operation:`, data);
        
        // In a real app, this would be an API call
        setTimeout(() => {
            console.log(`Sync completed for ${action} operation`);
        }, 1000);
    }

    // Simulate initial sync from server
    function simulateInitialSync() {
        if (!state.currentUser) return;
        
        console.log('Simulating initial sync from server...');
        
        // In a real app, this would fetch data from a server
        setTimeout(() => {
            console.log('Initial sync completed');
        }, 1500);
    }

    // Generate a unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Set up event listeners
    function setupEventListeners() {
        // Auth buttons
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', handleLogin);
        }
        
        if (elements.signupBtn) {
            elements.signupBtn.addEventListener('click', handleSignup);
        }
        
        // Add note button
        if (elements.addNoteBtn) {
            elements.addNoteBtn.addEventListener('click', () => openNoteModal());
        }
        
        // Add rotation button
        const addRotationBtn = document.getElementById('add-rotation');
        if (addRotationBtn) {
            addRotationBtn.addEventListener('click', openRotationModal);
        }
        
        // Note modal
        const noteModal = elements.noteModal;
        if (noteModal) {
            const noteForm = noteModal.querySelector('form') || noteModal;
            const cancelBtn = noteModal.querySelector('.btn-outline');
            const closeBtn = noteModal.querySelector('.close-btn');
            
            noteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const titleInput = noteModal.querySelector('#note-title');
                const contentInput = noteModal.querySelector('#note-content');
                
                if (noteModal.dataset.mode === 'edit') {
                    updateNote(
                        noteModal.dataset.noteId,
                        titleInput.value,
                        contentInput.value
                    );
                } else {
                    createNote(
                        titleInput.value,
                        contentInput.value
                    );
                }
                
                closeModal(noteModal);
            });
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => closeModal(noteModal));
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(noteModal));
            }
        }
        
        // Rotation modal
        const rotationModal = elements.rotationModal;
        if (rotationModal) {
            const rotationForm = rotationModal.querySelector('form') || rotationModal;
            const cancelBtn = rotationModal.querySelector('.btn-outline');
            const closeBtn = rotationModal.querySelector('.close-btn');
            
            rotationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const nameInput = rotationModal.querySelector('#rotation-name');
                const iconSelect = rotationModal.querySelector('#rotation-icon');
                
                createRotation(
                    nameInput.value,
                    iconSelect.value
                );
                
                closeModal(rotationModal);
            });
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => closeModal(rotationModal));
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(rotationModal));
            }
        }
        
        // Online/offline detection
        window.addEventListener('online', checkOnlineStatus);
        window.addEventListener('offline', checkOnlineStatus);
    }

    // Initialize the app
    init();
});