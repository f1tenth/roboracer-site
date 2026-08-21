# RoboRacer website

## F1TENTH assembly viewer

The `/assembly` route is a lightweight, interactive renderer for the visual
assembly defined in `../f1tenth_gym_ros/urdf/racecar_mesh.xacro`.

```bash
npm install
npm run dev
```

Open [http://localhost:5173/assembly](http://localhost:5173/assembly). The viewer
supports orbit/zoom controls, a continuous exploded-view slider, selectable and
hideable components, labels, wireframe mode, auto-rotation, and camera reset.
The `E` key toggles between assembled and exploded; `R` resets the camera.

The checked-in browser assets are copies of the ROS meshes. After changing or
re-exporting a mesh in `f1tenth_gym_ros/meshes`, refresh those copies with:

```bash
npm run sync:racecar
```

The download tool in the top-right toolbar exports
`f1tenth-xacro-assembly.gltf`. It always exports the complete assembly at the
canonical Xacro transforms, even when parts are hidden or the browser view is
exploded. The file uses meters and a Y-up coordinate system and can be imported
into Onshape as mesh geometry. It is useful as an assembly/layout reference,
but it is not editable parametric B-rep CAD; a STEP/Parasolid assembly requires
the original solid CAD or a reverse-engineering pass.

## Development stack

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
