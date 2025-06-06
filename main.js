import { tsParticles } from "tsparticles-engine";
import { loadFull } from "tsparticles";

const particlesOptions = {
    background: {
        color: {
            value: '#000000'
        },
    },
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: 'repulse'
            },
        },
        modes: {
            repulse: {
                distance: 150,
                duration: 0.4,
                factor: 100,
                speed: 1,
                maxSpeed: 50,
                easing: 'ease-out-quad',
            },
        },
    },
    particles: {
        color: {
            value: '#90ee90'
        },
        links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
        },
        move: {
            direction: 'none',
            enable: true,
            outModes: {
                default: 'out',
            },
            random: true,
            speed: 1,
            straight: false,
        },
        number: {
            density: {
                enable: true,
            },
            value: 100,
        },
        opacity: {
            value: {
                min: 0.1,
                max: 0.5,
            },
            animation: {
                enable: true,
                speed: 1,
                sync: false,
            },
        },
        shape: {
            type: 'circle',
        },
        size: {
            value: {
                min: 1,
                max: 3,
            },
        },
    },
    detectRetina: true,
};

async function setupParticles() {
    await loadFull(tsParticles);

    await tsParticles.load({
        id: "particles-container",
        options: particlesOptions,
    });
}

setupParticles();

