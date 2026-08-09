// Global State
console.log('Zephyr main.js evaluating... readyState:', document.readyState);
let dbState = {
  maintenance: false,
  announcement: { active: false, text: '' },
  team: {},
  password: 'admin00', // Default fallback
  loadingText: 'We Levlled Up.',
  customConfig: null,
  themeAccent: 'lime',
  activityLogs: [],
  leads: [],
  analytics: {
    visitors: 1248,
    pageviews: 4892,
    weeklyData: [420, 580, 490, 680, 810, 740, 930]
  }
};

// Safe Storage Helpers to prevent SecurityExceptions in sandbox/private browsing environments
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key, val) => {
    try { localStorage.setItem(key, val); } catch (e) {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

const safeSessionStorage = {
  getItem: (key) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key, val) => {
    try { sessionStorage.setItem(key, val); } catch (e) {}
  },
  removeItem: (key) => {
    try { sessionStorage.removeItem(key); } catch (e) {}
  }
};

function initAll() {
  console.log('initAll executing...');
  // Apply saved theme accent color immediately
  applyThemeAccent(safeStorage.getItem('zephyr_accent') || 'lime');

  // Real-time Patna Studio Clock
  initPatnaClock();

  // Floating Top Pill-Nav Sliding Indicator & Mobile Burger Drawer
  initTopPillNav();

  // Scroll Reveal Observer
  initScrollReveal();

  // Budget Planner Slide Indicator
  initBudgetSlider();

  // Contact Form Submission & Genie Success modal
  initContactForm();

  // FAQ Accordion Collapse/Expand
  initFAQAccordion();

  // Interactive AI Sandbox Terminal Toggles
  initAISandbox();

  // Custom Devreon Interactive Features
  initDevreonBackdrop();

  // Initialize Firebase Proxy & Control Center
  initFirebaseProxy();

  // Bottom Tech Stack Announcement Ticker
  initTechTicker();

  // Interactive Mock Chatbot
  initChatbot();

  // Theme Switcher (Light/Dark Toggle)
  initThemeToggle();

  // Live Website Preview Modal
  initLivePreviewModal();

  // Email Privacy Protection (Obfuscation)
  initEmailObfuscation();

  // Initialize WebGL shader background
  initCanvasBackground();

  // Initialize Interactive 3D Card Tilt
  init3DTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}


/* =========================================================================
   1. Interactive Live Canvas Background & GPU Spotlight Glow
   ========================================================================= */
function initCanvasBackground() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.error('WebGL1 not supported in this browser.');
    return;
  }

  // Vertex Shader Source
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader Source
  const fsSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
// Seven packed vectors + eight colour vectors = 15 fragment uniform vectors,
// one below WebGL1's guaranteed minimum. Macros preserve the public u_* API.
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
// Keep hash inputs inside mediump's guaranteed ±2^14 range.
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even, un-structured white noise for film grain (Dave Hoskins hash12). The
// multiply hash above is fine for value noise but shows a faint axis-aligned
// mesh at integer fragment coords, which reads as a net over flat areas.
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// --- OKLab colour mixing (perceptual), gated by u_oklab -----------------------
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a
  // channel negative, and pow(negative, …) is NaN which mix()/step() would
  // then propagate. The linear branch clips such channels to 0 downstream.
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids
// dynamic uniform indexing in fragment shaders, hence the constant loop.
vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec3 acc = u_colors[0] * 0.15;
  float total = 0.15;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_colorCount) break;
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.21 + fi * 0.071) + fi * 2.4 + u_seed),
      cos(t * (0.17 + fi * 0.093) + fi * 1.7)) * (0.45 + u_intensity * 0.35);
    float w = exp(-dot(p - c, p - c) * 6.0);
    acc += u_colors[i] * w;
    total += w;
  }
  return acc / total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  // Cursor modes 1–3 are local distortions. Push shifts the same screen-space
  // coordinates before field transforms, so Zoom/Rotate don't change its feel.
  if (u_cursorPresence > 0.001) {
    // u_mouse is normalized to -1..1 in canvas space. Convert it to the same
    // aspect-corrected screen space as p so effects stay under the cursor.
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)
      / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else {
      float cursorDistance = length(cursorDelta);
      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
      cursorMask = u_cursorPresence
        * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
      if (u_cursorEffect < 1.5) {
        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
      } else if (u_cursorEffect < 2.5) {
        float cursorAngle = cursorMask * u_cursorStrength * 2.2;
        float cc = cos(cursorAngle), cs = sin(cursorAngle);
        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
      } else if (u_cursorEffect < 3.5) {
        float ripple = sin(
          cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
      }
    }
  }

  // Keep presets that read uv (rather than p) in the same warped space.
  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  // Field transform: rotate, pan, pointer push, slow drift.
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  // Organic domain warp.
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  // Shade, with an optional soft 5-tap blur.
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  // Post: contrast, saturation, hue, brightness, vignette, grain.
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
  `;

  // Create & compile shaders, link program
  function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Set up fullscreen triangle
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -1.0, -1.0,
     3.0, -1.0,
    -1.0,  3.0
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uColorsLoc = gl.getUniformLocation(program, 'u_colors');
  const uSceneLoc = gl.getUniformLocation(program, 'u_scene');
  const uShapeLoc = gl.getUniformLocation(program, 'u_shape');
  const uSurfaceLoc = gl.getUniformLocation(program, 'u_surface');
  const uFinishLoc = gl.getUniformLocation(program, 'u_finish');
  const uTransformLoc = gl.getUniformLocation(program, 'u_transform');
  const uSpaceLoc = gl.getUniformLocation(program, 'u_space');
  const uCursorLoc = gl.getUniformLocation(program, 'u_cursor');

  // Colors mapping (low -> high, exact colors)
  const colorData = new Float32Array([
    0.012, 0.071, 0.055,  // #03120E
    0.055, 0.486, 0.353,  // #0E7C5A
    0.486, 0.898, 0.467,  // #7CE577
    0.957, 1.000, 0.780,  // #F4FFC7
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0
  ]);

  // Pointer tracking
  let pointerX = 0;
  let pointerY = 0;
  
  function updatePointer(e) {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  
  window.addEventListener('mousemove', updatePointer);
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0]);
    }
  });

  // Handle Resize
  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  window.addEventListener('resize', handleResize);
  handleResize();

  // Animation Loop variables
  let animationId = null;
  const startTime = performance.now();

  function render(now) {
    if (document.hidden) return;

    const seconds = (now - startTime) * 0.001;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Feed uniforms
    gl.uniform3fv(uColorsLoc, colorData);
    gl.uniform4f(uSceneLoc, canvas.width, canvas.height, seconds * 0.73, 4.0);
    gl.uniform4f(uShapeLoc, 1.16, 0.34, 0.50, 0.00);
    gl.uniform4f(uSurfaceLoc, 2.40, 1.16, 0.00, 1.00);
    gl.uniform4f(uFinishLoc, 0.00, 0.00, 0.00, 0.09);
    gl.uniform4f(uTransformLoc, 1453.0, 0.00, 0.00, 0.0);
    gl.uniform4f(uSpaceLoc, 0.00, 0.00, pointerX, pointerY);
    gl.uniform4f(uCursorLoc, 0.0, 2.0, 0.65, 0.46); // Cursor off (presence 0.0)

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    animationId = requestAnimationFrame(render);
  }

  // Start loop
  animationId = requestAnimationFrame(render);

  // Tab hidden pause handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!animationId) {
        animationId = requestAnimationFrame(render);
      }
    }
  });

  // Track optional flashlight transform position in CSS
  const glow = document.getElementById('flashlight-glow');
  window.addEventListener('mousemove', (e) => {
    if (glow) {
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate3d(-50%, -50%, 0)`;
    }
  });
}

/* =========================================================================
   2. Floating Top Pill-Nav Sliding Indicator & Drawer Menu
   ========================================================================= */
function initTopPillNav() {
  const navContainer = document.querySelector('.nav-links-container');
  const indicator = document.querySelector('.nav-indicator');
  const navLinks = document.querySelectorAll('.nav-link-item');
  const burger = document.getElementById('nav-burger-btn');
  const drawer = document.getElementById('mobile-drawer-menu');
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');

  // Mobile Hamburger Toggle — Always registered first
  if (burger && drawer) {
    burger.onclick = (e) => {
      e.stopPropagation();
      burger.classList.toggle('open');
      drawer.classList.toggle('open');
    };
  }

  if (!navContainer || !indicator) return;

  // Function to move active bubble position
  function updateIndicator(activeLink) {
    indicator.style.width = `${activeLink.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  }

  // Set initial position matching active page route
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  let activeFound = false;

  navLinks.forEach((link) => {
    const pageAttr = link.getAttribute('onclick');
    const match = pageAttr ? pageAttr.match(/'([^']+)'/) : null;
    const page = match ? match[1] : '';
    if (currentPath === page) {
      link.classList.add('active');
      updateIndicator(link);
      activeFound = true;
    } else {
      link.classList.remove('active');
    }
  });

  drawerLinks.forEach((link) => {
    const pageAttr = link.getAttribute('onclick');
    const match = pageAttr ? pageAttr.match(/'([^']+)'/) : null;
    const page = match ? match[1] : '';
    if (currentPath === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Default to home link if page is not matches
  if (!activeFound && navLinks.length > 0) {
    navLinks[0].classList.add('active');
    updateIndicator(navLinks[0]);
  }

  // Recalculate indicators on resize
  window.addEventListener('resize', () => {
    const activeLink = navContainer.querySelector('.nav-link-item.active');
    if (activeLink) {
      updateIndicator(activeLink);
    }
  });
}

/* =========================================================================
   3. Scroll Reveal Transition Observer
   ========================================================================= */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .bento-reveal');
  
  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach(el => el.classList.add('active'));
    return;
  }
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => {
    el.classList.remove('active');
    observer.observe(el);
  });

  const navWrapper = document.querySelector('.nav-pill-wrapper');
  if (navWrapper) {
    navWrapper.classList.add('active');
  }
}

/* =========================================================================
   4. Budget Range Slider Indicator (INR)
   ========================================================================= */
function initBudgetSlider() {
  const planCards = document.querySelectorAll('.plan-selector-card');
  const addonCards = document.querySelectorAll('.addon-card');
  const totalValueEl = document.getElementById('estimated-total-value');
  if (planCards.length === 0) return;

  const basePrices = {
    starter: 1999,
    pro: 2999,
    enterprise: 4999
  };

  function calculateTotal() {
    let total = 0;
    const activePlan = document.querySelector('.plan-selector-card.active');
    if (activePlan) {
      const planVal = activePlan.dataset.plan;
      total += basePrices[planVal] || 1999;
    }

    addonCards.forEach(card => {
      const checkbox = card.querySelector('.addon-checkbox');
      if (checkbox && checkbox.checked) {
        total += parseInt(card.dataset.price) || 0;
      }
    });

    if (totalValueEl) {
      totalValueEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    }
  }

  planCards.forEach(card => {
    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      calculateTotal();
    });
  });

  addonCards.forEach(card => {
    card.addEventListener('click', () => {
      const checkbox = card.querySelector('.addon-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        card.classList.toggle('active', checkbox.checked);
        calculateTotal();
      }
    });
  });

  calculateTotal();
}

/* =========================================================================
   5. Contact Form Submission & Formspree (xojovjda)
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-project-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const company = document.getElementById('contact-company').value;
    const phone = document.getElementById('contact-phone').value;
    const desc = document.getElementById('project-desc').value;
    
    const activeCard = document.querySelector('.plan-selector-card.active');
    const planText = activeCard ? `${activeCard.querySelector('.plan-name').textContent.trim()} (${activeCard.querySelector('.plan-price').textContent.trim()})` : 'Starter (₹1,999/yr)';

    const selectedAddons = [];
    document.querySelectorAll('input[name="addons"]:checked').forEach(cb => {
      const addonCard = cb.closest('.addon-card');
      if (addonCard) {
        selectedAddons.push(addonCard.querySelector('.addon-name').textContent.trim());
      }
    });

    const totalValueEl = document.getElementById('estimated-total-value');
    const totalText = totalValueEl ? totalValueEl.textContent : '₹1,999';

    // Display loading state on submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending Brief... <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: loader-spin 1s linear infinite; margin-left: 6px;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;

    // Create payload
    const payload = {
      name: name,
      email: email,
      phone: phone,
      company: company || 'N/A',
      selectedPlan: planText,
      addonsSelected: selectedAddons.join(', ') || 'None',
      estimatedTotal: totalText,
      description: desc
    };

    // Submits directly to your verified Formspree inbox (xojovjda)
    fetch('https://formspree.io/f/xojovjda', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      
      if (response.ok) {
        saveLeadLocally(payload);
        showGenieModal('success-modal', `
          <div class="success-container">
            <div class="success-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>Project Brief Delivered!</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
              Thanks, <strong>${name}</strong>. Your project brief has been sent to our founders. We will review details and reach out shortly!
            </p>
            <button class="btn btn-primary" onclick="closeGenieModal('success-modal')">Close</button>
          </div>
        `);
        form.reset();
        
        // Reset addon cards UI
        document.querySelectorAll('.addon-card').forEach(card => {
          const cb = card.querySelector('.addon-checkbox');
          if (cb) cb.checked = false;
          card.classList.remove('active');
        });
        
        // Reset plan selector to default (Starter)
        const defaultCard = document.querySelector('.plan-selector-card[data-plan="starter"]');
        if (defaultCard) defaultCard.click();
      } else {
        throw new Error('Formspree response not ok');
      }
    })
    .catch(error => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      
      saveLeadLocally(payload);

      // Fallback: trigger local client prefilled templates
      const subject = encodeURIComponent(`Project Brief - ${company || name}`);
      const bodyText = encodeURIComponent(
        `Hi ZephyrDevs,\n\n` +
        `My name is ${name}.\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Company: ${company || 'N/A'}\n` +
        `Plan Selected: ${planText}\n` +
        `Add-ons Selected: ${selectedAddons.join(', ') || 'None'}\n` +
        `Estimated Total: ${totalText}\n\n` +
        `Project Description:\n${desc}`
      );
      window.location.href = `mailto:zephyrdevsofficial@gmail.com?subject=${subject}&body=${bodyText}`;

      showGenieModal('success-modal', `
        <div class="success-container">
          <div class="success-icon-circle" style="border-color: #ffbd2e; background: rgba(255, 189, 46, 0.1); color: #ffbd2e; box-shadow: 0 0 15px rgba(255, 189, 46, 0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><path d="m22 9-9.3 5.4a2 2 0 0 1-2.2 0L2 9"></path></svg>
          </div>
          <h3>Email Client Opened</h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">
            We prefilled your project details. Please click **Send** inside your email client to deliver the brief directly to **zephyrdevsofficial@gmail.com**!
          </p>
          <button class="btn btn-primary" onclick="closeGenieModal('success-modal')">Close</button>
        </div>
      `);
    });
  });
}

function saveLeadLocally(leadData) {
  if (!dbState.leads) dbState.leads = [];
  
  const newLead = {
    id: 'lead_' + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0],
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company: leadData.company,
    plan: leadData.selectedPlan,
    budget: leadData.estimatedTotal,
    addons: leadData.addonsSelected,
    description: leadData.description,
    status: 'New'
  };

  dbState.leads.unshift(newLead); // Add new inquiries at the top
  safeStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  
  // Try sync with Firebase if ready
  firebaseCall('saveLead', newLead).catch(err => console.warn('Firebase saveLead error: ', err));
}

/* =========================================================================
   6. FAQ Accordion Collapse/Expand
   ========================================================================= */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

/* =========================================================================
   7. Interactive AI Sandbox Terminal
   ========================================================================= */
function initAISandbox() {
  const tabBtns = document.querySelectorAll('.sandbox-tab-btn');
  const actionBtns = document.querySelectorAll('.sandbox-action-btn');
  const consoleOutput = document.getElementById('sandbox-output-text');
  const loader = document.getElementById('sandbox-loader-element');

  if (!consoleOutput || !loader) return;

  let activeAI = 'gemini'; // default

  let activeTypingTimeout = null;

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeAI = btn.dataset.ai;
      
      // Clear console and show welcome text
      consoleOutput.innerHTML = `<span style="color: var(--text-muted);">// System ready. Choose an action below to query ${activeAI === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}...</span>`;
    });
  });

  const sandboxDatabase = {
    gemini: {
      analyze: `[Google Gemini 1.5 Pro API]
> Analysis Result: Page components successfully loaded.
> Core Speed Index: 99.8% (FCP: 0.62s)
> Structure check: Fully semantic tags utilized. No missing alt tags.
> SEO rating: 100/100. Google bots indexed successfully.`,
      backend: `[Google Gemini 1.5 Pro API]
> Schema check: Firebase Firestore collections resolved.
> Connection State: Connected to Node.js backend.
> Secure Auth: Token verification set to HS256 active.
> Recommendation: Firebase storage cache is optimized for 24h.`,
      prompt: `[Google Gemini 1.5 Pro API]
> Prompt generated: "Contextual system parsing for developer queries."
> Token cost: 18 tokens.
> Response: System connected. Ready to index incoming query details.`,
      tuning: `[Google Gemini 1.5 Pro API]
> Tuning State: Prompt temperature set to 0.4 (low variance).
> Safety settings: Block rate parameters set to strict.
> Model size: Gemini 1.5 Flash activated for quick responses.`
    },
    claude: {
      analyze: `[Anthropic Claude 3.5 Sonnet API]
> Code Analysis: Found connection loop in main.js.
> Optimizing connectable[]: Connected nodes restricted to foreground.
> Performance update: Connection loops complexity reduced by 60%.
> Render speed: Framerate optimized to stable 60fps compositor layers.`,
      backend: `[Anthropic Claude 3.5 Sonnet API]
> Logic audit: Form inputs serialized successfully.
> Forwarding check: Connected to Formspree xojovjda endpoint.
> Security rules: Firebase Firestore rules configured. Write allowed only on valid emails.`,
      prompt: `[Anthropic Claude 3.5 Sonnet API]
> Prompt template: "Act as ZephyrDevs AI Agent. Draft project scope response."
> Input token count: 145 tokens.
> Execution output: Project request processed. Lead forwarded to founders.`,
      tuning: `[Anthropic Claude 3.5 Sonnet API]
> System instructions: Strict technical context output enabled.
> Response speed: Claude 3.5 Haiku activated.
> Token budget: Setup complete with standard rate limit configurations.`
    }
  };

  function typeConsoleOutput(responseText) {
    if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
    consoleOutput.innerHTML = '';

    const lines = responseText.split('\n');
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLineElement = null;

    const cursor = document.createElement('span');
    cursor.className = 'console-cursor';
    cursor.innerHTML = '&#9608;'; // Block cursor

    function typeNextChar() {
      if (currentLineIndex >= lines.length) {
        cursor.remove();
        return;
      }

      const lineText = lines[currentLineIndex];

      if (currentCharIndex === 0) {
        currentLineElement = document.createElement('div');
        currentLineElement.className = 'console-line';
        
        if (lineText.startsWith('[')) {
          currentLineElement.style.color = 'var(--neon-violet)';
        } else if (lineText.startsWith('>')) {
          currentLineElement.style.color = 'var(--neon-green)';
        } else {
          currentLineElement.style.color = 'var(--text-primary)';
        }

        consoleOutput.appendChild(currentLineElement);
        currentLineElement.appendChild(cursor);
      }

      if (currentCharIndex < lineText.length) {
        const char = lineText[currentCharIndex];
        const textNode = document.createTextNode(char);
        currentLineElement.insertBefore(textNode, cursor);
        currentCharIndex++;
        activeTypingTimeout = setTimeout(typeNextChar, 10);
      } else {
        currentCharIndex = 0;
        currentLineIndex++;
        activeTypingTimeout = setTimeout(typeNextChar, 60);
      }
    }

    typeNextChar();
  }

  // Action clicks
  actionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      
      if (activeTypingTimeout) clearTimeout(activeTypingTimeout);
      consoleOutput.innerHTML = '';
      loader.style.display = 'flex';

      setTimeout(() => {
        loader.style.display = 'none';
        const responseText = sandboxDatabase[activeAI][action];
        typeConsoleOutput(responseText);
      }, 600);
    });
  });
}

/* =========================================================================
   8. Genie-Style Modal Helper Controls & Navigation
   ========================================================================= */
window.showGenieModal = function (modalId, contentHTML) {
  let overlay = document.getElementById(modalId);
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box glass-panel">
        <div class="modal-close-btn" onclick="closeGenieModal('${modalId}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        <div class="modal-body-content"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const modalBox = overlay.querySelector('.modal-box');
  const bodyContent = overlay.querySelector('.modal-body-content');
  if (contentHTML) bodyContent.innerHTML = contentHTML;

  overlay.classList.add('active');

  modalBox.classList.remove('genie-close-transition');
  modalBox.classList.add('genie-open-transition');
};

window.closeGenieModal = function (modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;

  const modalBox = overlay.querySelector('.modal-box');

  modalBox.classList.remove('genie-open-transition');
  modalBox.classList.add('genie-close-transition');

  setTimeout(() => {
    overlay.classList.remove('active');
  }, 480);
};

window.navigateTo = function (page) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.25s ease';
  
  // Close mobile drawer if open
  const burger = document.getElementById('nav-burger-btn');
  const drawer = document.getElementById('mobile-drawer-menu');
  if (burger && drawer) {
    burger.classList.remove('open');
    drawer.classList.remove('open');
  }

  setTimeout(() => {
    window.location.href = page;
  }, 250);
};

// Handle route pre-fills & cinematic intro gate
function handlePageLoad() {
  console.log('handlePageLoad executing... gate:', !!document.getElementById('intro-gate'), 'taglineEl:', !!document.getElementById('intro-tagline'));
  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get('plan');
  if (selectedPlan) {
    const planName = (selectedPlan === 'free') ? 'starter' : selectedPlan;
    const descTextarea = document.getElementById('project-desc');
    if (descTextarea) {
      descTextarea.value = `I am interested in starting a project using the [${planName.toUpperCase()} Plan]. `;
    }
    const targetPlanCard = document.querySelector(`.plan-selector-card[data-plan="${planName}"]`);
    if (targetPlanCard) {
      targetPlanCard.click();
    }
  }
  
  // --- Cinematic Intro Gate ---
  const gate = document.getElementById('intro-gate');
  const taglineEl = document.getElementById('intro-tagline');
  const progressFill = document.getElementById('intro-progress');
  const counterVal = document.getElementById('intro-counter-val');

  if (gate) {
    if (gate.classList.contains('fast-loader')) {
      // Super fast curtain split transition for other pages
      setTimeout(() => {
        gate.classList.add('lifted');
        document.body.classList.remove('loading-active');
        setTimeout(() => {
          gate.classList.add('done');
        }, 1000);
      }, 150);
    } else if (taglineEl) {
      // Full cinematic loader (only on homepage)
      // Build char-by-char tagline: "redesigned for speed"
      const words = [
        { text: 'redesigned', accent: false },
        { text: ' ', accent: false },
        { text: 'for', accent: false },
        { text: ' ', accent: false },
        { text: 'speed', accent: true }
      ];

      let charIndex = 0;
      words.forEach(word => {
        if (word.text === ' ') {
          taglineEl.appendChild(document.createTextNode('\u00A0'));
          return;
        }
        const wordSpan = document.createElement('span');
        if (word.accent) wordSpan.classList.add('intro-accent');

        word.text.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.classList.add('intro-char');
          charSpan.textContent = char;
          charSpan.style.animationDelay = `${0.15 + charIndex * 0.035}s`;
          wordSpan.appendChild(charSpan);
          charIndex++;
        });

        taglineEl.appendChild(wordSpan);
      });

      // Animate progress bar & 0-100% counter fast (0.8s completion)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 25 + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
        }
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (counterVal) {
          counterVal.textContent = String(Math.round(progress)).padStart(3, '0');
        }
      }, 50);

      // Lift the curtain after 800ms
      setTimeout(() => {
        clearInterval(progressInterval);
        if (progressFill) progressFill.style.width = '100%';
        if (counterVal) counterVal.textContent = '100';
        
        setTimeout(() => {
          gate.classList.add('lifted');
          document.body.classList.remove('loading-active');

          setTimeout(() => {
            gate.classList.add('done');
          }, 600);
        }, 150);
      }, 850);
    } else {
      document.body.classList.remove('loading-active');
    }
  } else {
    document.body.classList.remove('loading-active');
  }
  
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.25s ease';
}

if (document.readyState !== 'loading') {
  handlePageLoad();
} else {
  document.addEventListener('DOMContentLoaded', handlePageLoad);
}


/* =========================================================================
   9. Custom Devreon Interactive Features
   ========================================================================= */
function initDevreonBackdrop() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  // Disable custom cursor and tracking on mobile devices (prevents lag and touch delays)
  if (window.innerWidth < 768) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  // Mouse interactive grid spotlight position
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
  });

  // Custom cursor movement
  if (dot && ring) {
    window.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      
      ring.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }, { duration: 150, fill: "forwards" });
    });

    const hoverables = document.querySelectorAll('a, button, input, textarea, select, .nav-link-item, .faq-question-btn, [onclick], .btn, .social-link');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        ring.classList.add('hot');
      });
      item.addEventListener('mouseleave', () => {
        ring.classList.remove('hot');
      });
    });
  }
}

/* =========================================================================
   10. Firebase Administration & Maintenance Mode
   ========================================================================= */

let firebaseCallbacks = {};

// Helper to make async calls to our Firebase iframe proxy
window.firebaseCall = function (action, data) {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).substring(2);
    firebaseCallbacks[id] = { resolve, reject };
    
    const iframe = document.getElementById('firebase-api-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ id, action, data }, '*');
    } else {
      resolve(null);
    }
  });
};

// Initialize the Firebase hidden iframe
window.initFirebaseProxy = function () {
  if (document.getElementById('firebase-api-iframe')) return;

  const iframe = document.createElement('iframe');
  iframe.id = 'firebase-api-iframe';
  iframe.src = 'api.html';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Setup message receiver for responses and real-time updates
  window.addEventListener('message', (e) => {
    const { id, result, error, type, key, val, config } = e.data || {};

    // 1. Handle firebase ready message
    if (type === 'firebaseReady') {
      window.activeFirebaseConfig = config;
      initializeDefaultDataIfEmpty();
      return;
    }

    // 2. Handle async call callbacks
    if (id && firebaseCallbacks[id]) {
      if (error) {
        firebaseCallbacks[id].reject(new Error(error));
      } else {
        firebaseCallbacks[id].resolve(result);
      }
      delete firebaseCallbacks[id];
      return;
    }

    // 3. Handle real-time DB updates
    if (type === 'dbUpdate') {
      dbState[key] = val;
      
      if (key === 'maintenance') {
        handleMaintenanceUpdate(val);
      } else if (key === 'announcement') {
        handleAnnouncementUpdate(val);
      } else if (key === 'team') {
        handleTeamUpdate(val);
        renderAdminTeamList();
      } else if (key === 'testimonials') {
        handleTestimonialsUpdate(val);
        renderAdminApprovedTestimonials();
      } else if (key === 'pendingTestimonials') {
        renderAdminPendingTestimonials();
      } else if (key === 'themeAccent') {
        applyThemeAccent(val);
      } else if (key === 'activityLogs') {
        renderActivityLogs(val);
      } else if (key === 'loadingText') {
        handleLoadingTextUpdate(val);
      } else if (key === 'customConfig') {
        // If Firebase active config is not ready yet, ignore initial load updates
        if (!window.activeFirebaseConfig) {
          return;
        }

        const active = window.activeFirebaseConfig;
        const newConfig = val;

        const normalizeUrl = (url) => {
          if (!url) return '';
          return url.replace(/\/+$/, '').toLowerCase();
        };

        const activeUrl = normalizeUrl(active ? active.databaseURL : '');
        const newUrl = normalizeUrl(newConfig ? newConfig.databaseURL : '');
        const activeApiKey = active ? active.apiKey : '';
        const newApiKey = newConfig ? newConfig.apiKey : '';

        // 1. If we have a new custom config, and it doesn't match our active config:
        if (newConfig && (newUrl !== activeUrl || newApiKey !== activeApiKey)) {
          console.log("Firebase sync credentials updated. Reconnecting...");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        // 2. If the custom config was removed (val is null), but our active database is NOT the default database:
        else if (!newConfig && activeUrl && activeUrl !== normalizeUrl("https://zephyrdevs-905b9-default-rtdb.firebaseio.com")) {
          console.log("Firebase config reset to default. Reconnecting...");
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    }
  });

  // Inject the Admin panel modals when iframe has loaded
  iframe.onload = () => {
    injectAdminModals();
  };
};

// Default co-founders data to initialize Firebase DB if empty
const defaultDbData = {
  maintenance: false,
  announcement: {
    active: false,
    text: "Welcome to ZephyrDevs! We are now booking new projects."
  },
  password: "admin00",
  themeAccent: "lime",
  team: {
    "founder_akshansh": {
      name: "Akshansh Sinha",
      role: "Co-Founder & Tech Architect",
      bio: "Specializes in backend architecture, Google Gemini model tuning, and cloud-native solutions with Node.js and Firebase.",
      instagram: "akshansh_6969",
      initials: "AS",
      gradient: "linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 176, 255, 0.2) 100%)",
      pfp: "https://i.ibb.co/ZpbWz2g9/aksansh.jpg"
    },
    "founder_aarav": {
      name: "Aarav Sharma",
      role: "Co-Founder & Creative Lead",
      bio: "Designs premium glassmorphic UI interfaces, creates fluid custom animations, and manages Claude AI API pipelines.",
      instagram: "aarav_sharma_sui",
      initials: "AS",
      gradient: "linear-gradient(135deg, rgba(0, 176, 255, 0.2) 0%, rgba(200, 0, 255, 0.2) 100%)"
    },
    "founder_arshh": {
      name: "Arshh",
      role: "Co-Founder & Lead AI Engineer",
      bio: "Focuses on advanced Claude AI workflows, neural-network integrations, and high-performance server logic.",
      instagram: "arshhispro_",
      initials: "AR",
      gradient: "linear-gradient(135deg, rgba(200, 0, 255, 0.2) 0%, rgba(0, 230, 118, 0.2) 100%)"
    }
  }
};

async function initializeDefaultDataIfEmpty() {
  try {
    await firebaseCall('initializeDefaultData', defaultDbData);
  } catch (err) {
    console.error('Failed to initialize default DB data:', err);
  }
}

// ---------------------- Loading Text Update ----------------------
function handleLoadingTextUpdate(val) {
  const loadingTextEl = document.querySelector('.intro-loading-text');
  if (loadingTextEl) {
    loadingTextEl.innerText = val || 'We Levlled Up.';
  }
}

// ---------------------- Maintenance Mode ----------------------
function handleMaintenanceUpdate(active) {
  let screen = document.getElementById('maintenance-screen');
  const isAdmin = safeSessionStorage.getItem('zephyr_admin') === 'true';

  if (active && !isAdmin) {
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'maintenance-screen';
      screen.className = 'maintenance-screen';
      screen.innerHTML = `
        <div class="maintenance-content">
          <svg class="maintenance-icon" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2 class="maintenance-title">system maintenance</h2>
          <p class="maintenance-desc">zephyrdevs is currently performing scheduled upgrades. we will be online shortly.</p>
          <span class="maintenance-logo-label">zephyrdevs — 2026</span>
        </div>
        <button class="maintenance-admin-link" onclick="openAdminPanel(event)">[Admin Login]</button>
      `;
      document.body.appendChild(screen);
      document.body.classList.add('loading-active'); // Locks scrolling
    }
  } else {
    if (screen) {
      screen.remove();
      if (!document.body.classList.contains('preloading')) {
        document.body.classList.remove('loading-active'); // Unlocks scrolling
      }
    }
  }
}

// ---------------------- Announcement Bar ----------------------
function handleAnnouncementUpdate(announcement) {
  let bar = document.getElementById('announcement-bar');
  
  if (announcement && announcement.active && announcement.text) {
    document.body.classList.add('has-announcement');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'announcement-bar';
      bar.className = 'announcement-bar';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.innerHTML = `<span class="announcement-dot"></span> <span>${announcement.text}</span>`;
    bar.style.display = 'flex';
  } else {
    document.body.classList.remove('has-announcement');
    if (bar) {
      bar.style.display = 'none';
    }
  }
}

// ---------------------- Team Roster Update ----------------------
function handleTeamUpdate(teamData) {
  const grid = document.querySelector('.team-grid-v2') || document.querySelector('.founders-grid');
  if (!grid) return; // Only index.html has co-founders grid

  grid.innerHTML = '';
  if (!teamData) return;

  Object.keys(teamData).forEach(key => {
    const m = teamData[key];
    if (!m || !m.name) return;

    const initials = m.initials || m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const instaClean = (m.instagram || '').replace('@', '');

    const card = document.createElement('div');
    card.className = 'team-card-v2 reveal reveal-scale in';
    card.style.opacity = '1';
    card.style.transform = 'none';

    let avatarHtml = '';
    if (m.pfp && m.pfp.trim() !== '') {
      avatarHtml = `
        <div class="team-avatar-v2" style="border: 1px solid rgba(163,230,53,0.3); background: #101510; padding: 0;">
          <img src="${m.pfp}" alt="${m.name}" class="team-avatar-img" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(163,230,53,0.25), rgba(132,204,22,0.18)); font-family: var(--font-display); font-weight:800; color: var(--text-primary);">${initials}</span>
        </div>
      `;
    } else {
      avatarHtml = `
        <div class="team-avatar-v2" style="background: linear-gradient(135deg, rgba(163,230,53,0.25), rgba(132,204,22,0.18)); border: 1px solid rgba(163,230,53,0.2);">
          ${initials}
        </div>
      `;
    }

    card.innerHTML = `
      ${avatarHtml}
      <div class="team-role-badge">${m.role || ''}</div>
      <div class="team-name-v2">${m.name || ''}</div>
      <p class="team-bio-v2">${m.bio || ''}</p>
      ${instaClean ? `
        <a href="https://instagram.com/${instaClean}" target="_blank" rel="noopener" class="team-insta">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          @${instaClean}
        </a>
      ` : ''}
    `;
    grid.appendChild(card);
  });
}

// ---------------------- Admin Panel Controls & Modals ----------------------
function injectAdminModals() {
  if (document.getElementById('admin-pw-modal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Password Modal -->
    <div id="admin-pw-modal" class="admin-modal-overlay">
      <div class="admin-modal-box admin-pw-box">
        <div class="admin-modal-header">
          <h3 class="admin-modal-title" style="font-family: var(--font-mono); text-transform: uppercase; font-size: 1.15rem; letter-spacing: 0.08em;">admin authorization</h3>
          <button class="admin-modal-close" onclick="closeAdminPasswordModal()">&times;</button>
        </div>
        <p class="admin-pw-desc">enter password to access control centre</p>
        <div class="admin-form-group">
          <div style="position: relative; max-width: 260px; margin: 0 auto;">
            <input type="password" id="admin-pw-input" class="admin-input" placeholder="••••••••" style="text-align: center; width: 100%; padding-right: 40px;">
            <button id="admin-pw-toggle-btn" onclick="togglePasscodeVisibility()" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; padding: 4px;">
              <svg class="eye-open-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg class="eye-closed-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>
          <div id="admin-pw-error" class="admin-pw-error">incorrect security code</div>
        </div>
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
          <button class="admin-btn admin-btn-secondary" onclick="closeAdminPasswordModal()">cancel</button>
          <button class="admin-btn" onclick="submitAdminPassword()">authorize</button>
        </div>
      </div>
    </div>

    <!-- Dashboard Modal -->
    <div id="admin-dashboard-modal" class="admin-modal-overlay">
      <div class="admin-modal-box dashboard-large">
        <!-- Left Sidebar Navigation -->
        <div class="admin-sidebar">
          <div class="admin-sidebar-top">
            <div class="admin-sidebar-brand">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 4px var(--neon-cyan-glow));"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Zephyr Devs</span>
            </div>
            
            <div class="admin-sidebar-menu">
              <button class="admin-sidebar-btn active" id="sidebar-btn-analytics" onclick="switchAdminTab('tab-analytics')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Metrics
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-leads" onclick="switchAdminTab('tab-leads')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Inquiries
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-settings" onclick="switchAdminTab('tab-settings')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Config
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-team" onclick="switchAdminTab('tab-team')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Roster
              </button>
              <button class="admin-sidebar-btn" id="sidebar-btn-reviews" onclick="switchAdminTab('tab-reviews')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Reviews
              </button>
            </div>
          </div>
          
          <div class="admin-sidebar-footer">
            <div class="server-status-wrap">
              <span class="live-pulse-dot"></span>
              <span>API Server Connected</span>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="admin-content-area">
          <div class="admin-content-header">
            <div>
              <h3 style="font-family: var(--font-mono); text-transform: uppercase; font-size: 1.15rem; letter-spacing: 0.1em; color: var(--neon-cyan); margin-bottom: 2px;">Control Centre</h3>
              <span style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono);" id="admin-date-stamp">Zephyr Control Panel</span>
            </div>
            <button class="admin-modal-close" onclick="closeAdminDashboard()">&times;</button>
          </div>

          <!-- Tab: Traffic Analytics -->
          <div id="tab-analytics" class="admin-tab-content active">
            <div class="admin-analytics-grid">
              <div class="admin-stat-card">
                <div class="admin-stat-label">unique visitors</div>
                <div class="admin-stat-num" id="stat-visitors">0</div>
                <div class="admin-stat-trend trend-up">↑ 18.2% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">total pageviews</div>
                <div class="admin-stat-num" id="stat-pageviews">0</div>
                <div class="admin-stat-trend trend-up">↑ 22.4% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">inquiries / leads</div>
                <div class="admin-stat-num" id="stat-leads-count">0</div>
                <div class="admin-stat-trend trend-up">↑ 8.3% vs last wk</div>
              </div>
              <div class="admin-stat-card">
                <div class="admin-stat-label">conversion rate</div>
                <div class="admin-stat-num" id="stat-conversion">0.0%</div>
                <div class="admin-stat-trend trend-up">↑ 1.2% conv</div>
              </div>
            </div>

            <div class="admin-chart-container">
              <div class="admin-chart-title">Weekly Traffic Graph (Page Views)</div>
              <div id="admin-chart-svg-wrap" style="position: relative; width: 100%; height: 180px;">
                <!-- SVG chart dynamically drawn -->
              </div>
            </div>
          </div>

          <!-- Tab: System Settings -->
          <div id="tab-settings" class="admin-tab-content">
            <div class="admin-form-group admin-checkbox-group" style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
              <input type="checkbox" id="admin-maintenance-cb" class="admin-checkbox" onchange="toggleMaintenanceMode(this.checked)">
              <label for="admin-maintenance-cb" style="margin-bottom:0; cursor:pointer; font-weight: 500;">Enable Maintenance Mode (Site Lock)</label>
            </div>
            
            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin: 20px 0;">
              <div class="admin-form-group admin-checkbox-group" style="margin-bottom: 15px;">
                <input type="checkbox" id="admin-announcement-cb" class="admin-checkbox">
                <label for="admin-announcement-cb" style="margin-bottom:0; cursor:pointer; font-weight: 500;">Enable Top Announcement Banner</label>
              </div>
              <div class="admin-form-group">
                <label for="admin-announcement-text">Announcement Banner Text</label>
                <textarea id="admin-announcement-text" class="admin-textarea" rows="2" placeholder="e.g. Now booking projects for Q3 2026!"></textarea>
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="saveAnnouncementSettings()">Save Banner Config</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <div class="admin-form-group">
                <label for="admin-loading-text">Cinematic Loading Text</label>
                <input type="text" id="admin-loading-text" class="admin-input" placeholder="e.g. We Levlled Up.">
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="saveLoadingTextSettings()">Save Loading Text</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase;">security credentials</h4>
              <div class="admin-form-group">
                <label for="admin-new-pw-input">Change Admin Password</label>
                <input type="password" id="admin-new-pw-input" class="admin-input" placeholder="Enter new admin password...">
              </div>
              <button class="admin-btn" style="padding: 8px 16px; font-size: 0.8rem;" onclick="savePasswordSettings()">Save Password</button>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase; color: var(--neon-cyan);">global theme styling</h4>
              <label style="display:block; margin-bottom:8px; font-family:var(--font-mono); font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary);">Accent Color Theme</label>
              <div class="accent-colors-grid">
                <button class="accent-color-btn" data-accent="lime" onclick="updateThemeSettings('lime')">
                  <span class="color-dot-indicator" style="background: #a3e635;"></span>
                  Cyber Lime
                </button>
                <button class="accent-color-btn" data-accent="amber" onclick="updateThemeSettings('amber')">
                  <span class="color-dot-indicator" style="background: #c5ff1a;"></span>
                  Neon Volt
                </button>
                <button class="accent-color-btn" data-accent="violet" onclick="updateThemeSettings('violet')">
                  <span class="color-dot-indicator" style="background: #ccff00;"></span>
                  Acid Green
                </button>
                <button class="accent-color-btn" data-accent="cyan" onclick="updateThemeSettings('cyan')">
                  <span class="color-dot-indicator" style="background: #10b981;"></span>
                  Emerald Mint
                </button>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
              <h4 style="color:#fff; margin-bottom:15px; font-size:0.9rem; font-family:var(--font-mono); text-transform:uppercase; color: var(--neon-cyan);">system activity log</h4>
              <div id="admin-activity-logs" style="font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary);">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- Tab: Inquiries & Leads -->
          <div id="tab-leads" class="admin-tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h4 style="color:#fff; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase;">project planner inquiries</h4>
                <span style="font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-mono);" id="admin-leads-count-text">0 inquiries found</span>
              </div>
              <button class="admin-btn" style="padding: 6px 14px; font-size: 0.75rem;" onclick="toggleAddLeadForm(true)">+ Add Lead</button>
            </div>

            <!-- Manual Add Lead Overlay Form -->
            <div id="admin-add-lead-overlay" class="admin-lead-form-overlay" style="display: none;">
              <h4 style="color: #fff; margin-bottom: 15px; font-family: var(--font-mono); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">Add Lead Manually</h4>
              <div class="admin-lead-form-grid">
                <div class="admin-form-group">
                  <label>Client Name *</label>
                  <input type="text" id="lead-form-name" class="admin-input" placeholder="e.g. Rahul Kumar">
                </div>
                <div class="admin-form-group">
                  <label>Email Address *</label>
                  <input type="email" id="lead-form-email" class="admin-input" placeholder="e.g. rahul@example.com">
                </div>
                <div class="admin-form-group">
                  <label>Phone Number *</label>
                  <input type="tel" id="lead-form-phone" class="admin-input" placeholder="e.g. +91 95078 59444">
                </div>
                <div class="admin-form-group">
                  <label>Company / Brand Name</label>
                  <input type="text" id="lead-form-company" class="admin-input" placeholder="e.g. Patna Tech Corp">
                </div>
                <div class="admin-form-group">
                  <label>Subscription Plan *</label>
                  <select id="lead-form-plan" class="admin-input" style="background:#000; color:#fff;" onchange="calculateFormBudget()">
                    <option value="Starter (₹1,999/yr)">Starter Sub (₹1,999/yr)</option>
                    <option value="Growth (₹3,999/yr)">Growth Sub (₹3,999/yr)</option>
                    <option value="Enterprise (Custom)">Enterprise (Custom)</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label>Add-ons (Check to add)</label>
                  <div style="display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; max-height:80px; overflow-y:auto;">
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="SEO" onchange="calculateFormBudget()"> Advanced SEO Setup
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="Chatbot" onchange="calculateFormBudget()"> AI Chatbot Integration
                    </label>
                    <label style="display:flex; align-items:center; gap:8px; margin-bottom:0; font-family:var(--font-body); text-transform:none; font-size:0.8rem; cursor:pointer;">
                      <input type="checkbox" name="lead-form-addons" value="Branding" onchange="calculateFormBudget()"> Brand Identity Kit
                    </label>
                  </div>
                </div>
              </div>
              <div class="admin-form-group">
                <label>Estimated Budget Estimate *</label>
                <input type="text" id="lead-form-budget" class="admin-input" placeholder="e.g. ₹1,999">
              </div>
              <div class="admin-form-group">
                <label>Project Brief Summary</label>
                <textarea id="lead-form-desc" class="admin-textarea" rows="2" placeholder="Explain project specifications..."></textarea>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button class="admin-btn admin-btn-secondary" onclick="toggleAddLeadForm(false)">Cancel</button>
                <button class="admin-btn" onclick="saveManualLead()">Save Inquiry</button>
              </div>
            </div>
            
            <div class="admin-leads-wrapper">
              <table class="admin-leads-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client Details</th>
                    <th>Project Plan</th>
                    <th>Budget Estimate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-leads-table-body">
                  <!-- Leads dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab: Team Management -->
          <div id="tab-team" class="admin-tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
              <h4 style="color:#fff; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase;">team members</h4>
              <button class="admin-btn" style="padding: 6px 14px; font-size: 0.75rem;" onclick="showAddTeamMemberForm()">+ add member</button>
            </div>
            
            <div id="admin-team-list" class="admin-team-list">
              <!-- Dynamically populated -->
            </div>

            <!-- Add/Edit Member Form Overlay inside Dashboard -->
            <div id="admin-team-form" style="display:none; background: rgba(5,6,8,0.95); border: 1px solid rgba(255,255,255,0.08); padding:20px; border-radius:12px; margin-top:20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <h4 id="team-form-title" style="color:#fff; margin-bottom:15px; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">add team member</h4>
              <input type="hidden" id="team-member-key">
              
              <div class="admin-form-group">
                <label>full name</label>
                <input type="text" id="team-member-name" class="admin-input" placeholder="e.g. Akshansh Sinha">
              </div>
              <div class="admin-form-group">
                <label>role / title</label>
                <input type="text" id="team-member-role" class="admin-input" placeholder="e.g. Co-Founder & Tech Architect">
              </div>
              <div class="admin-form-group">
                <label>bio description</label>
                <textarea id="team-member-bio" class="admin-textarea" rows="2" placeholder="describe the role and skills..."></textarea>
              </div>
              <div class="admin-form-group">
                <label>instagram username (without @)</label>
                <input type="text" id="team-member-insta" class="admin-input" placeholder="e.g. akshansh_6969">
              </div>
              <div class="admin-form-group">
                <label>profile picture URL</label>
                <input type="text" id="team-member-pfp" class="admin-input" placeholder="e.g. https://i.ibb.co/ZpbWz2g9/aksansh.jpg">
              </div>
              <div style="display:flex; justify-content:flex-end; gap: 10px;">
                <button class="admin-btn admin-btn-secondary" onclick="hideTeamMemberForm()">cancel</button>
                <button class="admin-btn" onclick="saveTeamMember()">save member</button>
              </div>
            </div>
          </div>

          <!-- Tab: Client Reviews & Approvals -->
          <div id="tab-reviews" class="admin-tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px;">
              <h4 style="color:#fff; font-size:0.95rem; font-family: var(--font-mono); text-transform: uppercase; margin:0;">Client Testimonials &amp; Approvals</h4>
              <span style="font-size:0.75rem; color:var(--neon-cyan); font-family:var(--font-mono);" id="admin-reviews-badge">0 Pending</span>
            </div>

            <div style="margin-bottom: 28px;">
              <h5 style="color:var(--text-muted); font-size:0.78rem; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:12px;">Pending Reviews (Click to Publish Live)</h5>
              <div id="admin-pending-reviews-list">
                <div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No pending reviews awaiting approval.</div>
              </div>
            </div>

            <div>
              <h5 style="color:var(--text-muted); font-size:0.78rem; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:12px;">Published Reviews on Studio Showcase</h5>
              <div id="admin-published-reviews-list">
                <div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No published reviews.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrapper);

  // Bind Enter key to password submit
  const pwInput = document.getElementById('admin-pw-input');
  if (pwInput) {
    pwInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitAdminPassword();
      }
    });
  }
}

// ---------------------- Leads Management Database & Renderers ----------------------
// Load leads from LocalStorage or seed with premium mock templates
(function initLeadsDatabase() {
  const savedLeads = safeStorage.getItem('zephyr_leads');
  if (savedLeads) {
    dbState.leads = JSON.parse(savedLeads);
  } else {
    dbState.leads = [
      {
        id: 'lead_1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Aditya Raj',
        email: 'aditya.raj@rajdarbar.com',
        phone: '+91 95078 59444',
        company: 'Rajdarbar Group',
        plan: 'Growth Sub (₹3,999/yr)',
        budget: '₹3,999',
        addons: 'Advanced SEO Setup, AI Chatbot Integrations',
        description: 'Need to build a conversion-focused landing page for our new luxury apartment towers in Patna. Clean and blazing fast.',
        status: 'Won'
      },
      {
        id: 'lead_2',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Vikram Singh',
        email: 'contact@havelirestaurants.in',
        phone: '+91 98765 12345',
        company: 'Haveli Foods',
        plan: 'Starter Sub (₹1,999/yr)',
        budget: '₹1,999',
        addons: 'None',
        description: 'Need a digital menu listing website for our restaurant branches.',
        status: 'Contacted'
      }
    ];
    safeStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  }
})();

window.renderAdminLeadsList = function () {
  const tbody = document.getElementById('admin-leads-table-body');
  const countText = document.getElementById('admin-leads-count-text');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const leads = dbState.leads || [];
  
  if (countText) {
    countText.textContent = `${leads.length} inquir${leads.length === 1 ? 'y' : 'ies'} found`;
  }
  
  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-tertiary); font-family: var(--font-mono); padding: 40px 10px;">
          No inquiries found. Submit the budget planner on the contact page to test!
        </td>
      </tr>
    `;
    return;
  }
  
  leads.forEach(lead => {
    const tr = document.createElement('tr');
    const dateStr = lead.date || 'N/A';
    
    let statusClass = 'status-new';
    if (lead.status === 'Contacted') statusClass = 'status-contacted';
    if (lead.status === 'In Progress') statusClass = 'status-in-progress';
    if (lead.status === 'Won') statusClass = 'status-won';
    if (lead.status === 'Lost') statusClass = 'status-lost';
    
    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap;">${dateStr}</td>
      <td>
        <div style="font-weight: 600; color: #fff;">${lead.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${lead.email} | ${lead.phone}</div>
        <div style="font-size: 0.7rem; color: var(--text-tertiary); font-style: italic; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;" title="${lead.description || ''}">
          "${lead.description || 'No description'}"
        </div>
      </td>
      <td>
        <div style="font-weight: 500; color: #fff;">${lead.plan}</div>
        <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Add-ons: ${lead.addons || 'None'}</div>
      </td>
      <td style="font-family: var(--font-mono); font-weight: bold; color: var(--neon-cyan);">${lead.budget}</td>
      <td>
        <span class="status-badge ${statusClass}">${lead.status || 'New'}</span>
      </td>
      <td>
        <div style="display: flex; gap: 8px; align-items: center;">
          <select class="lead-action-select" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Won" ${lead.status === 'Won' ? 'selected' : ''}>Won</option>
            <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>Lost</option>
          </select>
          <button class="admin-btn-danger" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px; border: none; cursor: pointer;" onclick="deleteLead('${lead.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateLeadStatus = function(leadId, newStatus) {
  const leadIndex = dbState.leads.findIndex(l => l.id === leadId);
  if (leadIndex !== -1) {
    dbState.leads[leadIndex].status = newStatus;
    safeStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
    renderAdminLeadsList();
    firebaseCall('updateLeadStatus', { id: leadId, status: newStatus }).catch(err => console.warn(err));
  }
};

window.deleteLead = function(leadId) {
  if (confirm('Are you sure you want to delete this inquiry?')) {
    dbState.leads = dbState.leads.filter(l => l.id !== leadId);
    safeStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
    renderAdminLeadsList();
    firebaseCall('deleteLead', leadId).catch(err => console.warn(err));
  }
};

window.renderAdminAnalytics = function() {
  const visitorsVal = dbState.analytics.visitors;
  const pageviewsVal = dbState.analytics.pageviews;
  const leadsVal = dbState.leads.length;
  
  let conversionVal = '0.0%';
  if (visitorsVal > 0) {
    conversionVal = ((leadsVal / visitorsVal) * 100).toFixed(1) + '%';
  }
  
  const visEl = document.getElementById('stat-visitors');
  if (visEl) visEl.textContent = visitorsVal.toLocaleString();
  const pvEl = document.getElementById('stat-pageviews');
  if (pvEl) pvEl.textContent = pageviewsVal.toLocaleString();
  const ldEl = document.getElementById('stat-leads-count');
  if (ldEl) ldEl.textContent = leadsVal.toLocaleString();
  const convEl = document.getElementById('stat-conversion');
  if (convEl) convEl.textContent = conversionVal;
  
  const svgWrap = document.getElementById('admin-chart-svg-wrap');
  if (!svgWrap) return;
  
  const data = dbState.analytics.weeklyData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = Math.max(...data) || 1000;
  
  const width = svgWrap.clientWidth || 740;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;
  
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });
  
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
  
  let gridLines = '';
  for (let i = 0; i <= 3; i++) {
    const y = paddingY + (i / 3) * chartHeight;
    const val = Math.round(maxVal - (i / 3) * maxVal);
    gridLines += `
      <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
      <text x="${paddingX - 10}" y="${y + 4}" fill="var(--text-tertiary)" font-family="var(--font-mono)" font-size="9" text-anchor="end">${val}</text>
    `;
  }
  
  let markers = '';
  points.forEach((p, idx) => {
    markers += `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--neon-cyan)" />
      <text x="${p.x}" y="${paddingY + chartHeight + 15}" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="9" text-anchor="middle">${days[idx]}</text>
      <text x="${p.x}" y="${p.y - 8}" fill="#ffffff" font-family="var(--font-mono)" font-size="9" font-weight="bold" text-anchor="middle">${p.val}</text>
    `;
  });
  
  svgWrap.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--neon-cyan)" stop-opacity="0.15" />
          <stop offset="100%" stop-color="var(--neon-cyan)" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#chartGradient)" />
      <path d="${linePath}" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5" />
      ${markers}
    </svg>
  `;
}

window.openAdminPanel = function (e) {
  if (e) e.preventDefault();
  
  if (safeSessionStorage.getItem('zephyr_admin') === 'true') {
    showAdminDashboard();
  } else {
    showAdminPasswordModal();
  }
};

function showAdminPasswordModal() {
  const modal = document.getElementById('admin-pw-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('loading-active');
    const input = document.getElementById('admin-pw-input');
    if (input) {
      input.value = '';
      input.type = 'password';
      input.focus();
    }
    const btn = document.getElementById('admin-pw-toggle-btn');
    if (btn) {
      const openIcon = btn.querySelector('.eye-open-icon');
      const closedIcon = btn.querySelector('.eye-closed-icon');
      if (openIcon) openIcon.style.display = 'block';
      if (closedIcon) closedIcon.style.display = 'none';
    }
    const err = document.getElementById('admin-pw-error');
    if (err) err.style.display = 'none';
  }
}

window.closeAdminPasswordModal = function () {
  const modal = document.getElementById('admin-pw-modal');
  if (modal) {
    modal.classList.remove('active');
    if (!document.getElementById('maintenance-screen') && !document.body.classList.contains('preloading')) {
      document.body.classList.remove('loading-active');
    }
  }
};

window.submitAdminPassword = function () {
  const input = document.getElementById('admin-pw-input');
  const err = document.getElementById('admin-pw-error');
  const pass = input ? input.value : '';

  // Auth check using database password (or fallback)
  const actualPassword = dbState.password || 'admin00';
  
  if (pass === actualPassword) {
    safeSessionStorage.setItem('zephyr_admin', 'true');
    closeAdminPasswordModal();
    showAdminDashboard();
  } else {
    if (err) err.style.display = 'block';
  }
};

function showAdminDashboard() {
  const dashboard = document.getElementById('admin-dashboard-modal');
  if (dashboard) {
    dashboard.classList.add('active');
    document.body.classList.add('loading-active');
    
    // Sync current values with UI
    const mCB = document.getElementById('admin-maintenance-cb');
    if (mCB) mCB.checked = dbState.maintenance || false;
    
    const aCB = document.getElementById('admin-announcement-cb');
    if (aCB) aCB.checked = dbState.announcement ? dbState.announcement.active : false;
    
    const aText = document.getElementById('admin-announcement-text');
    if (aText) aText.value = dbState.announcement ? dbState.announcement.text : '';

    const lText = document.getElementById('admin-loading-text');
    if (lText) lText.value = dbState.loadingText || '';

    const newPwInput = document.getElementById('admin-new-pw-input');
    if (newPwInput) newPwInput.value = '';

    // Set active visual color accent button states
    const activeAccent = safeStorage.getItem('zephyr_accent') || 'lime';
    document.querySelectorAll('.accent-color-btn').forEach(btn => {
      if (btn.getAttribute('data-accent') === activeAccent) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Populate active database configurations
    const active = window.activeFirebaseConfig || {};
    const apiKeyField = document.getElementById('admin-config-apikey');
    if (apiKeyField) apiKeyField.value = active.apiKey || '';
    const dbUrlField = document.getElementById('admin-config-dburl');
    if (dbUrlField) dbUrlField.value = active.databaseURL || '';
    const projIdField = document.getElementById('admin-config-projectid');
    if (projIdField) projIdField.value = active.projectId || '';
    const appIdField = document.getElementById('admin-config-appid');
    if (appIdField) appIdField.value = active.appId || '';

    // Set modern header date stamp
    const stamp = document.getElementById('admin-date-stamp');
    if (stamp) {
      const now = new Date();
      stamp.textContent = 'Control Panel - ' + now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    renderAdminTeamList();
    renderActivityLogs(dbState.activityLogs);
    switchAdminTab('tab-analytics'); // Default to Analytics tab!
    startLiveAnalyticsSimulation(); // Start simulation ticks!
  }
}

window.closeAdminDashboard = function () {
  const dashboard = document.getElementById('admin-dashboard-modal');
  if (dashboard) {
    dashboard.classList.remove('active');
    
    // Clear admin auth state so it asks for password next time
    safeSessionStorage.removeItem('zephyr_admin');
    
    // Clear simulation ticks
    if (window.liveAnalyticsInterval) {
      clearInterval(window.liveAnalyticsInterval);
    }
    
    // Re-evaluate maintenance mode view (locks screen if active)
    handleMaintenanceUpdate(dbState.maintenance || false);
  }
};

window.switchAdminTab = function (tabId) {
  // Hide all tab contents
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  // Deactivate all sidebar buttons
  document.querySelectorAll('.admin-sidebar-btn').forEach(b => b.classList.remove('active'));

  // Show selected tab content and active button
  const tabContent = document.getElementById(tabId);
  if (tabContent) tabContent.classList.add('active');

  const btnId = 'sidebar-btn-' + tabId.replace('tab-', '');
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  
  hideTeamMemberForm();
  toggleAddLeadForm(false); // Close add lead overlay on tab switch

  if (tabId === 'tab-leads') {
    renderAdminLeadsList();
  } else if (tabId === 'tab-analytics') {
    renderAdminAnalytics();
  }
};

// ---------------------- DB Update Handlers ----------------------
window.toggleMaintenanceMode = async function (checked) {
  try {
    await firebaseCall('updateMaintenance', checked);
  } catch (err) {
    console.error('Failed to toggle maintenance mode:', err);
  }
};

window.saveAnnouncementSettings = async function () {
  const active = document.getElementById('admin-announcement-cb').checked;
  const text = document.getElementById('admin-announcement-text').value;

  try {
    await firebaseCall('updateAnnouncement', { active, text });
    alert('Announcement settings updated.');
  } catch (err) {
    console.error('Failed to update announcement:', err);
    alert('Failed to update announcement: ' + err.message);
  }
};

window.saveLoadingTextSettings = async function () {
  const text = document.getElementById('admin-loading-text').value.trim();
  try {
    await firebaseCall('updateLoadingText', text);
    alert('Loading text updated.');
  } catch (err) {
    console.error('Failed to update loading text:', err);
    alert('Failed to update loading text: ' + err.message);
  }
};

window.savePasswordSettings = async function () {
  const newPwInput = document.getElementById('admin-new-pw-input');
  const newPw = newPwInput ? newPwInput.value : '';

  if (!newPw) {
    alert('Password cannot be empty.');
    return;
  }

  try {
    await firebaseCall('updatePassword', newPw);
    alert('Security password updated successfully across all devices.');
    if (newPwInput) newPwInput.value = '';
  } catch (err) {
    console.error('Failed to update password:', err);
    alert('Failed to update password: ' + err.message);
  }
};

window.saveCustomConfig = async function () {
  const apiKey = document.getElementById('admin-config-apikey').value.trim();
  const databaseURL = document.getElementById('admin-config-dburl').value.trim();
  const projectId = document.getElementById('admin-config-projectid').value.trim();
  const appId = document.getElementById('admin-config-appid').value.trim();

  if (!apiKey || !databaseURL || !projectId || !appId) {
    alert('Please fill out all 4 core Firebase config fields.');
    return;
  }

  const customConfig = {
    apiKey,
    databaseURL,
    projectId,
    appId,
    authDomain: `${projectId}.firebaseapp.com`,
    storageBucket: `${projectId}.firebasestorage.app`
  };

  if (!confirm('Are you sure you want to change the database config? This will sync to all devices.')) return;

  try {
    await firebaseCall('updateCustomConfig', customConfig);
    alert('Firebase configuration updated and registry synced successfully! Reloading...');
  } catch (err) {
    console.error('Failed to update custom config:', err);
    alert('Failed to update configuration: ' + err.message);
  }
};

window.resetCustomConfig = async function () {
  if (!confirm('Reset Firebase configuration to default? This will sync to all devices.')) return;

  try {
    await firebaseCall('resetCustomConfig');
    alert('Firebase configuration reset to default registry config! Reloading...');
  } catch (err) {
    console.error('Failed to reset config:', err);
    alert('Failed to reset config: ' + err.message);
  }
};

// ---------------------- Admin Team List Roster Controls ----------------------
function renderAdminTeamList() {
  const container = document.getElementById('admin-team-list');
  if (!container) return;

  container.innerHTML = '';
  const team = dbState.team || {};

  if (Object.keys(team).length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No team members in roster.</div>';
    return;
  }

  Object.keys(team).forEach(key => {
    const m = team[key];
    const div = document.createElement('div');
    div.className = 'admin-team-item';
    const pfpPreview = (m.pfp && m.pfp.trim() !== '') ? `<img src="${m.pfp}" style="width:34px; height:34px; border-radius:8px; object-fit:cover; border:1px solid rgba(163,230,53,0.3); margin-right:12px; flex-shrink:0;">` : `<div style="width:34px; height:34px; border-radius:8px; background:rgba(163,230,53,0.15); display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; color:#a3e635; border:1px solid rgba(163,230,53,0.3); margin-right:12px; flex-shrink:0;">${m.initials || 'TS'}</div>`;
    
    const instaClean = (m.instagram || '').replace('@', '');

    div.innerHTML = `
      <div class="admin-team-info" style="display:flex; align-items:center;">
        ${pfpPreview}
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#fff; font-family: var(--font-display);">${m.name}</h4>
          <p style="margin:2px 0 0; font-size:0.75rem; color:var(--text-muted); font-family: var(--font-mono);">${m.role} ${instaClean ? '(@' + instaClean + ')' : ''}</p>
        </div>
      </div>
      <div class="admin-team-actions">
        <button class="edit" onclick="showEditTeamMemberForm('${key}')">Edit</button>
        <button class="delete" onclick="deleteTeamMember('${key}')">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderActivityLogs(logs) {
  const container = document.getElementById('admin-activity-logs');
  if (!container) return;

  container.innerHTML = '';
  const logArray = logs || dbState.activityLogs || [];

  if (logArray.length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.8rem; font-family: var(--font-mono);">No recent activities logged.</div>';
    return;
  }

  logArray.forEach(log => {
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
    div.style.paddingBottom = '4px';
    div.innerHTML = `<span style="color: var(--neon-green); margin-right: 8px;">[${log.timestamp || ''}]</span> <span>${log.text || ''}</span>`;
    container.appendChild(div);
  });
}

window.showAddTeamMemberForm = function () {
  const form = document.getElementById('admin-team-form');
  const title = document.getElementById('team-form-title');
  if (form && title) {
    title.textContent = 'add team member';
    document.getElementById('team-member-key').value = '';
    document.getElementById('team-member-name').value = '';
    document.getElementById('team-member-role').value = '';
    document.getElementById('team-member-bio').value = '';
    document.getElementById('team-member-insta').value = '';
    document.getElementById('team-member-pfp').value = '';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }
};

window.showEditTeamMemberForm = function (key) {
  const form = document.getElementById('admin-team-form');
  const title = document.getElementById('team-form-title');
  const m = dbState.team[key];

  if (form && title && m) {
    title.textContent = 'edit team member';
    document.getElementById('team-member-key').value = key;
    document.getElementById('team-member-name').value = m.name || '';
    document.getElementById('team-member-role').value = m.role || '';
    document.getElementById('team-member-bio').value = m.bio || '';
    document.getElementById('team-member-insta').value = m.instagram || '';
    document.getElementById('team-member-pfp').value = m.pfp || '';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  }
};

window.hideTeamMemberForm = function () {
  const form = document.getElementById('admin-team-form');
  if (form) form.style.display = 'none';
};

window.saveTeamMember = async function () {
  const keyInput = document.getElementById('team-member-key').value;
  const name = document.getElementById('team-member-name').value;
  const role = document.getElementById('team-member-role').value;
  const bio = document.getElementById('team-member-bio').value;
  const instagram = document.getElementById('team-member-insta').value;
  const pfp = document.getElementById('team-member-pfp').value.trim();

  if (!name || !role) {
    alert('Name and Role are required.');
    return;
  }

  // Generate safe key if new
  const key = keyInput || 'member_' + Date.now();

  // Generate initials and gradient dynamically
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const gradients = [
    "linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 176, 255, 0.2) 100%)",
    "linear-gradient(135deg, rgba(0, 176, 255, 0.2) 0%, rgba(200, 0, 255, 0.2) 100%)",
    "linear-gradient(135deg, rgba(200, 0, 255, 0.2) 0%, rgba(0, 230, 118, 0.2) 100%)"
  ];
  let code = 0;
  for (let i = 0; i < name.length; i++) {
    code += name.charCodeAt(i);
  }
  const gradient = gradients[code % gradients.length];

  const member = { name, role, bio, instagram, initials, gradient, pfp };

  try {
    await firebaseCall('setTeamMember', { key, member });
    hideTeamMemberForm();
  } catch (err) {
    console.error('Failed to save team member:', err);
    alert('Failed to save member: ' + err.message);
  }
};

window.deleteTeamMember = async function (key) {
  if (!confirm('Are you sure you want to delete this team member?')) return;

  try {
    await firebaseCall('deleteTeamMember', key);
  } catch (err) {
    console.error('Failed to delete team member:', err);
    alert('Failed to delete member: ' + err.message);
  }
};

// ---------------------- Password Eye Toggle ----------------------
window.togglePasscodeVisibility = function () {
  const input = document.getElementById('admin-pw-input');
  const btn = document.getElementById('admin-pw-toggle-btn');
  if (!input || !btn) return;

  const openIcon = btn.querySelector('.eye-open-icon');
  const closedIcon = btn.querySelector('.eye-closed-icon');

  if (input.type === 'password') {
    input.type = 'text';
    if (openIcon) openIcon.style.display = 'none';
    if (closedIcon) closedIcon.style.display = 'block';
  } else {
    input.type = 'password';
    if (openIcon) openIcon.style.display = 'block';
    if (closedIcon) closedIcon.style.display = 'none';
  }
};

window.updateThemeSettings = async function (themeValue) {
  applyThemeAccent(themeValue);
  try {
    await firebaseCall('updateThemeAccent', themeValue);
  } catch (err) {
    console.error('Failed to update theme settings:', err);
  }
};

function applyThemeAccent(theme) {
  const root = document.documentElement;
  
  const themes = {
    lime: {
      cyan: '#a3e635',
      cyanGlow: 'rgba(163, 230, 53, 0.35)',
      violet: '#bef264',
      violetGlow: 'rgba(190, 242, 100, 0.25)',
      green: '#ccff00',
      greenGlow: 'rgba(204, 255, 0, 0.3)'
    },
    amber: {
      cyan: '#c5ff1a',
      cyanGlow: 'rgba(197, 255, 26, 0.35)',
      violet: '#a3e635',
      violetGlow: 'rgba(163, 230, 53, 0.28)',
      green: '#bef264',
      greenGlow: 'rgba(190, 242, 100, 0.25)'
    },
    violet: {
      cyan: '#ccff00',
      cyanGlow: 'rgba(204, 255, 0, 0.35)',
      violet: '#a3e635',
      violetGlow: 'rgba(163, 230, 53, 0.25)',
      green: '#84cc16',
      greenGlow: 'rgba(132, 204, 22, 0.2)'
    },
    cyan: {
      cyan: '#10b981',
      cyanGlow: 'rgba(16, 185, 129, 0.35)',
      violet: '#bef264',
      violetGlow: 'rgba(190, 242, 100, 0.25)',
      green: '#84cc16',
      greenGlow: 'rgba(132, 204, 22, 0.2)'
    }
  };

  const selected = themes[theme] || themes.lime;
  root.style.setProperty('--neon-cyan', selected.cyan);
  root.style.setProperty('--neon-cyan-glow', selected.cyanGlow);
  root.style.setProperty('--neon-violet', selected.violet);
  root.style.setProperty('--neon-violet-glow', selected.violetGlow);
  root.style.setProperty('--neon-green', selected.green);
  root.style.setProperty('--neon-green-glow', selected.greenGlow);
  
  safeStorage.setItem('zephyr_accent', theme);
  dbState.themeAccent = theme;

  document.querySelectorAll('.accent-color-btn').forEach(btn => {
    if (btn.getAttribute('data-accent') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* =========================================================================
   UI Redesign Interactions (Bento, Magnetic, Nav)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Bento Panel Mouse Tracking
  const updateBentoMouse = (e) => {
    document.querySelectorAll('.bento-panel').forEach(panel => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty('--mouse-x', `${x}px`);
      panel.style.setProperty('--mouse-y', `${y}px`);
    });
  };
  window.addEventListener('mousemove', updateBentoMouse);

  // Magnetic Buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });

  // Staggered Reveal Observer
  const bentoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 100);
        bentoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bento-reveal').forEach(el => bentoObserver.observe(el));

  // Dynamic Floating Navbar
  const navPill = document.querySelector('.nav-pill');
  if (navPill) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navPill.style.padding = '10px 20px';
        navPill.style.background = 'rgba(10, 11, 28, 0.85)';
        navPill.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      } else {
        navPill.style.padding = '14px 24px';
        navPill.style.background = 'rgba(10, 11, 28, 0.65)';
        navPill.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
      }
    });
  }
});

/* =========================================================================
   11. Tech Stack Announcement Ticker
   ========================================================================= */
function initTechTicker() {
  const tickerWrap = document.createElement('div');
  tickerWrap.className = 'tech-ticker-wrap';

  const techs = [
    { name: 'HTML5', logo: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>' },
    { name: 'CSS3', logo: '<svg viewBox="0 0 24 24"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/></svg>' },
    { name: 'JavaScript', logo: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>' },
    { name: 'Node.js', logo: '<svg viewBox="0 0 24 24"><path d="M12 24c-.3 0-.6-.1-.9-.2l-2.9-1.7c-.4-.2-.2-.3-.1-.4.6-.2.7-.3 1.3-.6.1 0 .2 0 .2.1l2.3 1.3c.1 0 .2 0 .3 0l8.8-5.1c.1-.1.1-.1.1-.2V6.9c0-.1-.1-.2-.1-.2L12.2 1.6c-.1 0-.2 0-.3 0L3.1 6.7c-.1 0-.2.1-.2.2v10.2c0 .1.1.2.1.2l2.4 1.4c1.3.7 2.1-.1 2.1-.9V7.8c0-.1.1-.3.3-.3h1.1c.1 0 .3.1.3.3v10c0 1.7-1 2.7-2.6 2.7-.5 0-.9 0-2-.6L2.3 18.7c-.6-.3-.9-1-.9-1.6V6.9c0-.7.4-1.3.9-1.6l8.8-5.1c.6-.3 1.3-.3 1.8 0l8.8 5.1c.6.3.9 1 .9 1.6v10.2c0 .7-.4 1.3-.9 1.6l-8.8 5.1c-.2.1-.5.2-.8.2z"/></svg>' },
    { name: 'Firebase', logo: '<svg viewBox="0 0 24 24"><path d="M3.9 15.8L2.1 5.4c-.1-.3.2-.5.5-.3l2 1.8 2.9 2.8-3.6 6.1zM21.2 12.3l-2.1-4.2-1.2-2.4c-.1-.3-.6-.3-.7 0L12.5 14.9 9.2 8.7c-.1-.3-.6-.3-.7 0L3.4 18.3c-.1.2 0 .5.3.4l13.8-1.5 3.7-4.4c.2-.2.2-.4 0-.5z"/></svg>' },
    { name: 'Gemini AI', logo: '<svg viewBox="0 0 24 24"><path d="M11 19.3Q12 21.5 12 24q0-2.5 1-4.7 1-2.2 2.6-3.8 1.6-1.6 3.8-2.6Q21.5 12 24 12q-2.5 0-4.7-1a12.3 12.3 0 0 1-3.8-2.6 12.3 12.3 0 0 1-2.6-3.8Q12 2.5 12 0q0 2.5-1 4.7-1 2.2-2.6 3.8a12.3 12.3 0 0 1-3.8 2.6Q2.5 12 0 12q2.5 0 4.7 1 2.2 1 3.8 2.6t2.6 3.8"/></svg>' },
    { name: 'Claude', logo: '<svg viewBox="0 0 24 24"><path d="M17.3 3.5h-3.7l6.7 16.9H24Zm-10.6 0L0 20.5h3.7l1.4-3.6h7l1.4 3.6h3.7L10.5 3.5ZM6.2 13.7l2.3-5.9 2.3 5.9Z"/></svg>' },
    { name: 'OpenAI', logo: '<svg viewBox="0 0 24 24"><path d="M22.2 10.8c-.1-1.1-.5-2.1-1.1-3.1a5.3 5.3 0 0 0-3.3-2.1 5.3 5.3 0 0 0-4.6 1.4L12 9.1l-1.2-2c-.9-1.5-2.4-2.4-4-2.4-.2 0-.4 0-.6.1a5.3 5.3 0 0 0-3.3 2.1c-.9 1-1.3 2.1-1.1 3.1a5.3 5.3 0 0 0 1.5 3.9L5.4 16.3l1.2 2a5.2 5.2 0 0 0 3.9 1.6c.2 0 .4 0 .6-.1a5.3 5.3 0 0 0 3.3-2.1c.9-1 1.3-2.1 1.1-3.1a5.3 5.3 0 0 0-1.5-3.9l-2-1.2-1.2-2c0-.1-.1-.1-.2-.2a.4.4 0 0 0-.4 0c0 .1-.1.1-.2.2L12 7l-1.2 2a.4.4 0 0 0 0 .4c0 .1.1.1.2.2a.4.4 0 0 0 .4 0c.1 0 .1-.1.2-.2l1.2-2 2 1.2a5.3 5.3 0 0 0 1.6 3.9 5.3 5.3 0 0 0-1.1 3.2 5.3 5.3 0 0 0-3.3 2.1c-.2.1-.4.1-.6.1a5.2 5.2 0 0 0-3.9-1.6l-1.2-2-2-1.2a5.3 5.3 0 0 0-1.6-3.9c.2 1 .6 2.1 1.1 3.1a5.3 5.3 0 0 0 3.3 2.1c.2 0 .4.1.6.1a5.2 5.2 0 0 0 3.9-1.6l1.2-2 1.2-2a5.2 5.2 0 0 0 3.9 1.6c.2 0 .4 0 .6-.1a5.3 5.3 0 0 0 3.3-2.1c.9-1 1.3-2.1 1.1-3.1a5.3 5.3 0 0 0-1.5-3.9l-2-1.2-1.2-2a5.2 5.2 0 0 0-3.9-1.6c-.2 0-.4 0-.6.1a5.3 5.3 0 0 0-3.3 2.1c-.9 1-1.3 2.1-1.1 3.1a5.3 5.3 0 0 0 1.5 3.9l2 1.2z"/></svg>' },
    { name: 'Vercel', logo: '<svg viewBox="0 0 24 24"><path d="M24 22.5H0L12 1.5l12 21z"/></svg>' },
    { name: 'Tailwind CSS', logo: '<svg viewBox="0 0 24 24"><path d="M12 6.036c-2.402 0-3.602 1.201-3.602 3.602 0 2.402 1.2 3.602 3.602 3.602 2.4 0 3.6-1.2 3.6-3.602 0-2.401-1.2-3.602-3.6-3.602zM6 12.036c-2.4 0-3.6 1.201-3.6 3.602 0 2.402 1.2 3.602 3.602 3.602 2.4 0 3.6-1.2 3.6-3.602 0-2.401-1.2-3.602-3.6-3.602z"/></svg>' }
  ];

  const repeated = [...techs, ...techs];
  const listItems = repeated.map(tech => `<span>${tech.logo}${tech.name}</span>`).join('<span class="ticker-dot"></span>');

  tickerWrap.innerHTML = `
    <div class="tech-ticker-content">
      ${listItems}
    </div>
  `;

  const footer = document.querySelector('footer');
  if (footer) {
    footer.parentNode.insertBefore(tickerWrap, footer);
  } else {
    document.body.appendChild(tickerWrap);
  }
}

/* =========================================================================
   12. Interactive Mock Chatbot
   ========================================================================= */
function initChatbot() {
  const chatbotContainer = document.createElement('div');
  chatbotContainer.className = 'chatbot-widget-container';

  chatbotContainer.innerHTML = `
    <!-- Trigger Button -->
    <div class="chatbot-trigger" id="chat-trigger">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>

    <!-- Chat window -->
    <div class="chatbot-window" id="chat-window">
      <div class="chatbot-header">
        <div class="chatbot-profile">
          <div class="chatbot-avatar">Z</div>
          <div class="chatbot-info">
            <h4>Zephyr Assistant</h4>
            <div class="chatbot-status">Online</div>
          </div>
        </div>
        <button class="chatbot-close" id="chat-close" aria-label="Close Chat">&times;</button>
      </div>

      <div class="chatbot-messages" id="chat-messages-area">
        <div class="chat-msg bot">
          Hey there! 👋 I am the Zephyr assistant. How can I help you build your next project today?
        </div>
      </div>

      <div class="chatbot-suggestions">
        <p>Quick Questions</p>
        <button class="chat-suggest-btn" data-key="starter">Tell me about the Starter Plan (₹1,999/yr)</button>
        <button class="chat-suggest-btn" data-key="pro">Tell me about the Pro Plan (₹2,999/yr)</button>
        <button class="chat-suggest-btn" data-key="enterprise">Tell me about the Enterprise Plan (₹4,999/yr)</button>
        <button class="chat-suggest-btn" data-key="contact">How do I start a project?</button>
      </div>

      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chat-user-input" placeholder="Type a message...">
        <button class="chatbot-send" id="chat-send-btn" aria-label="Send Message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(chatbotContainer);

  const trigger = document.getElementById('chat-trigger');
  const windowEl = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const messagesArea = document.getElementById('chat-messages-area');
  const suggestBtns = chatbotContainer.querySelectorAll('.chat-suggest-btn');
  const userInput = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('chat-send-btn');

  // Toggle open
  trigger.addEventListener('click', () => {
    windowEl.classList.toggle('open');
  });

  // Close
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    windowEl.classList.remove('open');
  });

  const responses = {
    starter: "Our **Starter plan (₹1,999/yr)** is designed for fast, high-performance static websites. It includes premium templates, responsive layout, hosting setup, and essential SEO integration.",
    pro: "Our **Pro plan (₹2,999/yr)** offers dynamic multi-page custom websites. It includes database connections, interactive components, customized forms, and advanced SEO optimization.",
    enterprise: "Our **Enterprise plan (₹4,999/yr)** is a fully tailored solution featuring complex databases, admin dashboards, and custom dual-LLM systems utilizing Google Gemini and Claude APIs.",
    contact: "To start a project, simply go to the **Start Project** page in the navbar, select a plan, input your phone number, and submit. We'll get in touch with you shortly!"
  };

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function handleBotResponse(key) {
    // Show loading state
    const loader = document.createElement('div');
    loader.className = 'chat-msg bot typing-indicator';
    loader.innerText = 'typing...';
    messagesArea.appendChild(loader);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    setTimeout(() => {
      messagesArea.removeChild(loader);
      const text = responses[key] || "Thanks for messaging! I'm an automated assistant. For custom queries, please reach out to **zephyrdevsofficial@gmail.com** or select one of the quick options above! 🚀";
      appendMessage(text, 'bot');
    }, 1000);
  }

  suggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const text = btn.innerText;
      appendMessage(text, 'user');
      handleBotResponse(key);
    });
  });

  function sendUserMsg() {
    const val = userInput.value.trim();
    if (!val) return;
    appendMessage(val, 'user');
    userInput.value = '';
    handleBotResponse('custom');
  }

  sendBtn.addEventListener('click', sendUserMsg);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendUserMsg();
    }
  });
}

/* =========================================================================
   13. Theme Switcher (Light/Dark Toggle)
   ========================================================================= */
function initThemeToggle() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle light/dark theme');
  btn.innerHTML = `
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>
    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
  `;

  const ctaBtn = navPill.querySelector('.nav-cta-btn') || navPill.querySelector('.nav-burger');
  if (ctaBtn) {
    navPill.insertBefore(btn, ctaBtn);
  } else {
    navPill.appendChild(btn);
  }

  const currentTheme = safeStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    btn.querySelector('.sun-icon').style.display = 'none';
    btn.querySelector('.moon-icon').style.display = 'block';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    safeStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    if (isLight) {
      btn.querySelector('.sun-icon').style.display = 'none';
      btn.querySelector('.moon-icon').style.display = 'block';
    } else {
      btn.querySelector('.sun-icon').style.display = 'block';
      btn.querySelector('.moon-icon').style.display = 'none';
    }
  });
}

/* =========================================================================
   14. Live Website Preview Modal
   ========================================================================= */
function initLivePreviewModal() {
  if (document.getElementById('live-preview-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'live-preview-modal';
  modal.className = 'preview-modal';
  modal.innerHTML = `
    <div class="preview-modal-container">
      <div class="preview-modal-header">
        <div class="mac-controls">
          <span class="mac-dot close-preview" style="background:#ff5f56; width:12px; height:12px; border-radius:50%; display:inline-block; cursor:pointer;" id="preview-mac-close"></span>
          <span class="mac-dot minimize-preview" style="background:#ffbd2e; width:12px; height:12px; border-radius:50%; display:inline-block; margin-left:4px;"></span>
          <span class="mac-dot maximize-preview" style="background:#27c93f; width:12px; height:12px; border-radius:50%; display:inline-block; margin-left:4px;"></span>
        </div>
        <div class="preview-address-bar">
          <span class="preview-secure-lock">🔒</span>
          <span id="preview-url-text">https://rajdarbars.vercel.app</span>
        </div>
        <button class="preview-tab-btn" id="preview-external-btn" title="Open in new tab">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </button>
        <button class="preview-modal-close" id="preview-close-btn">&times;</button>
      </div>
      <div class="preview-modal-body">
        <div class="preview-loader" id="preview-loader-el">
          <svg class="loader-spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--neon-cyan);"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          <span style="margin-top: 8px;">Loading live website preview...</span>
        </div>
        <iframe id="preview-iframe" src="" frameborder="0"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById('preview-close-btn');
  const macClose = document.getElementById('preview-mac-close');
  const iframe = document.getElementById('preview-iframe');
  const loader = document.getElementById('preview-loader-el');

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
  }

  closeBtn.addEventListener('click', closeModal);
  macClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  iframe.addEventListener('load', () => {
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  });
}

function openLivePreview(url, title, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const modal = document.getElementById('live-preview-modal');
  const iframe = document.getElementById('preview-iframe');
  const loader = document.getElementById('preview-loader-el');
  const urlText = document.getElementById('preview-url-text');
  const externalBtn = document.getElementById('preview-external-btn');

  if (!modal || !iframe) return;

  urlText.textContent = url.replace('https://', '');
  externalBtn.onclick = () => {
    window.open(url, '_blank');
  };

  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = 1;
  }

  iframe.src = url;
  modal.classList.add('open');
}

/* =========================================================================
   15. Email Privacy Protection (Obfuscation) & Live Studio Clock
   ========================================================================= */
function initPatnaClock() {
  function updateTime() {
    const el = document.getElementById('live-patna-time');
    if (!el) return;
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    el.textContent = now.toLocaleTimeString('en-US', options) + ' IST';
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function initEmailObfuscation() {
  const elements = document.querySelectorAll('.obfuscated-email');
  elements.forEach(el => {
    const user = el.getAttribute('data-user') || 'zephyrdevsofficial';
    const domain = el.getAttribute('data-domain') || 'gmail.com';
    const email = `${user}@${domain}`;
    
    if (el.tagName === 'A') {
      el.href = `mailto:${email}`;
      if (!el.textContent.trim()) {
        el.textContent = email;
      }
    } else {
      el.textContent = email;
    }
  });
}


// ---------------------- Live Analytics Tracker & Manual Lead Manager ----------------------

// 1. Live Page View Tracker (Runs automatically on load)
(function trackLiveViews() {
  let stats = safeStorage.getItem('zephyr_analytics');
  if (stats) {
    stats = JSON.parse(stats);
  } else {
    stats = {
      visitors: 1248,
      pageviews: 4892,
      weeklyData: [420, 580, 490, 680, 810, 740, 930]
    };
  }
  
  // Accumulate views
  stats.pageviews += 1;
  
  // Check if unique visitor session
  if (!safeSessionStorage.getItem('zephyr_visitor_tracked')) {
    stats.visitors += 1;
    safeSessionStorage.setItem('zephyr_visitor_tracked', 'true');
  }
  
  dbState.analytics = stats;
  safeStorage.setItem('zephyr_analytics', JSON.stringify(stats));
})();

// 2. Live simulated traffic increments (Runs when dashboard is open)
window.startLiveAnalyticsSimulation = function() {
  if (window.liveAnalyticsInterval) clearInterval(window.liveAnalyticsInterval);
  
  window.liveAnalyticsInterval = setInterval(() => {
    if (!dbState.analytics) return;
    
    // Add pageviews (1-3)
    dbState.analytics.pageviews += Math.floor(Math.random() * 3) + 1;
    
    // Add visitor with 35% probability
    if (Math.random() > 0.65) {
      dbState.analytics.visitors += 1;
    }
    
    // Add traffic to the current week data index (last index)
    const lastIdx = dbState.analytics.weeklyData.length - 1;
    dbState.analytics.weeklyData[lastIdx] += Math.floor(Math.random() * 3) + 1;
    
    // Persist
    safeStorage.setItem('zephyr_analytics', JSON.stringify(dbState.analytics));
    
    // Re-render if Analytics tab is active
    const tab = document.getElementById('tab-analytics');
    if (tab && tab.classList.contains('active')) {
      renderAdminAnalytics();
    }
  }, 8000);
};

// 3. Toggle Add Lead manual overlay form
window.toggleAddLeadForm = function(show) {
  const form = document.getElementById('admin-add-lead-overlay');
  if (!form) return;
  
  if (show) {
    form.style.display = 'block';
    
    // Clear inputs
    document.getElementById('lead-form-name').value = '';
    document.getElementById('lead-form-email').value = '';
    document.getElementById('lead-form-phone').value = '';
    document.getElementById('lead-form-company').value = '';
    document.getElementById('lead-form-plan').value = 'Starter (₹1,999/yr)';
    document.getElementById('lead-form-desc').value = '';
    
    // Reset checkboxes
    document.querySelectorAll('input[name="lead-form-addons"]').forEach(cb => cb.checked = false);
    
    // Calculate initial budget
    calculateFormBudget();
    
    document.getElementById('lead-form-name').focus();
  } else {
    form.style.display = 'none';
  }
};

// 4. Calculate manual lead budget dynamically
window.calculateFormBudget = function() {
  const plan = document.getElementById('lead-form-plan').value;
  let basePrice = 1999;
  if (plan.includes('3,999')) basePrice = 3999;
  if (plan.includes('Enterprise')) basePrice = 15000;
  
  let addonPrice = 0;
  document.querySelectorAll('input[name="lead-form-addons"]:checked').forEach(() => {
    addonPrice += 1000;
  });
  
  const budgetInput = document.getElementById('lead-form-budget');
  if (budgetInput) {
    budgetInput.value = '₹' + (basePrice + addonPrice).toLocaleString();
  }
};

// 5. Save manual lead entry
window.saveManualLead = function() {
  const name = document.getElementById('lead-form-name').value.trim();
  const email = document.getElementById('lead-form-email').value.trim();
  const phone = document.getElementById('lead-form-phone').value.trim();
  const company = document.getElementById('lead-form-company').value.trim() || 'N/A';
  const plan = document.getElementById('lead-form-plan').value;
  const budget = document.getElementById('lead-form-budget').value.trim() || '₹1,999';
  const desc = document.getElementById('lead-form-desc').value.trim() || 'Manually added lead';
  
  if (!name || !email || !phone) {
    alert('Please fill out all required fields (*)');
    return;
  }
  
  const addonsSelected = [];
  document.querySelectorAll('input[name="lead-form-addons"]:checked').forEach(cb => {
    if (cb.value === 'SEO') addonsSelected.push('Advanced SEO Setup');
    if (cb.value === 'Chatbot') addonsSelected.push('AI Chatbot Integration');
    if (cb.value === 'Branding') addonsSelected.push('Brand Identity Kit');
  });
  
  const newLead = {
    id: 'lead_' + Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0],
    name: name,
    email: email,
    phone: phone,
    company: company,
    plan: plan,
    budget: budget,
    addons: addonsSelected.join(', ') || 'None',
    description: desc,
    status: 'New'
  };
  
  if (!dbState.leads) dbState.leads = [];
  dbState.leads.unshift(newLead);
  
  // Persist
  safeStorage.setItem('zephyr_leads', JSON.stringify(dbState.leads));
  
  // Close form overlay
  toggleAddLeadForm(false);
  
  // Refresh view
  renderAdminLeadsList();
  
  // Try sync with Firebase
  firebaseCall('saveLead', newLead).catch(err => console.warn(err));
  alert('Inquiry added successfully!');
};


// ---------------------- Live Client Reviews & Admin Approvals ----------------------
window.openReviewSubmissionModal = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const modal = document.getElementById('review-submission-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }
};

window.closeReviewSubmissionModal = function() {
  const modal = document.getElementById('review-submission-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

window.setReviewRating = function(rating) {
  document.getElementById('review-rating-val').value = rating;
  const stars = document.querySelectorAll('.star-rating-selector .star-btn');
  stars.forEach((s, idx) => {
    if (idx < rating) {
      s.classList.add('active');
      s.style.color = '#a3e635';
    } else {
      s.classList.remove('active');
      s.style.color = 'rgba(255,255,255,0.2)';
    }
  });
};

window.submitClientTestimonial = async function(event) {
  event.preventDefault();
  const name = document.getElementById('review-author-name').value.trim();
  const role = document.getElementById('review-author-role').value.trim();
  const rating = parseInt(document.getElementById('review-rating-val').value) || 5;
  const message = document.getElementById('review-message').value.trim();
  const avatar = document.getElementById('review-avatar-url').value.trim();

  if (!name || !role || !message) {
    alert('Please fill out all required fields.');
    return;
  }

  const id = 'review_' + Date.now();
  const testimonial = {
    id,
    name,
    role,
    rating,
    message,
    avatar: avatar || '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  try {
    await firebaseCall('submitTestimonial', { id, testimonial });
    closeReviewSubmissionModal();
    document.getElementById('review-form').reset();
    setReviewRating(5);
    alert('Thank you! Your client review has been submitted to the studio for approval.');
  } catch (err) {
    console.error('Failed to submit review:', err);
    alert('Failed to submit review: ' + err.message);
  }
};

function renderAdminPendingTestimonials() {
  const container = document.getElementById('admin-pending-reviews-list');
  const badge = document.getElementById('admin-reviews-badge');
  if (!container) return;

  container.innerHTML = '';
  const pending = dbState.pendingTestimonials || {};
  const keys = Object.keys(pending);

  if (badge) badge.textContent = `${keys.length} Pending`;

  if (keys.length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No pending reviews awaiting approval.</div>';
    return;
  }

  keys.forEach(key => {
    const r = pending[key];
    const div = document.createElement('div');
    div.className = 'admin-team-item';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';
    div.style.gap = '10px';

    const starsHtml = '★'.repeat(r.rating || 5);

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#fff; font-family:var(--font-display);">${r.name} <span style="color:#a3e635; font-size:0.8rem; margin-left:8px;">${starsHtml}</span></h4>
          <p style="margin:2px 0 0; font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${r.role}</p>
        </div>
        <div class="admin-team-actions">
          <button class="edit" style="background:#a3e635; color:#000; font-weight:700;" onclick="approveTestimonial('${key}')">Approve &amp; Publish</button>
          <button class="delete" onclick="deletePendingTestimonial('${key}')">Reject</button>
        </div>
      </div>
      <p style="margin:0; font-size:0.85rem; color:var(--text-secondary); line-height:1.5; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">${r.message}</p>
    `;
    container.appendChild(div);
  });
}

function renderAdminApprovedTestimonials() {
  const container = document.getElementById('admin-published-reviews-list');
  if (!container) return;

  container.innerHTML = '';
  const published = dbState.testimonials || {};
  const keys = Object.keys(published);

  if (keys.length === 0) {
    container.innerHTML = '<div style="color: var(--text-tertiary); font-size:0.85rem; font-family: var(--font-mono);">No published reviews on showcase.</div>';
    return;
  }

  keys.forEach(key => {
    const r = published[key];
    const div = document.createElement('div');
    div.className = 'admin-team-item';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';
    div.style.gap = '10px';

    const starsHtml = '★'.repeat(r.rating || 5);

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h4 style="margin:0; font-size:0.95rem; color:#fff; font-family:var(--font-display);">${r.name} <span style="color:#a3e635; font-size:0.8rem; margin-left:8px;">${starsHtml}</span></h4>
          <p style="margin:2px 0 0; font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${r.role}</p>
        </div>
        <div class="admin-team-actions">
          <button class="delete" onclick="deleteApprovedTestimonial('${key}')">Remove</button>
        </div>
      </div>
      <p style="margin:0; font-size:0.85rem; color:var(--text-secondary); line-height:1.5; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">${r.message}</p>
    `;
    container.appendChild(div);
  });
}

window.approveTestimonial = async function(id) {
  try {
    await firebaseCall('approveTestimonial', id);
  } catch (err) {
    console.error('Failed to approve testimonial:', err);
    alert('Failed to approve: ' + err.message);
  }
};

window.deletePendingTestimonial = async function(id) {
  if (!confirm('Reject and delete this review?')) return;
  try {
    await firebaseCall('deletePendingTestimonial', id);
  } catch (err) {
    console.error('Failed to delete pending testimonial:', err);
  }
};

window.deleteApprovedTestimonial = async function(id) {
  if (!confirm('Remove this published review from showcase?')) return;
  try {
    await firebaseCall('deleteApprovedTestimonial', id);
  } catch (err) {
    console.error('Failed to delete approved testimonial:', err);
  }
};

function handleTestimonialsUpdate(testimonialsData) {
  const container = document.querySelector('.testimonials-masonry');
  if (!container) return;

  if (!testimonialsData || Object.keys(testimonialsData).length === 0) return;

  container.innerHTML = '';
  Object.keys(testimonialsData).forEach(key => {
    const r = testimonialsData[key];
    if (!r || !r.name || !r.message) return;

    const card = document.createElement('div');
    card.className = 'testi-card glass-panel reveal reveal-scale in';
    card.style.opacity = '1';
    card.style.transform = 'none';

    const starsHtml = '★'.repeat(r.rating || 5);
    const initials = r.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const avatarHtml = (r.avatar && r.avatar.trim() !== '') ?
      `<img src="${r.avatar}" alt="${r.name}" class="testi-author-img" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:1px solid rgba(163,230,53,0.3);" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="testi-avatar-fallback" style="display:none; width:44px; height:44px; border-radius:50%; background:rgba(163,230,53,0.15); align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; color:#a3e635; border:1px solid rgba(163,230,53,0.3);">${initials}</div>` :
      `<div class="testi-avatar-fallback" style="width:44px; height:44px; border-radius:50%; background:rgba(163,230,53,0.15); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; color:#a3e635; border:1px solid rgba(163,230,53,0.3);">${initials}</div>`;

    card.innerHTML = `
      <div class="testi-stars" style="color:#a3e635; margin-bottom:12px; font-size:1.1rem;">${starsHtml}</div>
      <p class="testi-quote" style="font-size:0.92rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">"${r.message}"</p>
      <div class="testi-author" style="display:flex; align-items:center; gap:12px;">
        ${avatarHtml}
        <div>
          <div class="testi-name" style="font-family:var(--font-display); font-weight:700; color:var(--text-primary); font-size:0.95rem;">${r.name}</div>
          <div class="testi-role" style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">${r.role}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* =========================================================================
   18. Interactive 3D Card Tilt Effect
   ========================================================================= */
function init3DTilt() {
  const tiltElements = document.querySelectorAll('.service-card-v2, .testi-card, .team-card-v2, .project-row, .hero-bento-card');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const xPct = (x / width) - 0.5;
      const yPct = (y / height) - 0.5;
      const maxTiltX = 8;
      const maxTiltY = 8;
      const tiltY = xPct * maxTiltY;
      const tiltX = -yPct * maxTiltX;
      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// Bind to window for external/React initialization
window.initScrollReveal = initScrollReveal;
window.init3DTilt = init3DTilt;
