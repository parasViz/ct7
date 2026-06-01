(function () {
  "use strict";

  let active = null;

  function destroy() {
    if (!active) return;
    active.destroy();
    active = null;
  }

  function mount(root, model) {
    destroy();

    if (!window.THREE) {
      root.classList.add("model-fallback");
      root.textContent = "The 3D model could not load.";
      return;
    }

    if (model.type === "steppedParallelFaces") {
      active = createSteppedParallelFaces(root);
      return;
    }

    if (model.type === "bridgeParallelEdges" || model.type === "uParallelEdges") {
      active = createUParallelEdges(root);
      return;
    }
  }

  function createSteppedParallelFaces(root) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    const group = new THREE.Group();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const target = new THREE.Vector3(0, 0, 0.95);
    const drag = { active: false, moved: false, x: 0, y: 0, mode: "rotate", button: 0 };
    let selectedFace = null;
    let hoveredFace = null;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const callout = document.createElement("p");
    callout.className = "question-model-callout";
    callout.textContent = "Drag: rotate. Shift/right-drag: move left/right. Click: inspect.";
    root.replaceChildren(renderer.domElement, callout);

    camera.position.set(0, -6.2, 3.6);
    camera.lookAt(target);

    scene.add(new THREE.AmbientLight(0xffffff, 1.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(4, -5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb9f6ff, 0.8);
    fill.position.set(-5, 3, 2);
    scene.add(fill);

    group.rotation.set(0, 0, 0);
    scene.add(group);
    const faces = buildSteppedSolid(THREE, group);

    const resize = () => {
      const width = Math.max(260, root.clientWidth || 520);
      const height = Math.max(220, Math.min(300, Math.round(width * 0.56)));
      group.scale.setScalar(width < 420 ? 0.8 : width < 520 ? 0.9 : 1);
      group.position.z = width < 420 ? 0.32 : 0;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    const applyFaceState = (faceId, color, selected) => {
      Object.values(faces).forEach((mesh) => {
        const isSelected = mesh.userData.faceId === faceId;
        mesh.material.transparent = true;
        mesh.material.opacity = faceId ? (isSelected ? 1 : 0.42) : 1;
        mesh.material.color.copy(isSelected ? new THREE.Color(color) : mesh.userData.baseColor);
        mesh.material.emissive = mesh.material.emissive || new THREE.Color(0x000000);
        mesh.material.emissive.set(isSelected ? color : "#000000");
        mesh.material.emissiveIntensity = isSelected ? (selected ? 0.22 : 0.14) : 0;
      });
    };

    const faceFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Object.values(faces), false)[0];
      return hit ? hit.object.userData.faceId : null;
    };

    const selectFace = (faceId) => {
      selectedFace = faceId;
      hoveredFace = null;
      applyFaceState(selectedFace, "#ff9eb5", true);
      callout.textContent = faceId
        ? `${FACE_LABELS[faceId]} selected. Drag to rotate or Shift/right-drag to move left/right.`
        : "Drag: rotate. Shift/right-drag: move left/right. Click: inspect.";
      render();
    };

    const previewFace = (faceId) => {
      if (faceId === hoveredFace) return;
      hoveredFace = faceId;
      const activeFace = hoveredFace || selectedFace;
      applyFaceState(activeFace, hoveredFace ? "#4c7cff" : "#ff9eb5", !hoveredFace);
      callout.textContent = hoveredFace
        ? `${FACE_LABELS[hoveredFace]} under mouse. Click to select it, or drag to rotate.`
        : selectedFace
          ? `${FACE_LABELS[selectedFace]} selected. Drag to rotate or Shift/right-drag to move left/right.`
          : "Drag: rotate. Shift/right-drag: move left/right. Click: inspect.";
      render();
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      drag.active = true;
      drag.moved = false;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.button = event.button;
      drag.mode = event.shiftKey || event.button === 2 ? "pan" : "rotate";
      root.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (drag.active) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 1) {
          drag.moved = true;
        }
        if (drag.mode === "pan") {
          group.position.x = clamp(group.position.x + dx * 0.007, -1.15, 1.15);
        } else {
          group.rotation.z += dx * 0.006;
          group.rotation.x = clamp(group.rotation.x + dy * 0.005, -0.95, 0.65);
        }
        render();
        return;
      }
      if (event.pointerType !== "mouse") return;
      previewFace(faceFromEvent(event));
    };

    const onPointerUp = (event) => {
      if (!drag.active) return;
      const shouldSelect = !drag.moved && drag.mode !== "pan";
      drag.active = false;
      root.releasePointerCapture?.(event.pointerId);
      if (shouldSelect) {
        selectFace(faceFromEvent(event));
      }
    };

    const onPointerLeave = () => {
      if (drag.active) return;
      previewFace(null);
    };

    const onContextMenu = (event) => {
      event.preventDefault();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("contextmenu", onContextMenu);

    resize();
    render();

    return {
      destroy() {
        observer.disconnect();
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("pointermove", onPointerMove);
        root.removeEventListener("pointerup", onPointerUp);
        root.removeEventListener("pointercancel", onPointerUp);
        root.removeEventListener("pointerleave", onPointerLeave);
        root.removeEventListener("contextmenu", onContextMenu);
        renderer.dispose();
        scene.traverse((object) => {
          if (!object.geometry) return;
          object.geometry.dispose();
        });
        root.innerHTML = "";
      }
    };
  }

  function createUParallelEdges(root) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    const group = new THREE.Group();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const target = new THREE.Vector3(0, 0, 0.08);
    const drag = { active: false, moved: false, x: 0, y: 0, mode: "rotate" };
    let selectedEdge = null;
    let hoveredEdge = null;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const callout = document.createElement("p");
    callout.className = "question-model-callout";
    callout.textContent = "Drag: rotate. Shift/right-drag: move. Click an edge to inspect.";
    root.replaceChildren(renderer.domElement, callout);

    camera.position.set(0.45, -7.3, 1.62);
    camera.lookAt(target);

    scene.add(new THREE.AmbientLight(0xffffff, 1.42));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(4, -5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff1bd, 0.85);
    fill.position.set(-5, 3, 3);
    scene.add(fill);

    scene.add(group);
    const { edgeMarkers } = buildUSolid(THREE, group, { mode: "question" });

    const render = () => renderer.render(scene, camera);

    const applyEdgeState = (edgeId, color, selected) => {
      edgeMarkers.forEach((marker) => {
        const isActive = marker.userData.edgeId === edgeId;
        const isRed = marker.userData.edgeId === "frontInnerBottom";
        marker.material.transparent = true;
        marker.material.opacity = isActive ? 1 : isRed ? 0.98 : 0;
        marker.material.color.set(isActive ? color : isRed ? "#ff2637" : "#4c7cff");
        marker.material.emissive = marker.material.emissive || new THREE.Color(0x000000);
        marker.material.emissive.set(isActive ? color : isRed ? "#ff2637" : "#000000");
        marker.material.emissiveIntensity = isActive ? (selected ? 0.2 : 0.12) : isRed ? 0.18 : 0;
      });
    };

    const edgeFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(edgeMarkers, false)[0];
      return hit ? hit.object.userData.edgeId : null;
    };

    const edgeLabel = (edgeId) => U_EDGE_LABELS[edgeId] || "Edge";

    const selectEdge = (edgeId) => {
      selectedEdge = edgeId;
      hoveredEdge = null;
      applyEdgeState(edgeId, "#4c7cff", true);
      callout.textContent = edgeId
        ? `${edgeLabel(edgeId)} selected. Count every outer edge that runs this same way.`
        : "Drag: rotate. Shift/right-drag: move. Click an edge to inspect.";
      render();
    };

    const previewEdge = (edgeId) => {
      if (edgeId === hoveredEdge) return;
      hoveredEdge = edgeId;
      const activeEdge = hoveredEdge || selectedEdge;
      applyEdgeState(activeEdge, hoveredEdge ? "#118ab2" : "#4c7cff", !hoveredEdge);
      callout.textContent = hoveredEdge
        ? `${edgeLabel(hoveredEdge)} under mouse. Click to inspect it.`
        : selectedEdge
          ? `${edgeLabel(selectedEdge)} selected. Count every outer edge that runs this same way.`
          : "Drag: rotate. Shift/right-drag: move. Click an edge to inspect.";
      render();
    };

    const resize = () => {
      const width = Math.max(260, root.clientWidth || 520);
      const height = Math.max(230, Math.min(310, Math.round(width * 0.57)));
      group.scale.setScalar(width < 420 ? 0.66 : width < 520 ? 0.76 : 0.82);
      group.position.z = width < 420 ? 0.24 : 0.18;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      drag.active = true;
      drag.moved = false;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.mode = event.shiftKey || event.button === 2 ? "pan" : "rotate";
      root.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (drag.active) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 1) {
          drag.moved = true;
        }
        if (drag.mode === "pan") {
          group.position.x = clamp(group.position.x + dx * 0.007, -1.1, 1.1);
        } else {
          group.rotation.z += dx * 0.006;
          group.rotation.x = clamp(group.rotation.x + dy * 0.005, -0.9, 0.7);
        }
        render();
        return;
      }
      if (event.pointerType !== "mouse") return;
      previewEdge(edgeFromEvent(event));
    };

    const onPointerUp = (event) => {
      if (!drag.active) return;
      const shouldSelect = !drag.moved && drag.mode !== "pan";
      drag.active = false;
      root.releasePointerCapture?.(event.pointerId);
      if (shouldSelect) {
        selectEdge(edgeFromEvent(event));
      }
    };

    const onPointerLeave = () => {
      if (drag.active) return;
      previewEdge(null);
    };

    const onContextMenu = (event) => {
      event.preventDefault();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("contextmenu", onContextMenu);

    resize();
    render();

    return {
      destroy() {
        observer.disconnect();
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("pointermove", onPointerMove);
        root.removeEventListener("pointerup", onPointerUp);
        root.removeEventListener("pointercancel", onPointerUp);
        root.removeEventListener("pointerleave", onPointerLeave);
        root.removeEventListener("contextmenu", onContextMenu);
        renderer.dispose();
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose?.());
          } else {
            object.material?.dispose?.();
          }
        });
        root.innerHTML = "";
      }
    };
  }

  const FACE_LABELS = {
    front: "Front face",
    back: "Back face",
    bottom: "Bottom face",
    rightSide: "Right side face",
    upperTop: "Upper top face",
    innerStep: "Inner step face",
    lowerTop: "Lower top face",
    leftSide: "Left side face"
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const FACE_PAIRS = [
    {
      label: "Pair 1",
      title: "Front face and back face",
      shortTitle: "Front + back",
      faces: ["front", "back"],
      color: "#118ab2"
    },
    {
      label: "Pair 2",
      title: "Bottom face and lower top face",
      shortTitle: "Bottom + lower top",
      faces: ["bottom", "lowerTop"],
      color: "#06d6a0"
    },
    {
      label: "Pair 3",
      title: "Bottom face and upper top face",
      shortTitle: "Bottom + upper top",
      faces: ["bottom", "upperTop"],
      color: "#ffd166"
    },
    {
      label: "Pair 4",
      title: "Lower top face and upper top face",
      shortTitle: "Lower top + upper top",
      faces: ["lowerTop", "upperTop"],
      color: "#f95877"
    },
    {
      label: "Pair 5",
      title: "Right side face and inner step face",
      shortTitle: "Right side + inner step",
      faces: ["rightSide", "innerStep"],
      color: "#ef7140"
    },
    {
      label: "Pair 6",
      title: "Right side face and left side face",
      shortTitle: "Right side + left side",
      faces: ["rightSide", "leftSide"],
      color: "#8a5cf6"
    },
    {
      label: "Pair 7",
      title: "Inner step face and left side face",
      shortTitle: "Inner step + left side",
      faces: ["innerStep", "leftSide"],
      color: "#2fbf71"
    }
  ];

  const U_FRONT_EDGES = ["frontOuterBottom", "frontInnerBottom", "frontLeftTop", "frontRightTop"];
  const U_BACK_EDGES = ["backOuterBottom", "backInnerBottom", "backLeftTop", "backRightTop"];
  const U_EDGE_LABELS = {
    frontOuterBottom: "Front outer bottom edge",
    frontInnerBottom: "Red inside bottom edge",
    frontLeftTop: "Front left arm top edge",
    frontRightTop: "Front right arm top edge",
    backOuterBottom: "Back outer bottom edge",
    backInnerBottom: "Back inside bottom edge",
    backLeftTop: "Back left arm top edge",
    backRightTop: "Back right arm top edge"
  };

  const U_EDGE_HINT_STEPS = [
    {
      label: "Front",
      shortTitle: "Front edges: 4",
      title: "Four front edges run in the same direction as the red edge.",
      edges: U_FRONT_EDGES,
      color: "#118ab2"
    },
    {
      label: "Back",
      shortTitle: "Back edges: 4",
      title: "The same four matching edges appear on the back face.",
      edges: U_BACK_EDGES,
      color: "#8a5cf6"
    }
  ];

  function buildSteppedSolid(THREE, group) {
    const materials = {
      front: faceMaterial(THREE, "#3f8f9c"),
      back: faceMaterial(THREE, "#75c8d2"),
      top: faceMaterial(THREE, "#74d957"),
      side: faceMaterial(THREE, "#f23b4b"),
      sideAlt: faceMaterial(THREE, "#ff7f66"),
      bottom: faceMaterial(THREE, "#ffd166")
    };
    const p0 = [-1, 0];
    const p1 = [1, 0];
    const p2 = [1, 2];
    const p3 = [0, 2];
    const p4 = [0, 1];
    const p5 = [-1, 1];
    const m = [1, 1];
    const faces = {};

    faces.front = addFace(THREE, group, [
      point3(p0, -0.55), point3(p1, -0.55), point3(m, -0.55),
      point3(p0, -0.55), point3(m, -0.55), point3(p4, -0.55),
      point3(p0, -0.55), point3(p4, -0.55), point3(p5, -0.55),
      point3(p4, -0.55), point3(m, -0.55), point3(p2, -0.55),
      point3(p4, -0.55), point3(p2, -0.55), point3(p3, -0.55)
    ], materials.front.clone(), "front");

    faces.back = addFace(THREE, group, [
      point3(p0, 0.55), point3(m, 0.55), point3(p1, 0.55),
      point3(p0, 0.55), point3(p4, 0.55), point3(m, 0.55),
      point3(p0, 0.55), point3(p5, 0.55), point3(p4, 0.55),
      point3(p4, 0.55), point3(p2, 0.55), point3(m, 0.55),
      point3(p4, 0.55), point3(p3, 0.55), point3(p2, 0.55)
    ], materials.back.clone(), "back");

    faces.bottom = addSide(THREE, group, p0, p1, materials.bottom.clone(), "bottom");
    faces.rightSide = addSide(THREE, group, p1, p2, materials.side.clone(), "rightSide");
    faces.upperTop = addSide(THREE, group, p2, p3, materials.top.clone(), "upperTop");
    faces.innerStep = addSide(THREE, group, p3, p4, materials.sideAlt.clone(), "innerStep");
    faces.lowerTop = addSide(THREE, group, p4, p5, materials.top.clone(), "lowerTop");
    faces.leftSide = addSide(THREE, group, p5, p0, materials.sideAlt.clone(), "leftSide");

    Object.values(faces).forEach((mesh) => {
      mesh.userData.baseColor = mesh.material.color.clone();
    });
    return faces;
  }

  function point3(point, y) {
    return [point[0], y, point[1]];
  }

  function addSide(THREE, group, a, b, material, faceId) {
    return addQuad(THREE, group, point3(a, -0.55), point3(b, -0.55), point3(b, 0.55), point3(a, 0.55), material, faceId);
  }

  function addQuad(THREE, group, a, b, c, d, material, faceId) {
    return addFace(THREE, group, [a, b, c, a, c, d], material, faceId);
  }

  function addFace(THREE, group, points, material, faceId) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.faceId = faceId;
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 1),
      new THREE.LineBasicMaterial({ color: 0x172034, linewidth: 2 })
    );
    group.add(mesh, edges);
    return mesh;
  }

  function faceMaterial(THREE, color) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.62,
      metalness: 0.03,
      side: THREE.DoubleSide
    });
  }

  function buildUSolid(THREE, group, options = {}) {
    const depth = 1.24;
    const centerZ = 1.5;
    const shape = new THREE.Shape();
    const mode = options.mode || "question";

    shape.moveTo(-2, 0);
    shape.lineTo(2, 0);
    shape.lineTo(2, 3);
    shape.lineTo(1, 3);
    shape.lineTo(1, 1);
    shape.lineTo(-1, 1);
    shape.lineTo(-1, 3);
    shape.lineTo(-2, 3);
    shape.lineTo(-2, 0);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false
    });
    const position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const vertical = position.getY(i);
      const extruded = position.getZ(i);
      position.setXYZ(i, x, extruded - depth / 2, vertical - centerZ);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: "#7dd6c5",
      roughness: 0.58,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: mode === "hint",
      opacity: mode === "hint" ? 0.9 : 1
    });
    const mesh = new THREE.Mesh(geometry, material);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 1),
      new THREE.LineBasicMaterial({ color: 0x172034 })
    );
    group.add(mesh, edges);

    const edgeMarkers = uEdgeSegments(THREE, depth, centerZ).map((segment) => {
      const isRed = segment.id === "frontInnerBottom";
      return addEdgeMarker(THREE, group, segment, {
        color: isRed ? "#ff2637" : "#4c7cff",
        opacity: mode === "question" && isRed ? 0.98 : 0,
        radius: mode === "hint" ? 0.052 : 0.047
      });
    });

    return { mesh, edgeMarkers };
  }

  function uEdgeSegments(THREE, depth, centerZ) {
    const frontY = -depth / 2 - 0.024;
    const backY = depth / 2 + 0.024;
    const z = (value) => value - centerZ;
    const make = (id, startX, endX, y, vertical) => ({
      id,
      label: U_EDGE_LABELS[id],
      start: new THREE.Vector3(startX, y, z(vertical)),
      end: new THREE.Vector3(endX, y, z(vertical))
    });

    return [
      make("frontOuterBottom", -2, 2, frontY, 0),
      make("frontInnerBottom", -1, 1, frontY, 1),
      make("frontLeftTop", -2, -1, frontY, 3),
      make("frontRightTop", 1, 2, frontY, 3),
      make("backOuterBottom", -2, 2, backY, 0),
      make("backInnerBottom", -1, 1, backY, 1),
      make("backLeftTop", -2, -1, backY, 3),
      make("backRightTop", 1, 2, backY, 3)
    ];
  }

  function addEdgeMarker(THREE, group, segment, options = {}) {
    const direction = new THREE.Vector3().subVectors(segment.end, segment.start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(options.radius || 0.04, options.radius || 0.04, length, 24);
    const color = options.color || "#4c7cff";
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.34,
      metalness: 0.04,
      transparent: true,
      opacity: options.opacity ?? 1,
      emissive: new THREE.Color(color),
      emissiveIntensity: options.opacity ? 0.18 : 0
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.userData.edgeId = segment.id;
    marker.userData.label = segment.label;
    marker.position.copy(segment.start).add(segment.end).multiplyScalar(0.5);
    marker.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    marker.renderOrder = 5;
    group.add(marker);
    return marker;
  }

  function parallelFacePairsHint() {
    const buttonForPair = (pair, index) => `
      <button class="solid-face-pair-button" type="button" data-pair="${index}" style="--pair-color: ${pair.color}">
        <span>${pair.label}</span>
        <strong>${pair.shortTitle}</strong>
      </button>
    `;
    const rows = [
      FACE_PAIRS.slice(0, 1),
      FACE_PAIRS.slice(1, 4),
      FACE_PAIRS.slice(4, 7)
    ].map((row, rowIndex) => `
      <div class="solid-face-pair-row solid-face-pair-row-${rowIndex + 1}">
        ${row.map((pair) => buttonForPair(pair, FACE_PAIRS.indexOf(pair))).join("")}
      </div>
    `).join("");

    return `
      <p class="hint-focus"><span>Pairs</span><strong>Drag the 3D solid to rotate it. Shift-drag or right-drag to move it left and right. Click a pair button to highlight matching faces.</strong></p>
      <div class="solid-face-pair-hint">
        <div class="solid-face-pair-stage" role="img" aria-label="3D hint showing highlighted pairs of parallel faces"></div>
        <div class="solid-face-pair-controls" aria-label="Parallel face pairs">
          ${rows}
        </div>
        <p class="solid-face-pair-status" aria-live="polite"></p>
      </div>
    `;
  }

  function mountParallelFacePairsHint(root) {
    if (!window.THREE) {
      root.innerHTML = `<div class="sketch-fallback">The 3D hint is still loading. Try reopening the hint.</div>`;
      return null;
    }

    const THREE = window.THREE;
    const stage = root.querySelector(".solid-face-pair-stage");
    const buttons = Array.from(root.querySelectorAll(".solid-face-pair-button"));
    const status = root.querySelector(".solid-face-pair-status");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    const group = new THREE.Group();
    const target = new THREE.Vector3(0, 0, 0.92);
    const drag = { active: false, x: 0, y: 0, mode: "rotate" };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.replaceChildren(renderer.domElement);

    camera.position.set(0, -6.2, 3.6);
    camera.lookAt(target);
    scene.add(new THREE.AmbientLight(0xffffff, 1.45));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(4, -5, 6);
    scene.add(key);

    group.rotation.set(0, 0, 0);
    scene.add(group);
    const faces = buildSteppedSolid(THREE, group);

    const render = () => renderer.render(scene, camera);
    const setPair = (index) => {
      const pair = FACE_PAIRS[index] || FACE_PAIRS[0];
      const highlighted = new Set(pair.faces);
      Object.values(faces).forEach((mesh) => {
        const isOn = highlighted.has(mesh.userData.faceId);
        mesh.material.transparent = true;
        mesh.material.opacity = isOn ? 1 : 0.2;
        mesh.material.color.copy(isOn ? new THREE.Color(pair.color) : mesh.userData.baseColor);
        mesh.material.emissive = mesh.material.emissive || new THREE.Color(0x000000);
        mesh.material.emissive.set(isOn ? pair.color : "#000000");
        mesh.material.emissiveIntensity = isOn ? 0.18 : 0;
        mesh.renderOrder = isOn ? 2 : 1;
      });
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (status) {
        status.textContent = `${pair.label}: ${pair.title}.`;
      }
      render();
    };

    const resize = () => {
      const width = Math.max(280, stage.clientWidth || 560);
      const height = Math.max(300, Math.min(430, Math.round(width * 0.58)));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.mode = event.shiftKey || event.button === 2 ? "pan" : "rotate";
      stage.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (drag.mode === "pan") {
        group.position.x = clamp(group.position.x + dx * 0.007, -1.15, 1.15);
      } else {
        group.rotation.z += dx * 0.006;
        group.rotation.x = clamp(group.rotation.x + dy * 0.005, -0.95, 0.65);
      }
      render();
    };

    const onPointerUp = (event) => {
      drag.active = false;
      stage.releasePointerCapture?.(event.pointerId);
    };

    const onContextMenu = (event) => {
      event.preventDefault();
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setPair(index));
      button.addEventListener("mouseenter", () => setPair(index));
      button.addEventListener("focus", () => setPair(index));
    });

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("contextmenu", onContextMenu);

    resize();
    setPair(0);

    return {
      remove() {
        observer.disconnect();
        stage.removeEventListener("pointerdown", onPointerDown);
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerup", onPointerUp);
        stage.removeEventListener("pointercancel", onPointerUp);
        stage.removeEventListener("contextmenu", onContextMenu);
        renderer.dispose();
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          object.material?.dispose?.();
        });
        root.innerHTML = "";
      }
    };
  }

  function uParallelEdgesHint() {
    const buttonForStep = (step, index) => `
      <button class="solid-face-pair-button" type="button" data-edge-step="${index}" style="--pair-color: ${step.color}">
        <span>${step.label}</span>
        <strong>${step.shortTitle}</strong>
      </button>
    `;
    const rows = [U_EDGE_HINT_STEPS].map((row) => `
      <div class="solid-face-pair-row u-edge-row">
        ${row.map((step) => buttonForStep(step, U_EDGE_HINT_STEPS.indexOf(step))).join("")}
      </div>
    `).join("");

    return `
      <p class="hint-focus"><span>Edges</span><strong>Drag the U-shaped solid to rotate it. Click a button to highlight the edge group being counted.</strong></p>
      <div class="solid-face-pair-hint u-parallel-edge-hint">
        <div class="solid-face-pair-stage u-parallel-edge-stage" role="img" aria-label="3D hint showing parallel edge groups on a U-shaped solid"></div>
        <div class="solid-face-pair-controls" aria-label="Parallel edge counting steps">
          ${rows}
        </div>
        <p class="solid-face-pair-status" aria-live="polite"></p>
      </div>
    `;
  }

  function mountUParallelEdgesHint(root) {
    if (!window.THREE) {
      root.innerHTML = `<div class="sketch-fallback">The 3D hint is still loading. Try reopening the hint.</div>`;
      return null;
    }

    const THREE = window.THREE;
    const stage = root.querySelector(".u-parallel-edge-stage");
    const buttons = Array.from(root.querySelectorAll(".solid-face-pair-button"));
    const status = root.querySelector(".solid-face-pair-status");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    const group = new THREE.Group();
    const target = new THREE.Vector3(0, 0, 0.08);
    const drag = { active: false, x: 0, y: 0, mode: "rotate" };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.replaceChildren(renderer.domElement);

    camera.position.set(0.45, -7.3, 1.62);
    camera.lookAt(target);
    scene.add(new THREE.AmbientLight(0xffffff, 1.42));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(4, -5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff1bd, 0.82);
    fill.position.set(-5, 3, 3);
    scene.add(fill);

    scene.add(group);
    const { edgeMarkers } = buildUSolid(THREE, group, { mode: "hint" });

    const render = () => renderer.render(scene, camera);
    const setStep = (index) => {
      const step = U_EDGE_HINT_STEPS[index] || U_EDGE_HINT_STEPS[0];
      const highlighted = new Set(step.edges);
      edgeMarkers.forEach((marker) => {
        const isOn = highlighted.has(marker.userData.edgeId);
        const isRed = marker.userData.edgeId === "frontInnerBottom";
        const activeColor = isRed ? "#ff2637" : step.color;
        marker.material.transparent = true;
        marker.material.opacity = isOn ? 1 : isRed ? 0.28 : 0;
        marker.material.color.set(isOn ? activeColor : "#4c7cff");
        marker.material.emissive = marker.material.emissive || new THREE.Color(0x000000);
        marker.material.emissive.set(isOn ? activeColor : "#000000");
        marker.material.emissiveIntensity = isOn ? 0.2 : 0;
        marker.renderOrder = isOn ? 5 : 1;
      });
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (status) {
        status.textContent = `${step.label}: ${step.title}`;
      }
      render();
    };

    const resize = () => {
      const width = Math.max(280, stage.clientWidth || 560);
      const height = Math.max(300, Math.min(430, Math.round(width * 0.58)));
      group.scale.setScalar(width < 420 ? 0.66 : width < 520 ? 0.76 : 0.82);
      group.position.z = width < 420 ? 0.18 : 0.12;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.mode = event.shiftKey || event.button === 2 ? "pan" : "rotate";
      stage.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (drag.mode === "pan") {
        group.position.x = clamp(group.position.x + dx * 0.007, -1.1, 1.1);
      } else {
        group.rotation.z += dx * 0.006;
        group.rotation.x = clamp(group.rotation.x + dy * 0.005, -0.9, 0.7);
      }
      render();
    };

    const onPointerUp = (event) => {
      drag.active = false;
      stage.releasePointerCapture?.(event.pointerId);
    };

    const onContextMenu = (event) => {
      event.preventDefault();
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setStep(index));
      button.addEventListener("mouseenter", () => setStep(index));
      button.addEventListener("focus", () => setStep(index));
    });

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("contextmenu", onContextMenu);

    resize();
    setStep(0);

    return {
      remove() {
        observer.disconnect();
        stage.removeEventListener("pointerdown", onPointerDown);
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerup", onPointerUp);
        stage.removeEventListener("pointercancel", onPointerUp);
        stage.removeEventListener("contextmenu", onContextMenu);
        renderer.dispose();
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose?.());
          } else {
            object.material?.dispose?.();
          }
        });
        root.innerHTML = "";
      }
    };
  }

  const hintRenderers = window.__ct7HintRenderers || (window.__ct7HintRenderers = {});
  const hintMounters = window.__ct7HintMounters || (window.__ct7HintMounters = {});
  hintRenderers.parallelFacePairs3d = parallelFacePairsHint;
  hintMounters.parallelFacePairs3d = {
    selector: ".solid-face-pair-hint",
    mount: mountParallelFacePairsHint
  };
  hintRenderers.uParallelEdges3d = uParallelEdgesHint;
  hintMounters.uParallelEdges3d = {
    selector: ".u-parallel-edge-hint",
    mount: mountUParallelEdgesHint
  };

  window.CT7SolidVisuals = { destroy, mount };
})();
