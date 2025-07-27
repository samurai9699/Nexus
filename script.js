// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Global array to store all particle meshes for animation
let particleMeshes = [];

// Reusable function to create particle backgrounds
function createParticleBackground(canvasId, particleCount = 800, rotationSpeedX = 0.001, rotationSpeedY = 0.001, mouseInteraction = true) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: false, // Disabled for better performance
        powerPreference: "high-performance"
    });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    // Create particles with optimized geometry
    const particlesGeometry = new THREE.BufferGeometry();
    
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15; // Reduced spread for better performance
        colorArray[i] = Math.random() * 0.5 + 0.5; // Brighter particles
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Optimized material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending // Better visual effect with less performance cost
    });
    
    // Create points system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 5;
    
    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    
    if (mouseInteraction) {
        // Mouse movement effect (only for hero section)
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }
    
    // Store mesh data for global animation
    const meshData = {
        mesh: particlesMesh,
        rotationSpeedX: rotationSpeedX,
        rotationSpeedY: rotationSpeedY,
        mouseInteraction: mouseInteraction,
        renderer: renderer,
        scene: scene,
        camera: camera,
        canvas: canvas
    };
    
    particleMeshes.push(meshData);
    
    // Handle window resize for this specific canvas
    const handleResize = () => {
        const rect = canvas.getBoundingClientRect();
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return meshData;
}

// Global animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Get current mouse position
    let mouseX = 0;
    let mouseY = 0;
    
    // Animate all particle meshes
    particleMeshes.forEach((meshData) => {
        const { mesh, rotationSpeedX, rotationSpeedY, mouseInteraction, renderer, scene, camera } = meshData;
        
        // Basic rotation
        mesh.rotation.x += rotationSpeedX;
        mesh.rotation.y += rotationSpeedY;
        
        // Mouse interaction (only for meshes that have it enabled)
        if (mouseInteraction) {
            // Get mouse position relative to window
            const rect = meshData.canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate mouse influence
            mouseX = (window.mouseX || 0) * 0.0003;
            mouseY = (window.mouseY || 0) * 0.0003;
            
            mesh.rotation.y += mouseX;
            mesh.rotation.x += mouseY;
        }
        
        // Render this scene
        renderer.render(scene, camera);
    });
}

// Store global mouse position
document.addEventListener('mousemove', (event) => {
    window.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    window.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Initialize all particle backgrounds
function initAllBackgrounds() {
    // Hero section - most particles with mouse interaction
    createParticleBackground('hero-canvas', 1000, 0.001, 0.001, true);
    
    // About section - medium particles, slower rotation
    createParticleBackground('about-canvas', 600, 0.0005, 0.0008, false);
    
    // Projects section - fewer particles, different rotation
    createParticleBackground('projects-canvas', 400, 0.0008, 0.0005, false);
    
    // Start the global animation loop
    animate();
}

// Initialize when page loads
window.addEventListener('load', initAllBackgrounds);

// Form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
});