import { loadModules } from "esri-loader";
// import * as THREE from "three";
const THREE = window.THREE;
// import ParticleEngine from "./ParticleEngine";
// import { Examples } from "./ParticleEngine";

// const particleVertexShader = [
//   "attribute vec3  customColor;",
//   "attribute float customOpacity;",
//   "attribute float customSize;",
//   "attribute float customAngle;",
//   "attribute float customVisible;", // float used as boolean (0 = false, 1 = true)
//   "varying vec4  vColor;",
//   "varying float vAngle;",
//   "void main()",
//   "{",
//   "if ( customVisible > 0.5 )", // true
//   "vColor = vec4( customColor, customOpacity );", //     set color associated to vertex; use later in fragment shader.
//   "else", // false
//   "vColor = vec4(0.0, 0.0, 0.0, 0.0);", //     make particle invisible.

//   "vAngle = customAngle;",

//   "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
//   "gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );", // scale particles as objects in 3D space
//   "gl_Position = projectionMatrix * mvPosition;",
//   "}"
// ].join("\n");

// const particleFragmentShader = [
//   "uniform sampler2D texture;",
//   "varying vec4 vColor;",
//   "varying float vAngle;",
//   "void main()",
//   "{",
//   "gl_FragColor = vColor;",

//   "float c = cos(vAngle);",
//   "float s = sin(vAngle);",
//   "vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,",
//   "c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);", // rotate UV coordinates to rotate texture
//   "vec4 rotatedTexture = texture2D( texture,  rotatedUV );",
//   "gl_FragColor = gl_FragColor * rotatedTexture;", // sets an otherwise white particle texture to desired color
//   "}"
// ].join("\n");

const randomVector3 = function(base, spread) {
  var rand3 = new THREE.Vector3(Math.random(), Math.random(), Math.random());
  return new THREE.Vector3().addVectors(
    base,
    new THREE.Vector3().multiplyVectors(spread, rand3)
  );
};

class Partical {
  position;
  age = 0;
  maxAge = 10;
  constructor({ x, y, z, scale }) {
    this.position = new THREE.Vector3(x, y, z);
    this.initPosition = new THREE.Vector3(x, y, z);
    this.scale = scale;
    this.velocity = randomVector3(
      new THREE.Vector3(0, 0, -8000),
      new THREE.Vector3(200, 200, -32000)
    );
    this.maxAge = Math.random() * 10;
  }
  update(dt) {
    this.position.add(this.velocity.clone().multiplyScalar(dt));

    this.age += dt;
    if (this.age > this.maxAge) {
      this.alive = false;
      this.age = 0;
    }
  }
}

export async function getParticalRenderer() {
  const [externalRenderers] = await loadModules([
    "esri/views/3d/externalRenderers"
  ]);
  return class CustomRenderer {
    constructor({ view }) {
      this.view = view;
      this.animations = [];
      this.particles = [];
      this.clock = new THREE.Clock();
    }

    setup(context) {
      this.initializeRenderer(context);
      this.initializeCamera(context);
      this.initializeScene(context);
    }
    render(context) {
      this.updateCamera(context);
      this.updateLights(context);
      this.updateParticles(context);
      this.renderer.resetGLState();
      this.renderer.render(this.scene, this.camera);
      context.resetWebGLState();
      if (this.animations.length) {
        externalRenderers.requestRender(this.view);
      }
    }
    updateParticles() {
      const dt = this.clock.getDelta();

      this.store.forEach(v => {
        // const mesh = v.mesh;
        const scale = v.scale;

        // mesh.translateZ(2000 / 2);
        const particles = v.particles;
        const particlesGeometry = v.particlesGeometry;
        const recycleIndices = [];
        particles.forEach((vv, index) => {
          vv.update(dt);
          if (!vv.alive) {
            recycleIndices.push(index);
          }
        });
        v.particlesGeometry.verticesNeedUpdate = true;
        const size = scale / 100;

        for (var j = 0; j < recycleIndices.length; j++) {
          let i = recycleIndices[j];

          var pX = Math.random() * size * 10,
            pY = Math.random() * size * 10,
            pZ = Math.random() * size;

          particles[i] = new Partical({
            x: pX,
            y: pY,
            z: pZ,
            scale: scale
          });
          particles[i].alive = true; // activate right away
          particlesGeometry.vertices[i] = particles[i].position;
        }
      });
    }
    store = [];
    add(point, scale = 8170300) {
      console.log(point);
      const size = scale / 100;
      //   const geometry = new THREE.BoxBufferGeometry(size, size, size);
      //   const material = new THREE.MeshPhongMaterial({ color: "#00f" });
      var particleCount = 1000,
        particles = [],
        particlesGeometry = new THREE.Geometry();
      var pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xffffff,
        size: 2000
      });

      pMaterial = new THREE.ShaderMaterial({
        uniforms: {
          texture: {
            type: "t",
            value: THREE.ImageUtils.loadTexture("images/snowflake.png")
          }
        },
        vertexShader: document.getElementById("vertexshader").textContent,
        fragmentShader: document.getElementById("fragmentshader").textContent,
        transparent: false,
        alphaTest: 0.5, // if having transparency issues, try including: alphaTest: 0.5,
        blending: THREE.AdditiveBlending,
        depthTest: true
      });

      // now create the individual particles
      for (var p = 0; p < particleCount; p++) {
        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * size * 10,
          pY = Math.random() * size * 10,
          pZ = Math.random() * size;

        const particle = new Partical({
          x: pX,
          y: pY,
          z: pZ,
          scale: scale
        });
        particles.push(particle);
        // add it to the geometry
        particlesGeometry.vertices.push(particle.position);
        // this.particles.push(particle);
      }

      this.pMaterial = pMaterial;
      particlesGeometry.dynamic = true;
      // create the particle system
      var mesh = new THREE.Points(particlesGeometry, pMaterial);

      //   const mesh = new THREE.Mesh(geometry, material);
      this.applyTransformAt(mesh, point);
      this.store.push({
        point,
        mesh,
        particles,
        particlesGeometry,
        scale: scale
      });
      this.scene.add(mesh);

      externalRenderers.requestRender(this.view);
      //   log.timeout("Added object");
    }
    initializeRenderer(context) {
      this.renderer = new THREE.WebGLRenderer({
        context: context.gl,
        premultipliedAlpha: false
      });
      // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
      this.renderer.autoClearDepth = false;
      this.renderer.autoClearStencil = false;
      this.renderer.autoClearColor = false;
      // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
      // We have to inject this bit of code into the three.js runtime in order for it to bind those
      // buffers instead of the default ones.
      const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
        this.renderer
      );
      this.renderer.setRenderTarget = target => {
        originalSetRenderTarget(target);
        if (target == null) {
          context.bindRenderTarget();
        }
      };
    }
    initializeCamera(context) {
      const camera = context.camera;
      this.camera = new THREE.PerspectiveCamera(
        camera.fovY,
        camera.aspect,
        camera.near,
        camera.far
      );
    }
    initializeScene() {
      this.scene = new THREE.Scene();
      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(this.ambientLight);
      this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      this.scene.add(this.directionalLight);
    }
    applyTransformAt(object, location) {
      const transform = new THREE.Matrix4();
      externalRenderers.renderCoordinateTransformAt(
        this.view,
        [location.x, location.y, location.z],
        location.spatialReference,
        transform.elements
      );
      transform.decompose(object.position, object.quaternion, object.scale);
    }
    updateCamera(context) {
      const camera = context.camera;
      this.renderer.setViewport(0, 0, this.view.width, this.view.height);
      this.camera.position.set(camera.eye[0], camera.eye[1], camera.eye[2]);
      this.camera.up.set(camera.up[0], camera.up[1], camera.up[2]);
      this.camera.lookAt(
        new THREE.Vector3(camera.center[0], camera.center[1], camera.center[2])
      );
      this.camera.projectionMatrix.fromArray(camera.projectionMatrix);
    }
    updateLights(context) {
      const { direction, diffuse, ambient } = context.sunLight;
      this.directionalLight.position.set(
        direction[0],
        direction[1],
        direction[2]
      );
      this.directionalLight.intensity = diffuse.intensity;
      this.directionalLight.color = new THREE.Color(
        diffuse.color[0],
        diffuse.color[1],
        diffuse.color[2]
      );
      this.ambientLight.intensity = ambient.intensity;
      this.ambientLight.color = new THREE.Color(
        ambient.color[0],
        ambient.color[1],
        ambient.color[2]
      );
    }
  };
}
