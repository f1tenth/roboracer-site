import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect } from 'react';

const Model = () => {
  const glb = useGLTF('models/anim_2.glb'); // Make sure it's in `public/anim_2.glb`
  const { animations } = glb;
  const { actions } = useAnimations(animations, glb.scene);

  useEffect(() => {
    if (actions) {
      // Play the first animation by default
      actions[Object.keys(actions)[0]]?.play();
    }
  }, [actions]);

  return <primitive object={glb.scene} />;
};

export default Model;
