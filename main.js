async function initParticles() {
  await tsParticles.load("tsparticles", {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#00cc00"
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.3,
        random: false,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "out"
        }
      }
    },
    background: {
      color: "#ffffff",
      opacity: 0
    }
  });
}

document.addEventListener("DOMContentLoaded", initParticles);